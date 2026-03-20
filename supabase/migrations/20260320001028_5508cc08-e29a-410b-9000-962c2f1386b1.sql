
-- 1. Drop the dangerous "Users can update own profile" policy and replace with one that only allows non-financial fields
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile safe fields"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger to prevent users from modifying financial columns
CREATE OR REPLACE FUNCTION public.protect_profile_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the caller is NOT an admin, prevent changes to financial/level columns
  IF NOT has_role(auth.uid(), 'admin') THEN
    NEW.balance := OLD.balance;
    NEW.level := OLD.level;
    NEW.total_recycled_kg := OLD.total_recycled_kg;
    NEW.month_recycled_kg := OLD.month_recycled_kg;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_financial_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_financial_fields();

-- 2. Drop the dangerous "Users can insert own transactions" policy
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
