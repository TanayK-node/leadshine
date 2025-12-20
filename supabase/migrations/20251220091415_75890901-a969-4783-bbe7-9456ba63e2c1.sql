-- Update constraint to include 'confirmed' status for successful payments
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'out for delivery', 'delivered', 'cancelled'));