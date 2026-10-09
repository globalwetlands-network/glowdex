import type { ReactNode } from 'react';
import { CrabIcon } from '@/components/icons/CrabIcon';
import { BetaBadge } from '@/components/shared/BetaBadge';

interface AssistantHeaderProps {
  subtitle: string | null;
}

/**
 * The assistant's title bar: name, Beta badge and the cell or site it's
 * about. Shared by the chat and its loading states, so it's there from the
 * start rather than appearing with the first answer.
 */
export function AssistantHeader({ subtitle }: AssistantHeaderProps) {
  return (
    <div className="flex items-center space-x-2 bg-gray-50 p-3 border-b border-gray-200 shrink-0">
      <div className="bg-blue-100 p-1.5 rounded-md">
        <CrabIcon size={16} className="text-blue-700" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">
            Mangrove Analysis Assistant
          </h3>
          <BetaBadge />
        </div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

interface AssistantFrameProps {
  subtitle: string | null;
  children: ReactNode;
}

/**
 * The chat's card (border, header, 400px height) around a state shown before
 * the first answer, so the card doesn't jump when the answer arrives.
 */
export function AssistantFrame({ subtitle, children }: AssistantFrameProps) {
  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <AssistantHeader subtitle={subtitle} />
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        {children}
      </div>
    </div>
  );
}
