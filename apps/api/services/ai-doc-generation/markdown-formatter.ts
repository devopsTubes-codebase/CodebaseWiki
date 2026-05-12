import type { GeneratedDocsPage } from '../../types';

export interface MarkdownFormattingContract {
  normalize(markdown: string): string;
}

export interface MarkdownPageSplitterContract {
  splitIntoPages(input: { projectId: string; markdown: string }): GeneratedDocsPage[];
}

export class MarkdownFormatterStub implements MarkdownFormattingContract {
  normalize(markdown: string): string {
    return markdown.replace(/\r\n/g, '\n').trim();
  }
}

export class MarkdownPageSplitterStub implements MarkdownPageSplitterContract {
  splitIntoPages(input: { projectId: string; markdown: string }): GeneratedDocsPage[] {
    const normalized = input.markdown.trim();

    if (!normalized) {
      return [
        {
          slug: 'overview',
          title: 'Overview',
          content: 'TODO: Markdown content is empty in stub mode.',
        },
      ];
    }

    const contentWithoutH1 = normalized.replace(/^#\s+.*\n*/m, '').trim();
    const sections = contentWithoutH1
      .split(/^##\s+/m)
      .map((section) => section.trim())
      .filter(Boolean);

    if (sections.length === 0) {
      return [
        {
          slug: 'overview',
          title: 'Overview',
          content: normalized,
        },
      ];
    }

    return sections.map((section) => {
      const [rawTitle, ...rest] = section.split('\n');
      const title = rawTitle.trim();
      const content = rest.join('\n').trim();
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        slug,
        title,
        content: `## ${title}\n\n${content}`.trim(),
      };
    });
  }
}
