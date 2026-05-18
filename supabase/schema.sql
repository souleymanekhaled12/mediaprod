-- =====================================================
-- FIX RLS - Exécuter dans Supabase SQL Editor
-- =====================================================

-- Désactiver RLS sur articles pour lecture publique
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- Donner l'accès en lecture au rôle anon (utilisé par le site)
GRANT SELECT ON articles TO anon;