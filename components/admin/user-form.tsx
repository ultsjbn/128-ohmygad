"use client";

import { cn } from "@/lib/utils";
import { InputText, Button, Select, SelectItem } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  role: string;
  display_name?: string;
  contact_num?: string;
  address?: string;
  pronouns?: string;
  sex_at_birth?: string;
  gender_identity?: string;
  college?: string;
  program?: string;
  student_num?: string;
  year_level?: string;
  gso_attended?: string;
  is_onboarded?: boolean;
}

interface EditUserData extends Partial<CreateUserData> {
  id: string;
}

interface UserFormProps extends React.ComponentPropsWithoutRef<"div"> {
  initialData?: EditUserData;
}

export default function UserForm({ className, initialData, ...props }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  if (isEdit && !initialData?.id) throw new Error("Cannot edit user: missing user ID");

  // ── STATE ──
  const [full_name, setFullName] = useState(initialData?.full_name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialData?.role ?? "");

  const [display_name, setDisplayName] = useState(initialData?.display_name ?? "");
  const [contact_num, setContactNum] = useState(initialData?.contact_num ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [pronouns, setPronouns] = useState(initialData?.pronouns ?? "");
  const [sex_at_birth, setSexAtBirth] = useState(initialData?.sex_at_birth ?? "");
  const [gender_identity, setGenderIdentity] = useState(initialData?.gender_identity ?? "");
  const [college, setCollege] = useState(initialData?.college ?? "");
  const [program, setProgram] = useState(initialData?.program ?? "");
  const [student_num, setStudentNum] = useState(initialData?.student_num ?? "");
  const [year_level, setYearLevel] = useState(initialData?.year_level ?? "");
  const [gso_attended, setGsoAttended] = useState(initialData?.gso_attended ?? "");
  const [is_onboarded, setIsOnboarded] = useState(initialData?.is_onboarded ?? true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── HELPERS ──
  const handleStudentNumChange = (_e: unknown, newValue: string) => {
    const digits = newValue.replace(/\D/g, "").slice(0, 9);
    setStudentNum(digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits);
  };

  // ── SUBMIT ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: Partial<CreateUserData> = {
        full_name,
        email,
        display_name,
        role,
        contact_num,
        address,
        pronouns,
        sex_at_birth,
        gender_identity,
        college,
        program,
        student_num,
        year_level,
        gso_attended,
        is_onboarded,
      };

      if (!isEdit || password) payload.password = password;

      const endpoint = isEdit
        ? `/api/admin/update-user?id=${initialData!.id}`
        : "/api/admin/create-user";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save user");

      router.push("/admin/users");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ── RENDER ──
  return (
    <div
      className={cn(
        "flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white",
        className
      )}
      {...props}
    >
      <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
        {isEdit ? "Edit User" : "Add New User"}
      </Typography>
      <Typography variant="body-2" className="text-fractal-text-placeholder">
        {isEdit
          ? "Edit the user account and profile details."
          : "Create a new user account and fill in their profile details."}
      </Typography>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">

          {/* ── Account Information ── */}
          <Typography variant="body-1-median">Account Information</Typography>
          <InputText id="full_name" label="Full Name *" required fullWidth value={full_name} onChange={(_e, val) => setFullName(val)} />
          <InputText id="email" label="Email *" type="email" required fullWidth value={email} onChange={(_e, val) => setEmail(val)} />
          <InputText id="password" label={isEdit ? "Password (leave blank to keep)" : "Password *"} type="password" required={!isEdit} fullWidth value={password} onChange={(_e, val) => setPassword(val)} />
          <Select id="role" label="Role *" fullWidth required value={role} onSelect={(val) => setRole(val)}>
            <SelectItem value="admin" label="Admin" />
            <SelectItem value="faculty" label="Faculty" />
            <SelectItem value="student" label="Student" />
          </Select>

          {/* ── Profile Details ── */}
          <Typography variant="body-1-median">Profile Details</Typography>
          <InputText id="display_name" label="Display Name" fullWidth value={display_name} onChange={(_e, val) => setDisplayName(val)} />
          <InputText id="student_num" label="Student Number" fullWidth value={student_num} onChange={handleStudentNumChange} placeholder="e.g. 2021-12345" />
          <Select id="year_level" label="Year Level" fullWidth value={year_level} onSelect={(val) => setYearLevel(val)}>
            <SelectItem value="1st Year" label="1st Year" />
            <SelectItem value="2nd Year" label="2nd Year" />
            <SelectItem value="3rd Year" label="3rd Year" />
            <SelectItem value="4th Year" label="4th Year" />
            <SelectItem value="5th Year" label="5th Year" />
          </Select>
          <Select id="college" label="College" fullWidth value={college} onSelect={(val) => setCollege(val)}>
            <SelectItem value="CS" label="College of Science (CS)" />
            <SelectItem value="CAC" label="College of Arts and Communications (CAC)" />
            <SelectItem value="CSS" label="College of Social Sciences (CSS)" />
          </Select>
          <InputText id="program" label="Program" fullWidth value={program} onChange={(_e, val) => setProgram(val)} />
          <InputText id="contact_num" label="Contact Number" fullWidth value={contact_num} onChange={(_e, val) => setContactNum(val)} />
          <InputText id="address" label="Address" fullWidth value={address} onChange={(_e, val) => setAddress(val)} />
          <InputText id="pronouns" label="Pronouns" fullWidth value={pronouns} onChange={(_e, val) => setPronouns(val)} />
          <Select id="sex_at_birth" label="Sex at Birth" fullWidth value={sex_at_birth} onSelect={(val) => setSexAtBirth(val)}>
            <SelectItem value="Male" label="Male" />
            <SelectItem value="Female" label="Female" />
            <SelectItem value="Intersex" label="Intersex" />
            <SelectItem value="Prefer not to say" label="Prefer not to say" />
          </Select>
          <Select id="gender_identity" label="Gender Identity" fullWidth value={gender_identity} onSelect={(val) => setGenderIdentity(val)}>
            <SelectItem value="Man" label="Man" />
            <SelectItem value="Woman" label="Woman" />
            <SelectItem value="Non-binary" label="Non-binary" />
            <SelectItem value="Genderqueer" label="Genderqueer" />
            <SelectItem value="Genderfluid" label="Genderfluid" />
            <SelectItem value="Agender" label="Agender" />
            <SelectItem value="Prefer not to say" label="Prefer not to say" />
            <SelectItem value="Self-describe" label="Prefer to self-describe" />
          </Select>
          <InputText id="gso_attended" label="GSO Attended" type="number" fullWidth value={gso_attended} onChange={(_e, val) => setGsoAttended(val)} />
          <Select id="is_onboarded" label="Onboarded?" fullWidth value={is_onboarded ? "true" : "false"} onSelect={(val) => setIsOnboarded(val === "true")}>
            <SelectItem value="true" label="Yes" />
            <SelectItem value="false" label="No" />
          </Select>

          {error && <Typography variant="body-2" className="text-fractal-feedback-error-50">{error}</Typography>}

          <div className="flex gap-3 pt-2">
            <Button type="button" label="Cancel" variant="secondary" onClick={() => router.push("/admin/users")} />
            <Button type="submit" label={isLoading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update User" : "Create User")} variant="primary" disabled={isLoading} />
          </div>
        </div>
      </form>
    </div>
  );
}