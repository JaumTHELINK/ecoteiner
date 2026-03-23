INSERT INTO storage.buckets (id, name, public) VALUES ('promotion-images', 'promotion-images', true);

CREATE POLICY "Admins can upload promotion images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'promotion-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update promotion images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'promotion-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete promotion images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'promotion-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can view promotion images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'promotion-images');