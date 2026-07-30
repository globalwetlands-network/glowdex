import { useState } from 'react';

/**
 * Represents a message in the chat conversation.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Stores follow-up conversation messages for the active chat session.
 *
 * The initial AI insight is derived in the UI layer and not stored here.
 * State resets automatically when ChatInterface remounts via
 * `key={selectedCellId}`.
 */
export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  return { messages, setMessages };
}
