import { Card, Button } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-fractal-bg-body-default text-fractal-text-default font-sans">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-4 border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white">
          <Typography variant="heading-2">
            Thank you for signing up!
          </Typography>
          <Card color="body" className="gap-4">
            <Typography variant="body-1">
              You&apos;ve successfully signed up. Please check your email to
              confirm your account before signing in.
            </Typography>
            <div className="mt-3">
              <Link href="/auth/login">
                <Button
                  label="Go to Login"
                  variant="primary"
                  fullWidth
                  className="[&]:text-fractal-base-white [&]:border-2 [&]:border-fractal-border-default [&:hover]:text-fractal-base-black [&:hover]:border-2 [&:hover]:border-fractal-border-default"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
