-- Add soft delete column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);

-- Update RLS policy to exclude deleted products from public view
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
CREATE POLICY "Products are publicly readable" ON products
FOR SELECT USING (is_deleted = false OR auth.role() = 'authenticated');
