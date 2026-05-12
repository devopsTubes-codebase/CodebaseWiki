import { randomUUID } from 'node:crypto';

import type {
  ChatRetrievalContract,
  ChatRetrievalResponse,
  GroundedKnowledgeSource,
  WikiChatMessage,
  WikiChatSession,
  WikiChatStoreContract,
} from '../../types';
import type { OpenAICompatibleAIClientContract } from '../ai-doc-generation';

export interface WikiChatSendMessageInput {
  projectId: string;
  userId: string;
  sessionId?: string;
  question: string;
}

export interface WikiChatSendMessageResponse {
  session: WikiChatSession;
  messages: WikiChatMessage[];
}

export class InMemoryWikiChatStore implements WikiChatStoreContract {
  private readonly sessions = new Map<string, WikiChatSession>();
  private readonly messages = new Map<string, WikiChatMessage[]>();

  async listSessions(input: { projectId: string; userId: string }): Promise<WikiChatSession[]> {
    return Array.from(this.sessions.values())
      .filter((session) => session.projectId === input.projectId && session.userId === input.userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createSession(input: { projectId: string; userId: string; title: string }): Promise<WikiChatSession> {
    const now = new Date().toISOString();
    const session: WikiChatSession = {
      id: randomUUID(),
      projectId: input.projectId,
      userId: input.userId,
      title: normalizeSessionTitle(input.title),
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);
    return session;
  }

  async getSession(input: { projectId: string; userId: string; sessionId: string }): Promise<WikiChatSession | null> {
    const session = this.sessions.get(input.sessionId);
    if (!session || session.projectId !== input.projectId || session.userId !== input.userId) return null;
    return session;
  }

  async deleteSession(input: { projectId: string; userId: string; sessionId: string }): Promise<void> {
    const session = await this.getSession(input);
    if (!session) return;
    this.sessions.delete(input.sessionId);
    this.messages.delete(input.sessionId);
  }

  async listMessages(input: { projectId: string; userId: string; sessionId: string }): Promise<WikiChatMessage[]> {
    const session = await this.getSession(input);
    if (!session) return [];
    return [...(this.messages.get(input.sessionId) ?? [])];
  }

  async appendMessage(input: {
    projectId: string;
    userId: string;
    sessionId: string;
    role: WikiChatMessage['role'];
    content: string;
    sources?: GroundedKnowledgeSource[];
  }): Promise<WikiChatMessage> {
    const session = await this.getSession(input);
    if (!session) throw new Error('Wiki chat session not found');
    const now = new Date().toISOString();
    const message: WikiChatMessage = {
      id: randomUUID(),
      sessionId: input.sessionId,
      projectId: input.projectId,
      userId: input.userId,
      role: input.role,
      content: input.content,
      sources: input.sources ?? [],
      createdAt: now,
    };
    this.messages.set(input.sessionId, [...(this.messages.get(input.sessionId) ?? []), message]);
    this.sessions.set(input.sessionId, { ...session, updatedAt: now });
    return message;
  }
}

export class WikiChatService {
  constructor(
    private readonly deps: {
      store: WikiChatStoreContract;
      retrieveContext: ChatRetrievalContract['retrieveContext'];
      aiClient: OpenAICompatibleAIClientContract;
      model: string;
    },
  ) {}

  async sendMessage(input: WikiChatSendMessageInput): Promise<WikiChatSendMessageResponse> {
    const question = input.question.trim();
    if (!question) throw new Error('Question is required');

    const session = input.sessionId
      ? await this.resolveSession({ projectId: input.projectId, userId: input.userId, sessionId: input.sessionId })
      : await this.deps.store.createSession({
          projectId: input.projectId,
          userId: input.userId,
          title: question,
        });

    await this.deps.store.appendMessage({
      projectId: input.projectId,
      userId: input.userId,
      sessionId: session.id,
      role: 'user',
      content: question,
    });

    const retrieval = await this.deps.retrieveContext({
      projectId: input.projectId,
      query: question,
      maxResults: 5,
      allowedSources: ['vector-index', 'codebase-summary'],
    });

    const answer = await this.buildAnswer({
      projectId: input.projectId,
      question,
      retrieval,
    });

    await this.deps.store.appendMessage({
      projectId: input.projectId,
      userId: input.userId,
      sessionId: session.id,
      role: 'assistant',
      content: answer.content,
      sources: answer.sources,
    });

    return {
      session,
      messages: await this.deps.store.listMessages({
        projectId: input.projectId,
        userId: input.userId,
        sessionId: session.id,
      }),
    };
  }

  private async resolveSession(input: Required<Pick<WikiChatSendMessageInput, 'projectId' | 'userId' | 'sessionId'>>): Promise<WikiChatSession> {
    const session = await this.deps.store.getSession(input);
    if (!session) throw new Error('Wiki chat session not found');
    return session;
  }

  private async buildAnswer(input: {
    projectId: string;
    question: string;
    retrieval: ChatRetrievalResponse;
  }): Promise<{ content: string; sources: GroundedKnowledgeSource[] }> {
    const sources = input.retrieval.sources.filter((source) => source.excerpt.trim()).slice(0, 5);
    if (!input.retrieval.context.trim() || sources.length === 0) {
      return {
        content: "I couldn't find enough indexed documentation to answer that. Try regenerating the project docs so the wiki index is refreshed.",
        sources: [],
      };
    }

    let responseContent = '';
    try {
      const response = await this.deps.aiClient.generateText({
        projectId: input.projectId,
        model: this.deps.model,
        temperature: 0,
        maxTokens: 800,
        messages: [
          {
            role: 'system',
            content: [
              'You are Ask Wiki for Codebase Wiki.',
              'Answer only from the retrieved Codebase Wiki context.',
              'If the context does not answer the question, say you could not find enough indexed documentation.',
              'Do not invent files, APIs, credentials, or behavior.',
              'Start with one short direct answer sentence.',
              'Use bullet points for multiple facts, endpoints, files, configuration values, or steps.',
              'Wrap endpoints, file paths, symbols, and commands in inline code.',
              'Avoid long essay-style paragraphs.',
              'Keep answers concise and do not add a separate sources section; the UI renders citations.',
            ].join('\n'),
          },
          {
            role: 'user',
            content: [
              `Question: ${input.question}`,
              '',
              'Retrieved context:',
              input.retrieval.context,
              '',
              'Sources:',
              sources.map((source, index) => `[${index + 1}] ${source.reference}\n${source.excerpt}`).join('\n\n'),
            ].join('\n'),
          },
        ],
      });
      responseContent = response.content.trim();
    } catch {
      responseContent = 'I found relevant indexed documentation, but the AI provider failed while generating an answer. Review the cited sources for the grounded context.';
    }

    return {
      content: responseContent || "I couldn't find enough indexed documentation to answer that.",
      sources,
    };
  }
}

function normalizeSessionTitle(title: string): string {
  const normalized = title.trim().replace(/\s+/g, ' ');
  if (!normalized) return 'New chat';
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;
}
