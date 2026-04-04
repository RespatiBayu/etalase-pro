export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { ComingSoon } from "@/components/ComingSoon";

export default function TrackerPage() {
  return (
    <AppShell>
      <ComingSoon
        title="Profit Tracker"
        description="Hitung HPP, biaya marketplace, dan estimasi profit untuk semua produkmu dengan mudah."
        eta="Phase C"
        features={[
          "Kalkulator HPP + biaya otomatis",
          "Formula biaya Shopee / Tokopedia / TikTok",
          "Analisa profit per produk",
          "Import CSV katalog produk",
          "Rekomendasi harga jual AI",
        ]}
      />
    </AppShell>
  );
}
