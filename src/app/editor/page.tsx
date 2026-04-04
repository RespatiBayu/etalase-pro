export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { ComingSoon } from "@/components/ComingSoon";

export default function EditorPage() {
  return (
    <AppShell>
      <ComingSoon
        title="Foto Editor"
        description="Edit foto produkmu langsung di browser — background remover, teks overlay, sticker, dan batch edit."
        eta="Phase B"
        features={[
          "Remove & ganti background",
          "Tambah teks & overlay",
          "Sticker & watermark",
          "Batch edit banyak foto sekaligus",
          "Latar AI (token-based)",
        ]}
      />
    </AppShell>
  );
}
