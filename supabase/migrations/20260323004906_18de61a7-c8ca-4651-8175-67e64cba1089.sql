
-- Allow admins to view ALL products (including inactive)
CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view ALL collection points (including inactive)
CREATE POLICY "Admins can view all collection points"
ON public.collection_points FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view ALL material rates (including inactive)
CREATE POLICY "Admins can view all material rates"
ON public.material_rates FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));
