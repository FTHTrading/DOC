/**
 * DOC OS — Seed Data
 * Creates demo data representative of Doc Lisa's BD platform workflows.
 */
import { PrismaClient, UserRole, ParticipantType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DOC OS database...");

  // ── Organization ────────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: "org_doc_main" },
    update: {},
    create: {
      id: "org_doc_main",
      name: "DOC Capital Partners",
      legalEntityType: "LLC",
      jurisdiction: "US",
    },
  });
  console.log("✅ Organization:", org.name);

  // ── Users ────────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@doc.unykorn.org" },
    update: {},
    create: {
      email: "admin@doc.unykorn.org",
      name: "Doc Lisa",
      role: UserRole.super_admin,
      organizationId: org.id,
    },
  });

  const compUser = await prisma.user.upsert({
    where: { email: "compliance@doc.unykorn.org" },
    update: {},
    create: {
      email: "compliance@doc.unykorn.org",
      name: "Compliance Officer",
      role: UserRole.compliance,
      organizationId: org.id,
    },
  });

  const supervisorUser = await prisma.user.upsert({
    where: { email: "supervisor@doc.unykorn.org" },
    update: {},
    create: {
      email: "supervisor@doc.unykorn.org",
      name: "Regional Supervisor",
      role: UserRole.supervisor,
      organizationId: org.id,
    },
  });

  const repUser = await prisma.user.upsert({
    where: { email: "rep@doc.unykorn.org" },
    update: {},
    create: {
      email: "rep@doc.unykorn.org",
      name: "Alex Meridian",
      role: UserRole.representative,
      organizationId: org.id,
    },
  });
  console.log("✅ Users created");

  // ── Representatives ──────────────────────────────────────────────────────────
  const supervisorRep = await prisma.representative.upsert({
    where: { userId: supervisorUser.id },
    update: {},
    create: {
      userId: supervisorUser.id,
      crdNumber: "CRD-000001",
      namespaceSlug: "supervisor-main",
    },
  });

  const rep = await prisma.representative.upsert({
    where: { userId: repUser.id },
    update: {},
    create: {
      userId: repUser.id,
      crdNumber: "CRD-000002",
      namespaceSlug: "alex-meridian",
      supervisorId: supervisorRep.id,
    },
  });
  console.log("✅ Representatives created");

  // ── Participants ─────────────────────────────────────────────────────────────
  const investor = await prisma.participant.upsert({
    where: { email: "investor@example.com" },
    update: {},
    create: {
      organizationId: org.id,
      originRepId: rep.id,
      participantType: ParticipantType.investor,
      legalName: "Jane Thornfield",
      email: "investor@example.com",
      phone: "+1-555-0100",
      jurisdiction: "US",
    },
  });

  const issuer = await prisma.participant.upsert({
    where: { email: "issuer@example.com" },
    update: {},
    create: {
      organizationId: org.id,
      originRepId: rep.id,
      participantType: ParticipantType.issuer,
      legalName: "Thornfield Capital LLC",
      email: "issuer@example.com",
      jurisdiction: "US",
      entityType: "LLC",
    },
  });
  console.log("✅ Participants created");

  // ── KYC Cases ────────────────────────────────────────────────────────────────
  await prisma.kycCase.upsert({
    where: { participantId: investor.id },
    update: {},
    create: {
      participantId: investor.id,
      status: "under_review",
      riskScore: 25,
    },
  });
  console.log("✅ KYC case created");

  // ── Product ──────────────────────────────────────────────────────────────────
  const product = await prisma.product.upsert({
    where: { id: "prod_rwa_001" },
    update: {},
    create: {
      id: "prod_rwa_001",
      productType: "rwa_token",
      name: "DOC RWA Pool Series A",
      ticker: "DRWA-A",
      description: "Tokenized real-world asset pool — commercial credit",
      minimumInvestment: 50000,
      currency: "USD",
      isAccreditedOnly: true,
    },
  });

  const offering = await prisma.offering.upsert({
    where: { id: "off_001" },
    update: {},
    create: {
      id: "off_001",
      productId: product.id,
      name: "DRWA-A Series A Round",
      targetRaise: 5000000,
      currency: "USD",
      status: "active",
      isAccreditedOnly: true,
    },
  });
  console.log("✅ Product + Offering created");

  // ── Deal Room ────────────────────────────────────────────────────────────────
  const dealRoom = await prisma.dealRoom.upsert({
    where: { id: "deal_001" },
    update: {},
    create: {
      id: "deal_001",
      offeringId: offering.id,
      name: "DRWA-A Investors Room",
      description: "Secure deal room for DRWA Series A",
      status: "active",
    },
  });
  console.log("✅ Deal room created");

  // ── Agent Definitions ────────────────────────────────────────────────────────
  const agentDefs = [
    {
      slug: "intake-agent",
      name: "Intake Agent",
      purpose: "Classify and route inbound intake submissions",
      allowedTools: ["classify_intake", "route_intake", "fetch_participant", "create_task"],
      forbiddenActions: ["approve_payout", "modify_kyc_status"],
      systemPrompt: "You are the DOC OS Intake Agent. Your role is to analyze inbound submissions, classify their type and urgency, identify the best representative to route them to, and create follow-up tasks. You must never approve compliance outcomes or modify regulatory records. Always route high-risk or ambiguous submissions to the compliance team.",
    },
    {
      slug: "compliance-assistant",
      name: "Compliance Assistant Agent",
      purpose: "Answer compliance questions and surface exception flags",
      allowedTools: ["fetch_kyc_case", "fetch_accreditation", "fetch_compliance_gate", "search_regulations", "create_exception_flag"],
      forbiddenActions: ["approve_kyc", "override_compliance_gate", "approve_payout"],
      systemPrompt: "You are the DOC OS Compliance Assistant. You help supervisors and compliance officers understand the compliance status of participants, identify exceptions, and answer questions about regulatory requirements. You must never approve compliance status changes — you may only flag and surface information.",
    },
    {
      slug: "relationship-intelligence",
      name: "Relationship Intelligence Agent",
      purpose: "Analyze relationship graph and surface insights about participants",
      allowedTools: ["fetch_participant", "fetch_relationship_graph", "search_participants", "fetch_deal_room"],
      forbiddenActions: ["create_participant", "modify_kyc_status", "approve_payout"],
      systemPrompt: "You are the DOC OS Relationship Intelligence Agent. Analyze participant relationships, pipeline health, and rep performance. You provide data-driven insights but never modify records.",
    },
    {
      slug: "communications-drafting",
      name: "Communications Drafting Agent",
      purpose: "Draft compliant investor communications",
      allowedTools: ["draft_message", "fetch_participant", "fetch_disclosure_status", "fetch_offering"],
      forbiddenActions: ["send_message", "approve_payout", "modify_kyc_status"],
      systemPrompt: "You are the DOC OS Communications Drafting Agent. Draft clear, compliant investor communications following SEC/FINRA disclosure requirements. Drafts must be reviewed by a human before sending. Never send messages autonomously.",
    },
    {
      slug: "executive-summary",
      name: "Executive Summary Agent",
      purpose: "Generate executive-level dashboards and summaries",
      allowedTools: ["fetch_dashboard_metrics", "fetch_workflow_runs", "fetch_compliance_summary", "fetch_comp_summary"],
      forbiddenActions: ["approve_payout", "modify_kyc_status"],
      systemPrompt: "You are the DOC OS Executive Summary Agent. You generate concise, accurate executive summaries of platform activity, compliance status, pipeline health, and compensation data. You only read data — never write or approve.",
    },
    {
      slug: "deal-room-assistant",
      name: "Deal Room Assistant",
      purpose: "Assist with deal room management and document routing",
      allowedTools: ["fetch_deal_room", "list_deal_documents", "fetch_participant_compliance", "create_task"],
      forbiddenActions: ["approve_payout", "modify_kyc_status", "approve_deal"],
      systemPrompt: "You are the DOC OS Deal Room Assistant. You help reps manage deal rooms, track participant compliance status, and ensure documents are in order before deals close. You may create tasks but never approve anything.",
    },
    {
      slug: "task-routing",
      name: "Task Routing Agent",
      purpose: "Route tasks to the correct assignee based on type and urgency",
      allowedTools: ["create_task", "fetch_task", "update_task_assignee", "fetch_org_members"],
      forbiddenActions: ["approve_payout", "approve_compliance", "delete_task"],
      systemPrompt: "You are the DOC OS Task Routing Agent. You analyze incoming tasks and route them to the correct team member based on task type, urgency, and current workload. Never close or delete tasks without assignment.",
    },
    {
      slug: "knowledge-retrieval",
      name: "Knowledge Retrieval Agent",
      purpose: "Surface relevant knowledge from docs, policies, and history",
      allowedTools: ["search_documents", "search_regulations", "fetch_prompt_template", "vector_search"],
      forbiddenActions: ["approve_payout", "create_participant", "modify_kyc_status"],
      systemPrompt: "You are the DOC OS Knowledge Retrieval Agent. You search internal documents, policies, and historical records to answer questions from the platform. You provide accurate citations and never fabricate regulatory references.",
    },
  ];

  for (const def of agentDefs) {
    await prisma.agentDefinition.upsert({
      where: { slug: def.slug },
      update: {},
      create: def,
    });
  }
  console.log("✅ Agent definitions created:", agentDefs.length);

  // ── Tool Definitions ─────────────────────────────────────────────────────────
  const toolDefs = [
    { slug: "classify_intake", name: "Classify Intake", description: "Classify an intake submission by type and urgency", requiresApproval: false, inputSchema: { type: "object", properties: { submissionId: { type: "string" } } }, outputSchema: { type: "object", properties: { intakeType: { type: "string" }, urgency: { type: "string" }, confidence: { type: "number" } } } },
    { slug: "route_intake", name: "Route Intake", description: "Route an intake to the appropriate rep or team", requiresApproval: false, inputSchema: { type: "object", properties: { submissionId: { type: "string" }, targetRepId: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "fetch_participant", name: "Fetch Participant", description: "Retrieve participant record by ID or email", requiresApproval: false, inputSchema: { type: "object", properties: { id: { type: "string" }, email: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "create_task", name: "Create Task", description: "Create a follow-up task in the system", requiresApproval: false, inputSchema: { type: "object", properties: { title: { type: "string" }, assigneeId: { type: "string" }, priority: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "fetch_kyc_case", name: "Fetch KYC Case", description: "Retrieve KYC case for a participant", requiresApproval: false, inputSchema: { type: "object", properties: { participantId: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "fetch_compliance_gate", name: "Fetch Compliance Gate", description: "Get latest compliance gate result for participant", requiresApproval: false, inputSchema: { type: "object", properties: { participantId: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "draft_message", name: "Draft Message", description: "Draft a compliant investor communication (does not send)", requiresApproval: false, inputSchema: { type: "object", properties: { participantId: { type: "string" }, context: { type: "string" }, messageType: { type: "string" } } }, outputSchema: { type: "object", properties: { draft: { type: "string" }, disclaimers: { type: "array" } } } },
    { slug: "fetch_dashboard_metrics", name: "Fetch Dashboard Metrics", description: "Retrieve high-level platform metrics for executive view", requiresApproval: false, inputSchema: { type: "object" }, outputSchema: { type: "object" } },
    { slug: "fetch_deal_room", name: "Fetch Deal Room", description: "Get deal room and participants", requiresApproval: false, inputSchema: { type: "object", properties: { dealRoomId: { type: "string" } } }, outputSchema: { type: "object" } },
    { slug: "search_documents", name: "Search Documents", description: "Full-text search across uploaded documents", requiresApproval: false, inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } } }, outputSchema: { type: "array" } },
    { slug: "approve_payout", name: "Approve Payout", description: "Approve a proposed compensation payout — REQUIRES supervisory sign-off", requiresApproval: true, inputSchema: { type: "object", properties: { payoutId: { type: "string" }, approverId: { type: "string" } } }, outputSchema: { type: "object" } },
  ];

  for (const tool of toolDefs) {
    await prisma.toolDefinition.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    });
  }
  console.log("✅ Tool definitions created:", toolDefs.length);

  console.log("\n🎉 Seed complete. DOC OS database ready.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
