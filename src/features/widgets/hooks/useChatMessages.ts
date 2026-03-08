import { useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useChatMessages(
  selectedCellId: number | null | undefined,
  initialText: string | null | undefined,
) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedCellId) {
      setMessages([]);
      return;
    }

    if (initialText) {
      setMessages([
        {
          id: `initial-${selectedCellId}`,
          role: 'assistant',
          content: initialText,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedCellId, initialText]);

  return { messages, setMessages };
}