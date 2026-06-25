
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_type TEXT,
  robot_idea TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.beta_signups TO anon, authenticated;
GRANT ALL ON public.beta_signups TO service_role;

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a beta signup"
  ON public.beta_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 320
    AND length(coalesce(user_type, '')) <= 64
    AND length(coalesce(robot_idea, '')) <= 2000
  );
