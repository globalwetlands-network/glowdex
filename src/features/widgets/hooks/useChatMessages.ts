import { useState } from 'react';

/** Represents a single message in the chat conversation. */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Hook to manage the state of chat messages.
 * Automatically synchronizes or resets the conversation when the selected cell or initial context changes.
 *
 * @param selectedCellId - The ID of the currently selected grid cell.
 * @param initialText - The initial AI insight text to populate the chat.
 * @returns The messages state and its setter.
 */
export function useChatMessages(
  selectedCellId: number | null | undefined,
  initialText: string | null | undefined,
) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Track the source props to detect when to reset state during render.
  // This avoids the 'setState-in-effect' warning and prevents unnecessary double-renders.
  const [prevCellId, setPrevCellId] = useState(selectedCellId);
  const [prevInitialText, setPrevInitialText] = useState(initialText);

  if (selectedCellId !== prevCellId || initialText !== prevInitialText) {
    setPrevCellId(selectedCellId);
    setPrevInitialText(initialText);

    if (!selectedCellId) {
      setMessages([]);
    } else if (initialText) {
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
  }

  return { messages, setMessages };
}