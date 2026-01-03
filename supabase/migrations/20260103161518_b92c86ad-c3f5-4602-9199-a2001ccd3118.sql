-- Drop the existing foreign key constraint and recreate with ON DELETE SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_coupon_id_fkey;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_coupon_id_fkey 
FOREIGN KEY (coupon_id) 
REFERENCES public.coupons(id) 
ON DELETE SET NULL;