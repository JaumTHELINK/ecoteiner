
-- Protect financial columns on INSERT as well
CREATE OR REPLACE FUNCTION public.protect_profile_financial_fields_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Force default values for financial columns on user insert
  IF NOT has_role(auth.uid(), 'admin') THEN
    NEW.balance := 0;
    NEW.level := 'Iniciante';
    NEW.total_recycled_kg := 0;
    NEW.month_recycled_kg := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_financial_fields_insert_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_financial_fields_insert();
