-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_recycled_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  month_recycled_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Iniciante',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_fc NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'geral',
  image_url TEXT DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view products" ON public.products FOR SELECT TO authenticated USING (active = true);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Collection points table
CREATE TABLE public.collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view collection points" ON public.collection_points FOR SELECT TO authenticated USING (active = true);

CREATE TRIGGER update_collection_points_updated_at BEFORE UPDATE ON public.collection_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'reciclagem',
  material TEXT DEFAULT '',
  weight_kg NUMERIC(10,2) DEFAULT 0,
  collection_point_id UUID REFERENCES public.collection_points(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Material conversion rates table
CREATE TABLE public.material_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity_per_fenix NUMERIC(10,2) NOT NULL,
  fenix_per_unit NUMERIC(10,2) NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.material_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view rates" ON public.material_rates FOR SELECT TO authenticated USING (active = true);