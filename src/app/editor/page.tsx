// Force server-side rendering on demand (not statically cached)
export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import NextDynamic from "next/dynamic";

// EditorShell imports FabricCanvas which uses fabric.js (browser-only).
// Wrap with NextDynamic so the entire shell is skipped during SSR.
const EditorShell = NextDynamic(
  () => import("@/components/editor/EditorShell").then((m) => m.EditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-orange-300">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-400 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Memuat editor...</span>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return (
    <AppShell>
      <EditorShell />
    </AppShell>
  );
}
