import { useEffect, useState } from "react";

type Toast = { id: number; text: string; tone: "info" | "warn" };

let push: ((t: Omit<Toast, "id">) => void) | null = null;
let nextId = 1;

export function showToast(text: string, tone: "info" | "warn" = "info") {
  push?.({ text, tone });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = nextId++;
      setToasts((cur) => [...cur, { id, ...t }]);
      setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== id));
      }, 3500);
    };
    return () => {
      push = null;
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-6 z-[1000] -translate-x-1/2 space-y-2"
      data-an-role="toaster"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto rounded-full border px-5 py-2 text-sm font-medium shadow-lg backdrop-blur",
            t.tone === "warn"
              ? "border-amber-300 bg-amber-50/95 text-amber-900"
              : "border-slate-200 bg-white/95 text-slate-800",
          ].join(" ")}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
