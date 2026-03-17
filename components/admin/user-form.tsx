"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Hash, Loader2 } from "lucide-react";
import { Button, Input, Select, Toast, Toggle, Card } from "@/components/ui";

// types
interface CreateUserData {
  full_name: string;
  email: string;
  password?: string;
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
  gso_attended?: number;
  is_onboarded?: boolean;
}

interface EditUserData extends Partial<CreateUserData> { id: string; }

interface UserFormProps {
  initialData?: EditUserData;
  onSuccess?: () => void;
  layout?: "modal" | "page";
}

// options
const ROLE_OPTIONS = [{ value: "", label: "Select role…" }, { value: "admin", label: "Admin" }, { value: "faculty", label: "Faculty" }, { value: "student", label: "Student" }];
const YEAR_OPTIONS = [{ value: "", label: "Select year…" }, { value: "1st Year", label: "1st Year" }, { value: "2nd Year", label: "2nd Year" }, { value: "3rd Year", label: "3rd Year" }, { value: "4th Year", label: "4th Year" }, { value: "5th Year", label: "5th Year" }];
const COLLEGE_OPTIONS = [{ value: "", label: "Select college…" }, { value: "CS", label: "College of Science (CS)" }, { value: "CAC", label: "College of Arts and Communications (CAC)" }, { value: "CSS", label: "College of Social Sciences (CSS)" }];
const SEX_OPTIONS = [{ value: "", label: "Select…" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Intersex", label: "Intersex" }, { value: "Prefer not to say", label: "Prefer not to say" }];
const GENDER_OPTIONS = [{ value: "", label: "Select…" }, { value: "Man", label: "Man" }, { value: "Woman", label: "Woman" }, { value: "Non-binary", label: "Non-binary" }, { value: "Genderqueer", label: "Genderqueer" }, { value: "Genderfluid", label: "Genderfluid" }, { value: "Agender", label: "Agender" }, { value: "Prefer not to say", label: "Prefer not to say" }, { value: "Self-describe", label: "Prefer to self-describe" }];

// section label for modal view
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-full text-[10px] uppercase tracking-widest pb-1 border-b border-gray-100 mb-1 mt-2 font-semibold text-gray-500">
      {children}
    </p>
  );
}

export default function UserForm({ initialData, onSuccess, layout = "modal" }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  if (isEdit && !initialData?.id) throw new Error("Cannot edit user: missing user ID");

  // state
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
  const [gso_attended, setGsoAttended] = useState<string | number>(initialData?.gso_attended ?? "");
  const [is_onboarded, setIsOnboarded] = useState(initialData?.is_onboarded ?? true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // helpers
  const handleStudentNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setStudentNum(digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits);
  };

  const handleContactNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setContactNum(digits);
  };

  const handleCancel = () => {
    if (onSuccess) onSuccess();
    else router.push("/admin/users");
  };

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!full_name || !email || !role || (!isEdit && !password)) {
        throw new Error("Please fill in all required fields.");
      }

      if (password && password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      if (contact_num) {
        const contactRegex = /^[0-9]{10,15}$/;
        if (!contactRegex.test(contact_num)) {
          throw new Error("Contact number must be 10-15 digits.");
        }
      }

      if (student_num) {
        const cleanStudentNum = student_num.replace(/\D/g, "");
        if (cleanStudentNum.length !== 9) {
          throw new Error("Student number must be exactly 9 digits.");
        }
      }

      const gsoNum = gso_attended === "" ? 0 : Number(gso_attended);
      if (gsoNum < 0 || gsoNum > 5) {
        throw new Error("GSO Sessions Attended must be between 0 and 5.");
      }

      const cleanStudentNum = student_num ? student_num.replace(/\D/g, "") : undefined;

      const payload: Partial<CreateUserData> = {
        full_name, email, display_name, role, contact_num, address,
        pronouns, sex_at_birth, gender_identity, college, program,
        student_num: cleanStudentNum, year_level, is_onboarded,
        gso_attended: gsoNum,
      };

      if (isEdit) (payload as any).id = initialData!.id;
      if (!isEdit || password) payload.password = password;

      const endpoint = isEdit ? `/api/admin/update-user?id=${initialData!.id}` : "/api/admin/create-user";

      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save user");

      if (onSuccess) onSuccess();
      else { router.push("/admin/users"); router.refresh(); }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // page layout
  if (layout === "page") {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start w-full">

          <Card className="flex flex-col gap-3 p-5 sm:p-6 w-full">
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--primary-dark)" }}>Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <Input label="Full Name" required prefixIcon={<User size={15} />} placeholder="e.g. Maria Santos" value={full_name} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" type="email" required prefixIcon={<Mail size={15} />} placeholder="m@up.edu.ph" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label={isEdit ? "Password (leave blank to keep)" : "Password"} type="password" required={!isEdit} prefixIcon={<Lock size={15} />} placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Select label="Role" required value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
            </div>

            <hr className="border-gray-100 my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <Input label="Display Name" placeholder="Nickname or preferred name" value={display_name} onChange={(e) => setDisplayName(e.target.value)} />
              <Input label="Student Number" prefixIcon={<Hash size={15} />} placeholder="e.g. 2021-12345" value={student_num} onChange={handleStudentNumChange} />
              <Select label="Year Level" value={year_level} onChange={(e) => setYearLevel(e.target.value)} options={YEAR_OPTIONS} />
              <Select label="College" value={college} onChange={(e) => setCollege(e.target.value)} options={COLLEGE_OPTIONS} />
              <Input label="Program" placeholder="e.g. BS Computer Science" value={program} onChange={(e) => setProgram(e.target.value)} />
              <Input label="Contact Number" prefixIcon={<Phone size={15} />} maxLength={15} placeholder="e.g. 09123456789" value={contact_num} onChange={handleContactNumChange} />
              <div className="col-span-full">
                <Input label="Address" prefixIcon={<MapPin size={15} />} placeholder="City, Province" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6 w-full">
            <Card className="flex flex-col gap-3 p-5 sm:p-6 w-full">
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--primary-dark)" }}>Profile Details</h2>

              <Input label="Pronouns" placeholder="e.g. she/her, they/them" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
              <Select label="Sex at Birth" value={sex_at_birth} onChange={(e) => setSexAtBirth(e.target.value)} options={SEX_OPTIONS} />
              <Select label="Gender Identity" value={gender_identity} onChange={(e) => setGenderIdentity(e.target.value)} options={GENDER_OPTIONS} />
              <Input label="GSO Sessions Attended" maxLength={1} placeholder="0" value={gso_attended.toString()} onChange={(e) => setGsoAttended(e.target.value)} />

              <div className="flex items-center justify-between p-4 mt-2 rounded-[var(--radius-md)] border w-full" style={{ background: "var(--cream)", borderColor: "rgba(45,42,74,0.10)" }}>
                <div>
                  <p className="font-semibold text-[13px]" style={{ color: "var(--primary-dark)" }}>Onboarding complete</p>
                  <p className="text-[11px] text-gray-500">User has completed the onboarding process</p>
                </div>
                <Toggle defaultOn={is_onboarded} onChange={setIsOnboarded} />
              </div>
            </Card>

            {error && <Toast variant="error" title="Failed to save user" message={error} />}

            <div className="flex justify-end gap-4 w-full">
              <Button type="button" variant="ghost" style={{ minWidth: 120 }} disabled={isLoading} onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ minWidth: 140 }} disabled={isLoading}>
                {isLoading ? <><Loader2 size={14} className="animate-spin mr-2" /> {isEdit ? "Updating…" : "Creating…"}</> : isEdit ? "Update User" : "Create User"}
              </Button>
            </div>
          </div>

        </div>
      </form>
    );
  }

  // modal layout
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
        <SectionLabel>Account Information</SectionLabel>
        <Input label="Full Name" required prefixIcon={<User size={15} />} placeholder="e.g. Maria Santos" value={full_name} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Email" type="email" required prefixIcon={<Mail size={15} />} placeholder="m@up.edu.ph" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label={isEdit ? "Password (leave blank to keep)" : "Password"} type="password" required={!isEdit} prefixIcon={<Lock size={15} />} placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Select label="Role" required value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
        <SectionLabel>Profile Details</SectionLabel>
        <Input label="Display Name" placeholder="Nickname or preferred name" value={display_name} onChange={(e) => setDisplayName(e.target.value)} />
        <Input label="Student Number" prefixIcon={<Hash size={15} />} placeholder="e.g. 2021-12345" value={student_num} onChange={handleStudentNumChange} />
        <Select label="Year Level" value={year_level} onChange={(e) => setYearLevel(e.target.value)} options={YEAR_OPTIONS} />
        <Select label="College" value={college} onChange={(e) => setCollege(e.target.value)} options={COLLEGE_OPTIONS} />
        <Input label="Program" placeholder="e.g. BS Computer Science" value={program} onChange={(e) => setProgram(e.target.value)} />
        <Input label="Contact Number" prefixIcon={<Phone size={15} />} placeholder="e.g. 09123456789" value={contact_num} onChange={handleContactNumChange} />
        <Input label="Address" prefixIcon={<MapPin size={15} />} placeholder="City, Province" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input label="Pronouns" placeholder="e.g. she/her, they/them" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
        <Select label="Sex at Birth" value={sex_at_birth} onChange={(e) => setSexAtBirth(e.target.value)} options={SEX_OPTIONS} />
        <Select label="Gender Identity" value={gender_identity} onChange={(e) => setGenderIdentity(e.target.value)} options={GENDER_OPTIONS} />
        <Input label="GSO Sessions Attended" type="number" min="0" max="5" step="1" placeholder="0" value={gso_attended.toString()} onChange={(e) => setGsoAttended(e.target.value)} />

        <div className="col-span-full flex items-center justify-between p-3 mt-2 rounded-md border" style={{ background: "var(--cream)", borderColor: "rgba(45,42,74,0.10)" }}>
          <div>
            <p className="font-semibold text-[13px]" style={{ color: "var(--primary-dark)" }}>Onboarding complete</p>
            <p className="text-[11px] text-gray-500">User has completed the onboarding process</p>
          </div>
          <Toggle defaultOn={is_onboarded} onChange={setIsOnboarded} />
        </div>
      </div>

      {error && <Toast variant="error" title="Failed to save user" message={error} />}

      <div className="flex gap-3 pt-4 border-t mt-2" style={{ borderColor: "rgba(45,42,74,0.10)" }}>
        <Button type="button" variant="ghost" style={{ flex: 1 }} disabled={isLoading} onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? <><Loader2 size={14} className="animate-spin mr-2" /> {isEdit ? "Updating…" : "Creating…"}</> : isEdit ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}