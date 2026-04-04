-- Phase 12: Results Storage Policies
-- Run this in Supabase Dashboard → SQL Editor
--
-- IMPORTANT: First create the "results" storage bucket manually in
--   Supabase Dashboard → Storage → New Bucket
--   Name: results
--   Public: OFF (private)
--
-- Then run the storage policies below:

-- Allow authenticated users to upload to their own folder
-- (Storage policies are managed via Supabase Dashboard → Storage → Policies)
--
-- Bucket: results
-- Policy name: "Users can upload their own results"
-- Operation: INSERT
-- Expression: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy name: "Users can view their own results"
-- Operation: SELECT
-- Expression: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy name: "Users can delete their own results"
-- Operation: DELETE
-- Expression: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy name: "Service role has full access"
-- Operation: ALL
-- Expression: true
-- Role: service_role

-- No SQL changes needed — storage policies are set via Dashboard UI.
-- This file documents the required configuration.

SELECT 'Phase 12 migration notes recorded' as status;
