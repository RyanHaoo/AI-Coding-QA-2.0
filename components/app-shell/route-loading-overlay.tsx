import { Loader2 } from "lucide-react";

export function RouteLoadingOverlay() {
  return (
    <output
      aria-atomic="true"
      aria-busy="true"
      aria-live="polite"
      className="route-loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-white/55 px-4 backdrop-blur-[1px]"
    >
      <div className="flex min-w-44 flex-col items-center gap-3 rounded-lg border border-white/70 bg-white/80 px-6 py-5 shadow-lg">
        <Loader2
          aria-hidden="true"
          className="size-7 animate-spin text-[#005ac2] motion-reduce:animate-none"
        />
        <p className="font-medium text-slate-700 text-sm">页面加载中…</p>
      </div>
    </output>
  );
}
