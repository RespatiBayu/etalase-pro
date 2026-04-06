-- ─────────────────────────────────────────────────────────────────────────────
-- 007_reset_tokens.sql
--
-- Reset semua token user ke 0.
-- Token sekarang hanya bisa masuk lewat sistem klaim (token_claims),
-- bukan langsung di-credit saat webhook.
--
-- JALANKAN INI SEKALI di Supabase SQL Editor sebelum app launch.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Reset semua saldo token ke 0
UPDATE profiles SET tokens = 0;

-- 2. Hapus semua transaksi lama (opsional — hapus komentar jika mau bersih total)
-- DELETE FROM token_transactions;

-- 3. Verifikasi hasilnya
SELECT id, email, tokens FROM profiles ORDER BY created_at;
