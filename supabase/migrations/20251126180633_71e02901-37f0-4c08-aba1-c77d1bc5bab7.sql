-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT orders_status_check;

-- Add the updated check constraint with 'confirmed' status
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]));