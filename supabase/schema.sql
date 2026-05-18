-- =====================================================
-- FIX RLS + STORAGE
-- =====================================================

-- Désactiver RLS sur articles pour lecture publique
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON articles TO anon;

-- =====================================================
-- Supabase Storage: Bucket pour images
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Politique lecture publique pour les images
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Politique upload pour utilisateurs connectés
CREATE POLICY IF NOT EXISTS "Auth Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');