ALTER TABLE public.profiles ADD COLUMN credits integer NOT NULL DEFAULT 10;
UPDATE public.profiles SET credits = 10;
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.use_credit()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE remaining integer;
BEGIN
  UPDATE public.profiles SET credits = credits - 1
  WHERE user_id = auth.uid() AND credits > 0
  RETURNING credits INTO remaining;
  IF remaining IS NULL THEN RETURN -1; END IF;
  RETURN remaining;
END; $$;
REVOKE EXECUTE ON FUNCTION public.use_credit() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.use_credit() TO authenticated;

CREATE OR REPLACE FUNCTION public.refund_credit()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET credits = credits + 1 WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.refund_credit() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credit() TO service_role;