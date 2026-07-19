"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export default function CollapsibleCard({
  title,
  defaultOpen = false,
  onRemove,
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{title}</span>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-rose-500 hover:text-rose-600 shrink-0 ml-2"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}
