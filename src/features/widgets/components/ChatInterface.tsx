import { useState, useEffect } from 'react';
import {
  Send,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { CrabIcon } from '@/components/icons/CrabIcon';
import ReactMarkdown from 'react-markdown';

import type { InsightResponse, LocalSiteContext } from '@/api/types';
import { useAIAnalytics } from '@/features/analytics';

const AI_SUGGESTIONS_ENABLED =
  import.meta.env.VITE_PUBLIC_FEATURE_AI_SUGGESTIONS === 'true';

const BASE_SUGGESTIONS = [
  'What are the main ecological signals here?',
  'How does this compare to similar systems?',
] as const;

const LOCAL_DATA_SUGGESTION = 'What does the local field data show?';
import { useChatMessages } from '@/features/widgets/hooks/useChatMessages';
import { useAskMutation } from '@/features/widgets/hooks/useAskMutation';
import { useAutoScroll } from '@/features/widgets/hooks/useAutoScroll';
import { StatisticalDetailToggle } from './StatisticalDetailToggle';

interface ChatInterfaceProps {
  selectedCellId?: number | null;
  initialInsight?: InsightResponse;
  initialError?: Error | null;
  localSiteContext?: LocalSiteContext | null;
}

export function ChatInterface({
  selectedCellId,
  initialInsight,
  initialError,
  localSiteContext,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  // Tracks which cell ID the user dismissed suggestions for.
  // Derived: suggestions are visible whenever the current cell differs.
  const [suggestionsDismissedForCell, setSuggestionsDismissedForCell] =
    useState<number | null>(null);
  const suggestionsVisible = selectedCellId !== suggestionsDismissedForCell;

  const { captureOutboundLinkClicked } = useAIAnalytics({
    selectedCellId,
    localSiteContext,
  });

  const { messages, setMessages } = useChatMessages();

  /**
   * Initial AI insight derived from props.
   * Not stored in state to avoid async synchronization issues.
   */
  const initialMessage =
    selectedCellId && initialInsight?.text
      ? {
          id: `initial-${selectedCellId}`,
          role: 'assistant' as const,
          content: initialInsight.text,
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
    localSiteContext,
  });

  const { ref: scrollRef, scrollToTop, scrollToBottom } = useAutoScroll();

  // Reset scroll position when the selected cell changes.
  useEffect(() => {
    scrollToTop();
  }, [selectedCellId, scrollToTop]);

  // Scroll to top when the initial insight loads so the user reads from the start.
  useEffect(() => {
    if (initialInsight) scrollToTop();
  }, [initialInsight, scrollToTop]);

  // Scroll to bottom when a follow-up exchange is added.
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

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
    setInputValue('');

    handleAsk(question);
  };

  if (!selectedCellId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded-lg border border-gray-100 p-6 text-center shadow-inner">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <CrabIcon size={32} className="opacity-40 text-gray-600" />
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
          <CrabIcon size={16} className="text-blue-700" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Mangrove Analysis Assistant
          </h3>
          <p className="text-xs text-gray-500">Cell ID: {selectedCellId}</p>
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

        {conversation.map((msg, idx) => (
          <div key={msg.id}>
            <div
              className={`flex items-start space-x-3 max-w-[90%] ${
                msg.role === 'user'
                  ? 'ml-auto flex-row-reverse space-x-reverse'
                  : ''
              }`}
            >
              <div
                className={`shrink-0 rounded-full p-1.5 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-gray-800 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <CrabIcon size={14} />
                )}
              </div>

              <div
                className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white border border-gray-100 text-gray-700 prose prose-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => {
                        void node; // non-DOM remark AST prop, excluded from spread
                        return (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          />
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>

            {idx === 0 &&
              msg.role === 'assistant' &&
              initialInsight?.statistics && (
                <StatisticalDetailToggle
                  statistics={initialInsight.statistics}
                  selectedCellId={selectedCellId}
                />
              )}

            {idx === 0 && msg.role === 'assistant' && initialInsight && (
              <div className="mt-1.5 px-1 border-t border-gray-100 pt-1.5">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                  <BookOpen className="w-3 h-3" />
                  Sources
                </div>
                <div className="text-[10px] text-gray-400 leading-relaxed">
                  {(() => {
                    const source = initialInsight.sources?.[0];
                    const href = source?.doi
                      ? `https://doi.org/${source.doi}`
                      : 'https://doi.org/10.1016/j.ecolind.2021.108141';
                    const label =
                      source?.citation ??
                      'Sievers et al. (2021) Ecological Indicators 131:108141';
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-gray-600 transition-colors"
                        onClick={(e) =>
                          captureOutboundLinkClicked(
                            e.currentTarget.href,
                            'doi_citation',
                          )
                        }
                      >
                        {label}
                      </a>
                    );
                  })()}
                  {initialInsight.sources &&
                    initialInsight.sources.length > 0 && (
                      <span className="ml-1 text-gray-300">
                        ·{' '}
                        {initialInsight.sources
                          .flatMap((s) => s.sections)
                          .join(' · ')}
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Prompt suggestions — shown before first follow-up when feature flag is on.
          The local field data suggestion is only included when localSiteContext
          is present — showing it without data would be misleading. */}
      {AI_SUGGESTIONS_ENABLED &&
        messages.length === 0 &&
        !!initialInsight &&
        suggestionsVisible && (
          <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Sparkles className="w-3 h-3" />
                Suggested questions
              </span>
              <button
                type="button"
                onClick={() =>
                  setSuggestionsDismissedForCell(selectedCellId ?? null)
                }
                className="p-0.5 rounded text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                aria-label="Dismiss suggested questions"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                ...BASE_SUGGESTIONS,
                ...(localSiteContext ? [LOCAL_DATA_SUGGESTION] : []),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAsk(suggestion)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

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
            className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center px-3 pb-2 leading-relaxed">
          AI-generated interpretation · Always verify with an expert ·{' '}
          <a
            href="https://globalwetlandsproject.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            Get expert guidance
          </a>
        </p>
      </div>
    </div>
  );
}
