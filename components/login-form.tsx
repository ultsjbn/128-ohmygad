"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";

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
    <div className={cn("auth-card max-w-md w-full mx-auto", className)} {...props}>
      <div className="flex flex-col items-center mb-6 text-center">
        <Image
          src="/kasarian_logo.jpg"
          alt="UPB Kasarian Gender Studies Program Logo"
          width={80}
          height={80}
          className="rounded-full object-cover mb-4 shadow-soft border-2 border-white"
        />
        <h2 className="heading-lg">Welcome Back!</h2>
        <p className="body text-[var(--gray)] mt-1">
          Sign in to your account to continue
        </p>
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="input-wrap">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link
              href="/auth/forgot-password"
              className="caption hover:text-[var(--primary-dark)] hover:underline underline-offset-4 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="input-icon-wrap">
            <Lock className="input-prefix-icon w-2 h-2" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
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

        {/* Footer Link */}
        <div className="mt-2 text-center">
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
      </form>
    </div>
  );
}