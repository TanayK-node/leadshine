-- Drop and recreate the ALL policy for coupons to fix the role check
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;

CREATE POLICY "Authenticated users can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);