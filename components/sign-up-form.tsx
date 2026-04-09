"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { validateFullName, validatePassword } from "@/lib/validation";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
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

    if (full_name) {
      const nameErr = validateFullName(full_name);
      if (nameErr) {
        setError(nameErr);
        setIsLoading(false);
        return;
      }
    }

    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
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
    <div className={cn("auth-card max-w-md w-full mx-auto", className)} {...props}>
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="heading-lg m-1">Sign up</h2>
        <p className="caption">Create an account to get started.</p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3">

        {/* Full Name Input */}
        <div className="input-wrap">
          <label htmlFor="full_name" className="label">Full Name</label>
          <div className="input-icon-wrap">
            <User className="input-prefix-icon w-2 h-2" />
            <input
              id="full_name"
              type="text"
              required
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              maxLength={64}
            />
          </div>
        </div>

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
          <label htmlFor="password" className="label">Password</label>
          <div className="input-icon-wrap">
            <Lock className="input-prefix-icon w-2 h-2" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
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
        </div>

        {/* Repeat Password Input */}
        <div className="input-wrap">
          <label htmlFor="repeat-password" className="label">Repeat Password</label>
          <div className="input-icon-wrap">
            <Lock className="input-prefix-icon w-2 h-2" />
            <input
              id="repeat-password"
              type={showRepeatPassword ? "text" : "password"}
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={cn(
                "input",
                password && repeatPassword && password !== repeatPassword && "input-error"
              )}
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray)] hover:text-[var(--text)] transition-colors"
              tabIndex={-1}
            >
              {showRepeatPassword ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
            </button>
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
          className="btn btn-pink w-full justify-center mt-2"
        >
          {isLoading ? "Creating an account..." : "Sign up"}
        </button>

        {/* Footer Link */}
        <div className="mt-2 text-center">
          <p className="body">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[var(--periwinkle)] hover:text-[var(--primary-dark)] transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}