"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, User } from "lucide-react";

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

    if (full_name) {
      const fullnameRegex = /^[a-zA-Z\s.'-]+$/;
      if (!fullnameRegex.test(full_name)) {
        setError("Full name can only contain letters, spaces, and basic punctuation.");
        setIsLoading(false);
        return;
      }
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
      <div className="flex flex-col items-center mb-4 text-center">
        <Image
          src="/kasarian_logo.jpg"
          alt="UPB Kasarian Gender Studies Program Logo"
          width={80}
          height={80}
          className="rounded-full object-cover mb-4 shadow-soft border-2 border-white"
        />
        <h2 className="heading-lg">Sign up</h2>
        <p className="body text-[var(--gray)] mt-1">
          Create an account to get started
        </p>
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Repeat Password Input */}
        <div className="input-wrap">
          <label htmlFor="repeat-password" className="label">Repeat Password</label>
          <div className="input-icon-wrap">
            <Lock className="input-prefix-icon w-2 h-2" />
            <input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={cn(
                "input",
                password && repeatPassword && password !== repeatPassword && "input-error"
              )}
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