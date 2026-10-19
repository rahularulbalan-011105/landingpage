-- Constructa — tighten anonymous beta sign-ups.
--
-- Already correct before this file: the table is INSERT-only for anon (no SELECT
-- grant and no SELECT policy), so the list cannot be read back by visitors, and
-- the insert policy caps field lengths.
--
-- This adds a shape check so the table can't be filled with arbitrary junk in the
-- email column. Volume flooding by a determined attacker still needs a captcha
-- (e.g. Cloudflare Turnstile) or an edge function with per-IP rate limiting —
-- Postgres alone cannot see the caller's IP. Safe to re-run.

ALTER TABLE public.beta_signups DROP CONSTRAINT IF EXISTS beta_signups_email_shape;
ALTER TABLE public.beta_signups
  ADD CONSTRAINT beta_signups_email_shape
  CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- Re-assert that anonymous visitors can only write, never read.
REVOKE SELECT, UPDATE, DELETE ON public.beta_signups FROM anon, authenticated;
