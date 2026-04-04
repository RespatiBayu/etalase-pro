export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { WizardShell } from "@/components/WizardShell";
import { ProjectProvider } from "@/context/ProjectContext";

export default function ProPage() {
  return (
    <AppShell>
      <ProjectProvider>
        <WizardShell />
      </ProjectProvider>
    </AppShell>
  );
}
