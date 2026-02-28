"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    // ← this was missing in your debug version
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

            </div>

            {/* Only show sign-up link for students.
                Admins and faculty are pre-created by the administrator. */}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}