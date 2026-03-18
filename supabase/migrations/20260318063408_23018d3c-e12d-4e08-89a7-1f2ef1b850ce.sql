
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- Insert the default setting
INSERT INTO public.site_settings (key, value) 
VALUES ('show_only_products_with_images', 'false'::jsonb);
