import { claudeComplete } from "@doc/claude-adapter";

export type SupportedProvider = "anthropic" | "openai" | "auto";

export interface RouterCompletionInput {
  systemMessage: string;
  userMessage: string;
  provider?: SupportedProvider;
  model?: string;
  maxTokens?: number;
  agentRunId?: string;
  promptTemplateId?: string;
  invokedById?: string;
}

export interface RouterCompletionOutput {
  completion: string;
  provider: SupportedProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Route a completion request to the appropriate provider.
 * Default is Anthropic (Claude). Provider selection is explicit or env-driven.
 *
 * Policy:
 * - "auto" → prefers Anthropic, falls back to OpenAI if CLAUDE_API_KEY is absent
 * - "anthropic" → always Claude, throws if CLAUDE_API_KEY is not set
 * - "openai" → always OpenAI (not yet implemented beyond stub)
 */
export async function routeCompletion(
  input: RouterCompletionInput
): Promise<RouterCompletionOutput> {
  const provider = resolveProvider(input.provider ?? "auto");

  if (provider === "anthropic") {
    const result = await claudeComplete({
      systemMessage: input.systemMessage,
      userMessage: input.userMessage,
      model: input.model,
      maxTokens: input.maxTokens,
      agentRunId: input.agentRunId,
      promptTemplateId: input.promptTemplateId,
      invokedById: input.invokedById,
    });

    return {
      completion: result.completion,
      provider: "anthropic",
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      latencyMs: result.latencyMs,
    };
  }

  // OpenAI stub — extend when needed
  throw new Error(`Provider '${provider}' is not yet implemented in model-router`);
}

function resolveProvider(preference: SupportedProvider): SupportedProvider {
  if (preference === "anthropic") return "anthropic";
  if (preference === "openai") return "openai";
  // auto: prefer Claude
  if (process.env["CLAUDE_API_KEY"]) return "anthropic";
  if (process.env["OPENAI_API_KEY"]) return "openai";
  throw new Error("No AI provider configured: set CLAUDE_API_KEY or OPENAI_API_KEY");
}
