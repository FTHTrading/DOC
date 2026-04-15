import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@doc/db";

export interface ClaudeCompletionInput {
  systemMessage: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
  agentRunId?: string;
  promptTemplateId?: string;
  invokedById?: string;
}

export interface ClaudeCompletionOutput {
  completion: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

const DEFAULT_MODEL = process.env["CLAUDE_MODEL"] ?? "claude-opus-4-5";
const DEFAULT_MAX_TOKENS = 4096;

let _client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env["CLAUDE_API_KEY"];
    if (!apiKey) throw new Error("CLAUDE_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Call Claude with token accounting + audit trail via ModelInvocation record.
 * All agent calls MUST go through this function — never call Anthropic directly.
 */
export async function claudeComplete(
  input: ClaudeCompletionInput
): Promise<ClaudeCompletionOutput> {
  const model = input.model ?? DEFAULT_MODEL;
  const maxTokens = input.maxTokens ?? DEFAULT_MAX_TOKENS;
  const startTime = Date.now();

  let completion: string | undefined;
  let inputTokens = 0;
  let outputTokens = 0;
  let success = false;
  let errorMessage: string | undefined;

  try {
    const client = getClient();
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: input.systemMessage,
      messages: [{ role: "user", content: input.userMessage }],
    });

    const block = response.content[0];
    if (!block || block.type !== "text") {
      throw new Error("Unexpected response content type from Claude");
    }

    completion = block.text;
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
    success = true;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    const latencyMs = Date.now() - startTime;

    // Persist invocation record for audit + billing (fire-and-forget)
    prisma.modelInvocation
      .create({
        data: {
          agentRunId: input.agentRunId,
          promptTemplateId: input.promptTemplateId,
          invokedById: input.invokedById,
          provider: "anthropic",
          model,
          systemMessage: input.systemMessage,
          userMessage: input.userMessage,
          completion,
          inputTokens,
          outputTokens,
          latencyMs,
          success,
          errorMessage,
        },
      })
      .catch((e) => console.error("[claude-adapter] Failed to persist invocation:", e));
  }

  return {
    completion: completion!,
    inputTokens,
    outputTokens,
    latencyMs: Date.now() - startTime,
    model,
  };
}

export type { Anthropic };
