import { useState, useEffect } from 'react';

/** Represents a single message in the chat conversation. */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Manages chat message state tied to a selected grid cell.
 *
 * Behavior:
 * - Initializes the first assistant message if `initialText` exists.
 * - Resets the conversation when `selectedCellId` changes.
 * - Injects the initial insight once it becomes available.
 */
export function useChatMessages(
  selectedCellId: number | null | undefined,
  initialText: string | null | undefined,
) {
  // Lazy initialization ensures the first insight appears immediately
  const [messages, setMessages] = useState<Message[]>(() => {
    if (selectedCellId && initialText) {
      return [
        {
          id: `initial-${selectedCellId}`,
          role: 'assistant',
          content: initialText,
        },
      ];
    }
    return [];
  });

  /**
   * Reset messages when the selected cell changes.
   */
  useEffect(() => {
    if (!selectedCellId) {
      setMessages([]);
    }
  }, [selectedCellId]);

  /**
   * Inject the initial insight when it becomes available.
   * Guard prevents overwriting existing chat history.
   */
  useEffect(() => {
    if (!selectedCellId || !initialText) return;

    setMessages((prev) =>
      prev.length === 0
        ? [
          {
            id: `initial-${selectedCellId}`,
            role: 'assistant',
            content: initialText,
          },
        ]
        : prev
    );
  }, [initialText, selectedCellId]);

  return { messages, setMessages };
}