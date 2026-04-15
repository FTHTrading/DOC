import { prisma } from "@doc/db";

export interface PromptTemplate {
  id: string;
  slug: string;
  name: string;
  agentSlug?: string | null;
  systemMessage: string;
  userTemplate: string;
  version: number;
}

/**
 * Fetch the active prompt template by slug.
 * Templates are versioned — only the latest active version is returned.
 */
export async function getPrompt(slug: string): Promise<PromptTemplate> {
  const template = await prisma.promptTemplate.findFirst({
    where: { slug, isActive: true },
    orderBy: { version: "desc" },
  });

  if (!template) {
    throw new Error(`Prompt template not found: ${slug}`);
  }
  return template;
}

/**
 * Render a prompt template by substituting variables.
 * Variables in the template use {{VARIABLE_NAME}} syntax.
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in vars)) {
      throw new Error(`Missing template variable: {{${key}}}`);
    }
    return vars[key]!;
  });
}

/**
 * Upsert a prompt template (for seeding/migrations).
 */
export async function upsertPrompt(data: {
  slug: string;
  name: string;
  agentSlug?: string;
  systemMessage: string;
  userTemplate: string;
  version?: number;
}): Promise<PromptTemplate> {
  const existing = await prisma.promptTemplate.findFirst({
    where: { slug: data.slug },
    orderBy: { version: "desc" },
  });

  if (existing) {
    // Deactivate old versions
    await prisma.promptTemplate.updateMany({
      where: { slug: data.slug },
      data: { isActive: false },
    });
  }

  return prisma.promptTemplate.create({
    data: {
      slug: data.slug,
      name: data.name,
      agentSlug: data.agentSlug,
      systemMessage: data.systemMessage,
      userTemplate: data.userTemplate,
      version: (existing?.version ?? 0) + 1,
      isActive: true,
    },
  });
}

export { getPrompt as fetchPrompt };
