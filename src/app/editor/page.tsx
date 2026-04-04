export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { EditorShell } from "@/components/editor/EditorShell";

export default function EditorPage() {
  return (
    <AppShell>
      <EditorShell />
    </AppShell>
  );
}
