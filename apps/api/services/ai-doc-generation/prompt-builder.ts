export interface CodebaseDocPromptInput {
  projectId: string;
  compactContext: string;
  suggestedDocStructure: string[];
}

export interface CodebaseDocPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export interface CodebaseDocPromptBuilderContract {
  buildPrompt(input: CodebaseDocPromptInput): CodebaseDocPrompt;
}

export class CodebaseDocPromptBuilderStub implements CodebaseDocPromptBuilderContract {
  buildPrompt(input: CodebaseDocPromptInput): CodebaseDocPrompt {
    const structureHint =
      input.suggestedDocStructure.length > 0
        ? input.suggestedDocStructure.map((section) => `- ${section}`).join('\n')
        : '- overview\n- architecture\n- setup';

    return {
      systemPrompt: [
        'You are a technical documentation generator.',
        'Return output as multiple Markdown pages grouped by topic.',
        'TODO: tighten prompt constraints after Wave 1 compact-context quality is finalized.',
      ].join('\n'),
      userPrompt: [
        `Project ID: ${input.projectId}`,
        '',
        'Suggested sections:',
        structureHint,
        '',
        'Compact context:',
        input.compactContext,
      ].join('\n'),
    };
  }
}
