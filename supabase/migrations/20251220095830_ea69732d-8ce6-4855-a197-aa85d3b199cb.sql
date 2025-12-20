-- Add additional columns to classifications table for navbar/category display
ALTER TABLE public.classifications 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS emoji text DEFAULT '',
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS show_in_navbar boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS item_count_label text DEFAULT 'items';

-- Update existing classifications with slugs
UPDATE public.classifications SET slug = 'toys-and-games', emoji = '🎮', display_order = 1 WHERE name = 'Toys & Games';
UPDATE public.classifications SET slug = 'art-and-crafts', emoji = '🎨', display_order = 2 WHERE name = 'Art & Crafts';
UPDATE public.classifications SET slug = 'school-essentials', emoji = '📚', display_order = 3 WHERE name = 'School Essentials';
UPDATE public.classifications SET slug = 'kids-accessories', emoji = '👒', display_order = 4 WHERE name = 'Kids Accessories';
UPDATE public.classifications SET slug = 'new-arrivals', emoji = '✨', display_order = 5, show_in_navbar = false WHERE name = 'New Arrivals';