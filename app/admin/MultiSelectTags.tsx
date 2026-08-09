"use client";

export default function MultiSelectTags({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag],
    );
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              active
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
