export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { HistoryClient } from "@/components/HistoryClient";

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryClient />
    </AppShell>
  );
}
