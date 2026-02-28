"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Card, InputText, Button, Typography } from "@snowball-tech/fractal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      console.log("Auth data:", authData);
      console.log("Auth error:", authError);

      if (authError) throw authError;

      console.log("User ID:", authData.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      console.log("Profile data:", profile);
      console.log("Profile error:", profileError);

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("No profile found for this account. Please contact the administrator.");
      }

      switch (profile.role) {
        case "admin":
          router.push("/admin");
          break;
        case "faculty":
          router.push("/faculty/dashboard");
          break;
        case "student":
          router.push("/student/dashboard");
          break;
        default:
          await supabase.auth.signOut();
          throw new Error("Your account role is not recognized. Please contact the administrator.");
      }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white", className)} {...props}>
      <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
        Login
      </Typography>
      <Card color="body">

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-3">

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

            <div className="flex flex-col gap-half">
              <div className="flex items-center justify-between">
                <Typography variant="body-2-median" element="label">Password</Typography>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm underline-offset-4 hover:underline text-fractal-text-placeholder"
                >
                  Forgot your password?
                </Link>
              </div>
              <InputText
                id="password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(_e, newValue) => setPassword(newValue)}
                className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
              />
            </div>

            {error && (
              <Typography variant="body-2" className="text-fractal-feedback-error-50">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              label={isLoading ? "Logging in..." : "Login"}
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="[&]:text-fractal-base-white [&]:border-2 [&]:border-fractal-border-default [&:hover]:text-fractal-base-black [&:hover]:border-2 [&:hover]:border-fractal-border-default"
            />
          </div>

          <div className="mt-3 text-center">
            <Typography variant="body-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 text-fractal-brand-primary font-median"
              >
                Sign up
              </Link>
            </Typography>
          </div>
        </form>
      </Card>
    </div>
  );
}