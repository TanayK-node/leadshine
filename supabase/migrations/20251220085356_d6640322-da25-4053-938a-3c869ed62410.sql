-- Drop the existing check constraint and add a new one that includes 'delivered'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'out for delivery', 'delivered', 'cancelled'));