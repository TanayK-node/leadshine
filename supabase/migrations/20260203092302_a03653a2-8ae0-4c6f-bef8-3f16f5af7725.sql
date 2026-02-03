-- Soft delete all products from brand "Alphabet Baby"
-- Remove from carts and wishlists first, then mark as deleted

DELETE FROM cart_items WHERE product_id IN (
  SELECT id FROM products WHERE "Brand Desc" = 'Alphabet Baby'
);

DELETE FROM wishlist WHERE product_id IN (
  SELECT id FROM products WHERE "Brand Desc" = 'Alphabet Baby'
);

UPDATE products 
SET is_deleted = true, "QTY" = 0 
WHERE "Brand Desc" = 'Alphabet Baby';