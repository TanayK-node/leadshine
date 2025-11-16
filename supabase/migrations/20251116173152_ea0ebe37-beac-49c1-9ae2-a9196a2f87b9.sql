-- Add shipping address columns to orders table
ALTER TABLE public.orders
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN shipping_address TEXT,
ADD COLUMN shipping_city TEXT,
ADD COLUMN shipping_state TEXT,
ADD COLUMN shipping_pincode TEXT;