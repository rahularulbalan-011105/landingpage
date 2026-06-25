import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const betaSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(320),
  user_type: z
    .string()
    .trim()
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  robot_idea: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type BetaSignupInput = z.infer<typeof betaSignupSchema>;

export async function submitBetaSignup(input: BetaSignupInput) {
  const parsed = betaSignupSchema.parse(input);
  const { error } = await supabase.from("beta_signups").insert({
    email: parsed.email,
    user_type: parsed.user_type ?? null,
    robot_idea: parsed.robot_idea ?? null,
  });
  if (error) throw error;
}
