/**
 * DOC OS — Intake Engine
 * Receives, classifies, and routes inbound submissions.
 * The intake-agent (MCP) augments classification via Claude.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import { runAgent } from "@doc/mcp-runtime";

export interface IntakeCreateInput {
  channel: string;
  submittedByEmail?: string;
  submittedByName?: string;
  rawData: Record<string, unknown>;
  ipAddress?: string;
  documentIds?: string[];
}

/**
 * Accept a new intake submission.
 * Immediately triggers async classification via the intake agent.
 */
export async function acceptIntake(input: IntakeCreateInput): Promise<{ id: string }> {
  const submission = await prisma.intakeSubmission.create({
    data: {
      channel: input.channel as any,
      intakeType: "investor", // default — will be overwritten by classification
      status: "received",
      submittedByEmail: input.submittedByEmail,
      submittedByName: input.submittedByName,
      rawData: input.rawData,
      ipAddress: input.ipAddress,
    },
  });

  await writeAuditEvent({
    eventType: "intake_received",
    targetType: "intake_submission",
    targetId: submission.id,
    summary: `Intake received via ${input.channel} from ${input.submittedByEmail ?? "unknown"}`,
    metadata: { channel: input.channel },
  });

  // Kick off async classification — don't await to avoid blocking response
  classifyIntake(submission.id).catch((e) =>
    console.error(`[intake-engine] Classification failed for ${submission.id}:`, e)
  );

  return { id: submission.id };
}

/**
 * Classify an intake submission using the intake agent.
 * Updates the record with classification results and triggers routing.
 */
export async function classifyIntake(submissionId: string): Promise<void> {
  const submission = await prisma.intakeSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) throw new Error(`Intake not found: ${submissionId}`);

  await prisma.intakeSubmission.update({
    where: { id: submissionId },
    data: { status: "classifying" },
  });

  let classificationJson: Record<string, unknown>;

  try {
    const result = await runAgent({
      agentSlug: "intake-agent",
      input: {
        submissionId,
        channel: submission.channel,
        submittedByEmail: submission.submittedByEmail,
        rawData: submission.rawData,
        task: "classify",
      },
    });

    // Parse structured classification from agent output
    classificationJson = parseClassification(result.completion);
  } catch {
    // Fallback: mark as needing manual review
    classificationJson = { intakeType: "inquiry", urgency: "medium", confidence: 0, manualReview: true };
  }

  await prisma.intakeSubmission.update({
    where: { id: submissionId },
    data: {
      status: "routed",
      classifiedAt: new Date(),
      classificationJson,
      intakeType: (classificationJson["intakeType"] as any) ?? "investor",
    },
  });

  await writeAuditEvent({
    eventType: "intake_classified",
    targetType: "intake_submission",
    targetId: submissionId,
    summary: `Intake classified as ${classificationJson["intakeType"]} (confidence: ${classificationJson["confidence"]})`,
    metadata: classificationJson,
  });
}

/**
 * Route a classified intake to a representative.
 */
export async function routeIntake(submissionId: string, repId: string, userId: string): Promise<void> {
  await prisma.intakeSubmission.update({
    where: { id: submissionId },
    data: {
      status: "in_review",
      routedAt: new Date(),
      routedToRepId: repId,
      routedToUserId: userId,
    },
  });

  await writeAuditEvent({
    eventType: "intake_routed",
    actorId: userId,
    targetType: "intake_submission",
    targetId: submissionId,
    summary: `Intake routed to rep ${repId}`,
    metadata: { repId, userId },
  });
}

function parseClassification(completion: string): Record<string, unknown> {
  try {
    // Try to extract JSON block from agent response
    const jsonMatch = completion.match(/```json\s*([\s\S]+?)\s*```/);
    if (jsonMatch?.[1]) {
      return JSON.parse(jsonMatch[1]) as Record<string, unknown>;
    }
    // Try direct parse
    return JSON.parse(completion) as Record<string, unknown>;
  } catch {
    return { intakeType: "inquiry", urgency: "medium", confidence: 0.5, raw: completion };
  }
}
