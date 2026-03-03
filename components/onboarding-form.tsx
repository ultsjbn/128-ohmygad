"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { InputText, Button, Select, SelectItem } from "@snowball-tech/fractal";
import { Typography } from "./typography";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Shared fields (all roles)
  const [display_name, setDisplayName] = useState("");
  const [contact_num, setContactNum] = useState("");
  const [address, setAddress] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [sex_at_birth, setSexAtBirth] = useState("");
  const [gender_identity, setGenderIdentity] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");

  // Student-only fields
  const [student_num, setStudentNum] = useState("");
  const [year_level, setYearLevel] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch role on mount so we know which fields to show
  useEffect(() => {
    const fetchRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? null);
      setIsLoadingRole(false);
    };

    fetchRole();
  }, [router]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("No active session found. Please log in again.");

      // Build update payload — student fields only included if role is student
      const updatePayload: Record<string, unknown> = {
        display_name: display_name || null,
        contact_num: contact_num || null,
        address: address || null,
        pronouns: pronouns || null,
        sex_at_birth,
        gender_identity: gender_identity || null,
        college,
        program: program || null,
        is_onboarded: true,
      };

      if (role === "student") {
        updatePayload.student_num = student_num || null;
        updatePayload.year_level = year_level || null;
      }

      const { error: profileError } = await supabase
        .from("profile")
        .update(updatePayload)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Redirect based on role after onboarding
      switch (role) {
        case "admin":
          router.push("/admin");
          break;
        case "faculty":
          router.push("/faculty");
          break;
        case "student":
        default:
          router.push("/student/dashboard");
          break;
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching role
  if (isLoadingRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <Typography variant="body-2" className="text-fractal-text-placeholder">Loading...</Typography>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white", className)} {...props}>
      <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
        Complete Your Profile
      </Typography>
      <Typography variant="body-2" className="text-fractal-text-placeholder">
        {role === "student" && "Fill in your details to finish setting up your student account."}
        {role === "faculty" && "Fill in your details to finish setting up your faculty account."}
        {role === "admin" && "Fill in your details to finish setting up your admin account."}
      </Typography>

      <form onSubmit={handleOnboarding}>
        <div className="flex flex-col gap-3">

          {/* Display Name — all roles */}
          <InputText
            id="display_name"
            label="Display Name (optional)"
            type="text"
            placeholder="How you want to be called"
            fullWidth
            value={display_name}
            onChange={(_e, newValue) => setDisplayName(newValue)}
            className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
          />

          {/* Student Number — students only */}
          {role === "student" && (
            <InputText
              id="student_num"
              label="Student Number"
              type="text"
              placeholder="2021-12345"
              fullWidth
              value={student_num}
              onChange={(_e, newValue) => setStudentNum(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />
          )}

          {/* Year Level — students only */}
          {role === "student" && (
            <Select
              id="year_level"
              label="Year Level"
              placeholder="Select year level"
              fullWidth
              onSelect={(value) => setYearLevel(value)}
            >
              <SelectItem value="1st Year" label="1st Year" />
              <SelectItem value="2nd Year" label="2nd Year" />
              <SelectItem value="3rd Year" label="3rd Year" />
              <SelectItem value="4th Year" label="4th Year" />
              <SelectItem value="5th Year" label="5th Year" />
            </Select>
          )}

          {/* College — students only */}
          {role === "student" && (
            <Select
              id="college"
              label="College *"
              placeholder="Select college"
              fullWidth
              required
              onSelect={(value) => setCollege(value)}
            >
              <SelectItem value="CAS" label="College of Science (CS)" />
              <SelectItem value="CAC" label="College of Arts and Communications (CAC)" />
              <SelectItem value="CSSP" label="College of Social Sciences (CSS)" />
            </Select>
          )}

          {/* Program — students only */}
          {role === "student" && (
            <InputText
              id="program"
              label="Program (optional)"
              type="text"
              placeholder="e.g. BS Computer Science"
              fullWidth
              value={program}
              onChange={(_e, newValue) => setProgram(newValue)}
              className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
            />
          )}

          {/* Contact Number — all roles */}
          <InputText
            id="contact_num"
            label="Contact Number (optional)"
            type="text"
            placeholder="09XX XXX XXXX"
            fullWidth
            value={contact_num}
            onChange={(_e, newValue) => setContactNum(newValue)}
            className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
          />

          {/* Address — all roles */}
          <InputText
            id="address"
            label="Address (optional)"
            type="text"
            placeholder="Baguio City"
            fullWidth
            value={address}
            onChange={(_e, newValue) => setAddress(newValue)}
            className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
          />

          {/* Pronouns — all roles */}
          <InputText
            id="pronouns"
            label="Pronouns (optional)"
            type="text"
            placeholder="e.g. she/her, he/him, they/them"
            fullWidth
            value={pronouns}
            onChange={(_e, newValue) => setPronouns(newValue)}
            className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
          />

          {/* Sex at Birth — all roles */}
          <Select
            id="sex_at_birth"
            label="Sex at Birth *"
            placeholder="Select sex at birth"
            fullWidth
            required
            onSelect={(value) => setSexAtBirth(value)}
          >
            <SelectItem value="Male" label="Male" />
            <SelectItem value="Female" label="Female" />
            <SelectItem value="Intersex" label="Intersex" />
          </Select>

          {/* Gender Identity — all roles */}
          <Select
            id="gender_identity"
            label="Gender Identity (optional)"
            placeholder="Select gender identity"
            fullWidth
            onSelect={(value) => setGenderIdentity(value)}
          >
            <SelectItem value="Man" label="Man" />
            <SelectItem value="Woman" label="Woman" />
            <SelectItem value="Non-binary" label="Non-binary" />
            <SelectItem value="Genderqueer" label="Genderqueer" />
            <SelectItem value="Genderfluid" label="Genderfluid" />
            <SelectItem value="Agender" label="Agender" />
            <SelectItem value="Prefer not to say" label="Prefer not to say" />
            <SelectItem value="Self-describe" label="Prefer to self-describe" />
          </Select>

          {error && (
            <Typography variant="body-2" className="text-fractal-feedback-error-50">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            label={isLoading ? "Saving..." : "Complete Profile"}
            variant="primary"
            fullWidth
            disabled={isLoading}
            className="[&]:text-fractal-base-white [&]:border-2 [&]:border-fractal-border-default [&:hover]:text-fractal-base-black [&:hover]:border-2 [&:hover]:border-fractal-border-default"
          />

        </div>
      </form>
    </div>
  );
}