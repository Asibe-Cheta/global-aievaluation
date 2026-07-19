"use client";

interface StringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  rows?: number;
  placeholder?: string;
}

export default function StringListEditor({
  items,
  onChange,
  rows = 2,
  placeholder,
}: StringListEditorProps) {
  const updateItem = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const addItem = () => onChange([...items, ""]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-[10px] text-slate-400 font-mono pt-2.5 w-5 shrink-0 text-right">
            {idx + 1}
          </span>
          <textarea
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            rows={rows}
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-rose-500 hover:text-rose-600 text-xs font-bold px-2 pt-2 shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
      >
        + Add Item
      </button>
    </div>
  );
}
