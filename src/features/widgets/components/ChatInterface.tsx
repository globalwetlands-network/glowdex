import { useState, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useChatMessages } from '@/features/widgets/hooks/useChatMessages';
import { useAskMutation } from '@/features/widgets/hooks/useAskMutation';
import { useAutoScroll } from '@/features/widgets/hooks/useAutoScroll';

interface ChatInterfaceProps {
  selectedCellId?: number | null;
  initialText?: string | null;
  initialError?: Error | null;
  externalPrompt?: string | null;
  onPromptHandled?: () => void;
}

export function ChatInterface({
  selectedCellId,
  initialText,
  initialError,
  externalPrompt,
  onPromptHandled,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');

  const { messages, setMessages } = useChatMessages(selectedCellId, initialText);

  const { askMutation, handleAsk } = useAskMutation({
    selectedCellId,
    messages,
    setMessages,
  });

  const scrollRef = useAutoScroll(messages.length);

  /**
   * Handle externally injected prompts (e.g. chart insight click).
   */
  useEffect(() => {
    if (!externalPrompt || !selectedCellId || askMutation.isPending) return;

    handleAsk(externalPrompt);
    onPromptHandled?.();
  }, [externalPrompt, selectedCellId, askMutation.isPending, handleAsk, onPromptHandled]);

  const isLoading = askMutation.isPending;
  const isOverLimit = inputValue.length > 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !selectedCellId || isLoading || isOverLimit) return;

    const question = inputValue.trim();
    setInputValue('');
    handleAsk(question);
  };

  if (!selectedCellId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 p-6 text-center shadow-inner">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <Bot className="w-8 h-8 opacity-40 text-gray-600" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No Location Selected</p>
        <p className="text-xs mt-2 opacity-80 max-w-[200px]">
          Click on a grid cell on the map to view detailed contextual analysis.
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
          <h3 className="text-sm font-bold text-gray-900 tracking-wide">
            Mangrove Analysis Assistant
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Cell ID: {selectedCellId}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/50"
      >
        {initialError && (
          <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Failed to load initial context for this area. It might lack data or the service is
              temporarily unavailable.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
          >
            <div
              className={`shrink-0 rounded-full p-1.5 mt-0.5 ${msg.role === 'user'
                ? 'bg-gray-800 text-white'
                : 'bg-blue-600 text-white'
                }`}
            >
              {msg.role === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            <div
              className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                ? 'bg-gray-800 text-white text-base rounded-tr-none'
                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none prose prose-sm max-w-none'
                }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="shrink-0 rounded-full p-1.5 mt-0.5 bg-blue-100 text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>

            <div className="bg-white border border-gray-100 rounded-xl rounded-tl-none px-4 py-3 shadow-sm w-3/4 max-w-[80%]">
              <div className="space-y-2">
                <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-full" />
                <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-5/6" />
                <div className="h-2.5 bg-gray-200 rounded-full animate-pulse w-4/6" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex flex-col">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || !selectedCellId}
              maxLength={500}
              placeholder={isLoading ? 'Analyzing...' : 'Ask a follow-up question...'}
              className={`w-full pl-4 pr-12 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isOverLimit
                ? 'border-red-500 focus:ring-red-500 text-red-900 bg-red-50'
                : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 hover:bg-white'
                }`}
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !selectedCellId || isOverLimit}
              className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 focus:text-blue-600 hover:bg-blue-50 focus:bg-blue-50 rounded-md disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div
            className={`text-right mt-1 text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}
          >
            {inputValue.length} / 500
          </div>
        </form>
      </div>
    </div>
  );
}