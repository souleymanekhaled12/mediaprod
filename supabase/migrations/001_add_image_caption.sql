-- Migration: Add image_caption column to articles table
-- Created: 2026-05-18

BEGIN;

-- Add image_caption column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_caption TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN articles.image_caption IS 'Caption text for the article featured image';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_image_caption ON articles(image_caption);

COMMIT;
