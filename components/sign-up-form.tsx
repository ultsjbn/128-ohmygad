"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Typography } from "./typography";
import { Card, InputText, Button } from "@snowball-tech/fractal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/onboarding`,  // redirect to onboarding after email confirm
          data: {
            full_name,  // passed to trigger via raw_user_meta_data
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white", className)} {...props}>
      <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
        Sign up
      </Typography>
      <Card color="body">

        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-3">

            <InputText
              id="full_name"
              label="Full Name"
              type="text"
              required
              fullWidth
              value={full_name}
              onChange={(_e, newValue) => setFullName(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />

            <InputText
              id="email"
              label="Email"
              type="email"
              placeholder="m@example.com"
              required
              fullWidth
              value={email}
              onChange={(_e, newValue) => setEmail(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />

            <InputText
              id="password"
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(_e, newValue) => setPassword(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />

            <InputText
              id="repeat-password"
              label="Repeat Password"
              type="password"
              required
              fullWidth
              value={repeatPassword}
              onChange={(_e, newValue) => setRepeatPassword(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />

            {error && (
              <Typography variant="body-2" className="text-fractal-feedback-error-50">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              label={isLoading ? "Creating an account..." : "Sign up"}
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="[&]:text-fractal-base-white [&]:border-2 [&]:border-fractal-border-default [&:hover]:text-fractal-base-black [&:hover]:border-2 [&:hover]:border-fractal-border-default"
            />
          </div>

          <div className="mt-3 text-center">
            <Typography variant="body-2">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-fractal-brand-primary font-median">
                Login
              </Link>
            </Typography>
          </div>
        </form>
      </Card>
    </div>
  );
}