import type {
  MemoryProvider,
  WorkingMemory,
  ConversationMessage,
  ChatSession,
  MemoryScope,
} from './types';

/**
 * Simple in-memory storage provider (for development/testing)
 */
export class InMemoryProvider implements MemoryProvider {
  private workingMemory: Map<string, WorkingMemory> = new Map();
  private messages: Map<string, ConversationMessage[]> = new Map();
  private chats: Map<string, ChatSession> = new Map();

  async getWorkingMemory(params: {
    chatId?: string;
    userId?: string;
    scope: MemoryScope;
  }): Promise<WorkingMemory | null> {
    const key = this.getWorkingMemoryKey(params);
    return this.workingMemory.get(key) || null;
  }

  async updateWorkingMemory(params: {
    chatId?: string;
    userId?: string;
    scope: MemoryScope;
    content: string;
  }): Promise<void> {
    const key = this.getWorkingMemoryKey(params);
    this.workingMemory.set(key, {
      content: params.content,
      updatedAt: new Date(),
    });
  }

  async saveMessage(message: ConversationMessage): Promise<void> {
    const messages = this.messages.get(message.chatId) || [];
    messages.push(message);
    this.messages.set(message.chatId, messages);
  }

  async getMessages(params: {
    chatId: string;
    limit?: number;
  }): Promise<ConversationMessage[]> {
    const messages = this.messages.get(params.chatId) || [];
    const limit = params.limit || messages.length;
    return messages.slice(-limit);
  }

  async saveChat(chat: ChatSession): Promise<void> {
    this.chats.set(chat.chatId, chat);
  }

  async getChats(userId?: string): Promise<ChatSession[]> {
    const allChats = Array.from(this.chats.values());
    if (!userId) return allChats;
    return allChats.filter((chat) => chat.userId === userId);
  }

  async getChat(chatId: string): Promise<ChatSession | null> {
    return this.chats.get(chatId) || null;
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.title = title;
      chat.updatedAt = new Date();
      this.chats.set(chatId, chat);
    }
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.workingMemory.clear();
    this.messages.clear();
    this.chats.clear();
  }

  /**
   * Get statistics (for debugging)
   */
  getStats() {
    return {
      workingMemoryCount: this.workingMemory.size,
      messageCount: Array.from(this.messages.values()).reduce(
        (sum, msgs) => sum + msgs.length,
        0
      ),
      chatCount: this.chats.size,
    };
  }

  private getWorkingMemoryKey(params: {
    chatId?: string;
    userId?: string;
    scope: MemoryScope;
  }): string {
    if (params.scope === 'user') {
      return `user:${params.userId || 'anonymous'}`;
    }
    return `chat:${params.chatId || 'default'}`;
  }
}
