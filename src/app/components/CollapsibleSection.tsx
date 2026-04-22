import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
  childrenClassName?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  headerAction,
  children,
  childrenClassName = 'pt-1 block animate-in fade-in slide-in-from-top-1',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full focus:outline-none group"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
            {title}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {headerAction}
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </button>

      {isOpen && <div className={childrenClassName}>{children}</div>}
    </div>
  );
}
