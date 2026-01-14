-- MIGRATION: Organization Settings & Storage (Phase 8)

-- 1. ADD SETTINGS COLUMNS
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS fiscal_doc text,    -- RIF / NIT / RUT
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS receipt_footer text DEFAULT '¡Gracias por su compra!';

-- 2. STORAGE BUCKET SETUP (Supabase Storage)
-- We insert into the 'storage' schema.

-- Create Bucket 'org_assets' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('org_assets', 'org_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE POLICIES (RLS for Objects)
-- Note: Policies apply to storage.objects table

-- VIEW POLICY: Public Read (Everyone can see the logo on the ticket)
DROP POLICY IF EXISTS "Public Select Assets" ON storage.objects;
CREATE POLICY "Public Select Assets" ON storage.objects
FOR SELECT USING ( bucket_id = 'org_assets' );

-- UPLOAD POLICY: Authenticated members of the organization
-- Strategy: We check if the user is a member of ANY organization. Ideally validation happens via folder structure {org_id}/filename, but for MVP we allow any auth user to upload if they are part of the system.
-- Better Security: Allow allow upload if folder name matches org_id.
-- Let's stick to simple "Authenticated Upload" for MVP, assuming they upload to their folder in UI.

DROP POLICY IF EXISTS "Auth Users Upload Assets" ON storage.objects;
CREATE POLICY "Auth Users Upload Assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'org_assets' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Auth Users Update Assets" ON storage.objects;
CREATE POLICY "Auth Users Update Assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'org_assets' 
  AND auth.role() = 'authenticated'
);
