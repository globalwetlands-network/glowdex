import { useState } from "react";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { useChatMessages } from "@/features/widgets/hooks/useChatMessages";
import { useAskMutation } from "@/features/widgets/hooks/useAskMutation";
import { useAutoScroll } from "@/features/widgets/hooks/useAutoScroll";

interface ChatInterfaceProps {
  selectedCellId?: number | null;
  initialText?: string | null;
  initialError?: Error | null;
}

export function ChatInterface({
  selectedCellId,
  initialText,
  initialError,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");

  const { messages, setMessages } = useChatMessages();

  /**
   * Initial AI insight derived from props.
   * Not stored in state to avoid async synchronization issues.
   */
  const initialMessage =
    selectedCellId && initialText
      ? {
        id: `initial-${selectedCellId}`,
        role: "assistant" as const,
        content: initialText,
      }
      : null;

  /**
   * Full visible conversation.
   */
  const conversation = initialMessage
    ? [initialMessage, ...messages]
    : messages;

  const { askMutation, handleAsk } = useAskMutation({
    selectedCellId,
    conversationMessages: conversation,
    setMessages,
  });

  const scrollRef = useAutoScroll(conversation.length);

  const isLoading = askMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !inputValue.trim() ||
      !selectedCellId ||
      isLoading ||
      inputValue.length > 500
    ) {
      return;
    }

    const question = inputValue.trim();
    setInputValue("");

    handleAsk(question);
  };

  if (!selectedCellId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 p-6 text-center shadow-inner">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <Bot className="w-8 h-8 opacity-40 text-gray-600" />
        </div>

        <p className="text-sm font-semibold text-gray-700">
          No Location Selected
        </p>

        <p className="text-xs mt-2 opacity-80 max-w-[200px]">
          Click a grid cell to view contextual analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-gray-50 p-3 border-b border-gray-200 shrink-0">
        <div className="bg-blue-100 p-1.5 rounded-md">
          <Bot className="w-4 h-4 text-blue-700" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Mangrove Analysis Assistant
          </h3>
          <p className="text-xs text-gray-500">
            Cell ID: {selectedCellId}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {initialError && (
          <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Failed to load context for this grid cell. Data may be missing.
            </p>
          </div>
        )}

        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 max-w-[90%] ${msg.role === "user"
              ? "ml-auto flex-row-reverse space-x-reverse"
              : ""
              }`}
          >
            <div
              className={`shrink-0 rounded-full p-1.5 mt-0.5 ${msg.role === "user"
                ? "bg-gray-800 text-white"
                : "bg-blue-600 text-white"
                }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${msg.role === "user"
                ? "bg-gray-800 text-white"
                : "bg-white border border-gray-100 text-gray-700 prose prose-sm"
                }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            maxLength={500}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a follow-up question..."
            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border rounded-lg text-sm"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}