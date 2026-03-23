
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active categories" ON public.product_categories FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Admins can view all categories" ON public.product_categories FOR SELECT TO public USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert categories" ON public.product_categories FOR INSERT TO public WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update categories" ON public.product_categories FOR UPDATE TO public USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete categories" ON public.product_categories FOR DELETE TO public USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed with existing categories
INSERT INTO public.product_categories (name, label) VALUES
  ('descontos', 'Descontos'),
  ('vales', 'Vales'),
  ('produtos', 'Produtos Físicos');
