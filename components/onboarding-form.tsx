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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {role === "student" && "Fill in your details to finish setting up your student account."}
            {role === "faculty" && "Fill in your details to finish setting up your faculty account."}
            {role === "admin" && "Fill in your details to finish setting up your admin account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOnboarding}>
            <div className="flex flex-col gap-6">

              {/* Display Name — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="display_name">
                  Display Name <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="How you want to be called"
                  value={display_name}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Student Number — students only */}
              {role === "student" && (
                <div className="grid gap-2">
                  <Label htmlFor="student_num">Student Number</Label>
                  <Input
                    id="student_num"
                    type="text"
                    placeholder="2021-12345"
                    value={student_num}
                    onChange={(e) => setStudentNum(e.target.value)}
                  />
                </div>
              )}

              {/* Year Level — students only */}
              {role === "student" && (
                <div className="grid gap-2">
                  <Label htmlFor="year_level">Year Level</Label>
                  <Select onValueChange={setYearLevel}>
                    <SelectTrigger id="year_level">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="5th Year">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* College — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="college">
                  College <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setCollege} required>
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAS">College of Science (CS)</SelectItem>
                    <SelectItem value="CAC">College of Arts and Communications (CAC)</SelectItem>
                    <SelectItem value="CSSP">College of Social Sciences (CSS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Program — students only */}
              {role === "student" && (
              <div className="grid gap-2">
                <Label htmlFor="program">
                  Program <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="program"
                  type="text"
                  placeholder="e.g. BS Computer Science"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                />
              </div> 
              )}

              {/* Contact Number — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="contact_num">
                  Contact Number <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="contact_num"
                  type="text"
                  placeholder="09XX XXX XXXX"
                  value={contact_num}
                  onChange={(e) => setContactNum(e.target.value)}
                />
              </div>

              {/* Address — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="address">
                  Address <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Baguio City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Pronouns — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="pronouns">
                  Pronouns <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="pronouns"
                  type="text"
                  placeholder="e.g. she/her, he/him, they/them"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                />
              </div>

              {/* Sex at Birth — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="sex_at_birth">
                  Sex at Birth <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setSexAtBirth} required>
                  <SelectTrigger id="sex_at_birth">
                    <SelectValue placeholder="Select sex at birth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Intersex">Intersex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Identity — all roles */}
              <div className="grid gap-2">
                <Label htmlFor="gender_identity">
                  Gender Identity <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Select onValueChange={setGenderIdentity}>
                  <SelectTrigger id="gender_identity">
                    <SelectValue placeholder="Select gender identity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Man">Man</SelectItem>
                    <SelectItem value="Woman">Woman</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Genderqueer">Genderqueer</SelectItem>
                    <SelectItem value="Genderfluid">Genderfluid</SelectItem>
                    <SelectItem value="Agender">Agender</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    <SelectItem value="Self-describe">Prefer to self-describe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}