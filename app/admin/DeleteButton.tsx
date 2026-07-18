"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  label: string;
  action: (id: string) => Promise<{ error?: string }>;
}

export default function DeleteButton({ id, label, action }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleClick = () => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await action(id);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-rose-600 dark:text-rose-450 font-bold hover:underline disabled:opacity-60 cursor-pointer inline-flex items-center gap-1"
      >
        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
        Delete
      </button>
      {error && <span className="block text-rose-500 text-[10px] mt-1">{error}</span>}
    </>
  );
}
