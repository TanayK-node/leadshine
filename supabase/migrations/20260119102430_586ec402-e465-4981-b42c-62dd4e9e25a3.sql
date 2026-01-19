-- Update all products where is_deleted is NULL to be false
UPDATE products SET is_deleted = false WHERE is_deleted IS NULL;

-- Also set a default value for future inserts to prevent this issue
ALTER TABLE products ALTER COLUMN is_deleted SET DEFAULT false;