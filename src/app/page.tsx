export const dynamic = "force-dynamic";

import { ProjectProvider } from "@/context/ProjectContext";
import { WizardShell } from "@/components/WizardShell";

export default function Home() {
  return (
    <ProjectProvider>
      <WizardShell />
    </ProjectProvider>
  );
}
