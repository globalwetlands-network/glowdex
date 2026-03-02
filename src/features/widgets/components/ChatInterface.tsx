import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { fetchInsight } from '@/api/insight';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  selectedCellId?: number | null;
}

export function ChatInterface({ selectedCellId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when cell changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
     
    setInputValue('');
  }, [selectedCellId]);

  // Initial summary query (cached per gridCellId)
  const { data: initialInsight, isLoading: isInitialLoading, error: initialError } = useQuery({
    queryKey: ['insight', { gridCellId: selectedCellId }],
    queryFn: () => fetchInsight({ gridCellId: selectedCellId! }),
    enabled: !!selectedCellId,
  });

  // Inject initial insight safely into messages state
  useEffect(() => {
    if (initialInsight?.answer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([
        {
          id: `initial-${selectedCellId}`,
          role: 'assistant',
          content: initialInsight.answer,
        },
      ]);
    }
  }, [initialInsight, selectedCellId]);

  // Mutation for follow-up questions
  const askMutation = useMutation({
    mutationFn: (question: string) => fetchInsight({ gridCellId: selectedCellId!, question }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I encountered an error fetching the context. Please try again.",
        },
      ]);
    }
  });

  // Scroll to bottom when messages count changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedCellId || askMutation.isPending) return;

    const question = inputValue.trim();
    setInputValue('');

    // Append user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question,
      },
    ]);

    // Send mutation
    askMutation.mutate(question);
  };

  if (!selectedCellId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-lg border border-gray-100 p-6 text-center">
        <Bot className="w-8 h-8 mb-3 opacity-20" />
        <p className="text-sm font-medium">No Location Selected</p>
        <p className="text-xs uppercase tracking-wider mt-1 opacity-60">
          Select a grid cell on the map to begin contextual analysis
        </p>
      </div>
    );
  }

  const isLoading = isInitialLoading || askMutation.isPending;

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-gray-50 p-3 border-b border-gray-200 shrink-0">
        <div className="bg-blue-100 p-1.5 rounded-md">
          <Bot className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
            Spatial Intelligence
          </h3>
          <p className="text-[10px] text-gray-500">
            Cell ID: {selectedCellId}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/50"
      >
        {initialError && (
          <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Failed to load initial context for this area. It might lack data or the service is temporarily unavailable.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
          >
            <div className={`shrink-0 rounded-full p-1.5 mt-0.5 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white'
              }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
              ? 'bg-gray-800 text-white text-base rounded-tr-none'
              : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none prose prose-sm max-w-none'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="shrink-0 rounded-full p-1.5 mt-0.5 bg-blue-100 text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1 border-gray-200">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || !selectedCellId}
            placeholder={isLoading ? "Analyzing..." : "Ask a follow-up question..."}
            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || !selectedCellId}
            className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
