-- Drop the old constraint first
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Now update any existing orders with old statuses to new ones
UPDATE orders 
SET status = 'out for delivery' 
WHERE status IN ('processing', 'shipped', 'delivered');

-- Add new constraint with updated status values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'out for delivery', 'cancelled'));