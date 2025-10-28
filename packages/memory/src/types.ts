/**
 * Working memory - persistent facts the agent learns
 */
export interface WorkingMemory {
  content: string;
  updatedAt: Date;
}

/**
 * Memory scope - chat or user level
 */
export type MemoryScope = 'chat' | 'user';

/**
 * Conversation message for history
 */
export interface ConversationMessage {
  chatId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Chat session metadata
 */
export interface ChatSession {
  chatId: string;
  userId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

/**
 * Memory provider interface
 */
export interface MemoryProvider {
  /** Get working memory */
  getWorkingMemory(params: {
    chatId?: string;
    userId?: string;
    scope: MemoryScope;
  }): Promise<WorkingMemory | null>;

  /** Update working memory */
  updateWorkingMemory(params: {
    chatId?: string;
    userId?: string;
    scope: MemoryScope;
    content: string;
  }): Promise<void>;

  /** Save message to history (optional) */
  saveMessage?(message: ConversationMessage): Promise<void>;

  /** Get recent messages (optional) */
  getMessages?(params: {
    chatId: string;
    limit?: number;
  }): Promise<ConversationMessage[]>;

  /** Save or update chat session (optional) */
  saveChat?(chat: ChatSession): Promise<void>;

  /** Get chat sessions for a user (optional) */
  getChats?(userId?: string): Promise<ChatSession[]>;

  /** Get specific chat session (optional) */
  getChat?(chatId: string): Promise<ChatSession | null>;

  /** Update chat title (optional) */
  updateChatTitle?(chatId: string, title: string): Promise<void>;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  /** Storage provider */
  provider: MemoryProvider;

  /** Working memory configuration */
  workingMemory?: {
    enabled: boolean;
    scope: MemoryScope;
    template?: string;
  };

  /** Conversation history configuration */
  history?: {
    enabled: boolean;
    limit?: number;
  };

  /** Chat session configuration */
  chats?: {
    enabled: boolean;
    generateTitle?: boolean;
  };
}
