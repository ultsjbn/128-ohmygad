"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownDivider } from "./ui";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        .select("role, is_onboarded")
        .eq("id", authData.user.id)
        .single();

      console.log("Profile data:", profile);
      console.log("Profile error:", profileError);

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("No profile found for this account. Please contact the administrator.");
      }

      if (!profile.is_onboarded) {
        router.push("/auth/onboarding");
        return;
      }

      switch (profile.role) {
        case "admin":
          router.push("/admin");
          break;
        case "faculty":
          router.push("/faculty");
          break;
        case "student":
          router.push("/student");
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
    <div className={cn("auth-card w-full", className)} {...props}>
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="heading-lg m-1">Welcome!</h2>
        <p className="caption">Sign in to your account to continue.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        
        {/* Email Input */}
        <div className="input-wrap">
          <label htmlFor="email" className="label">Email</label>
          <div className="input-icon-wrap">
            <Mail className="input-prefix-icon w-2 h-2" />
            <input
              id="email"
              type="email"
              placeholder="jmdelacruz@up.edu.ph"
            //   required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="input-wrap">
          <label htmlFor="password" className="label">Password</label>
          <div className="input-icon-wrap">
            <Lock className="input-prefix-icon w-2 h-2" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
            //   required
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray)] hover:text-[var(--text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="caption hover:text-[var(--primary-dark)] hover:underline underline-offset-4 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="toast toast-error mt-1">
            <span className="font-semibold text-[var(--error)]">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full justify-center mt-2"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

      </form>

      <form action={signInWithGoogle} className="flex flex-col gap-4 pt-4 items-center">
        <hr className="w-full border-[var(--gray)] m-4" />
        <Button type="submit" variant="ghost" className="w-full">
          Sign in with Google
        </Button>
      </form>

      {/* Footer Link */}
      <div className="mt-4 text-center">
        <p className="body">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-bold text-[var(--soft-pink)] hover:text-[var(--primary-dark)] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}