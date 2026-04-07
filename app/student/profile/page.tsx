"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // using shared client
import { useRouter } from "next/navigation";
import {
  User, Phone, BookOpen, MapPin,
  Save, ChevronLeft, Heart,
} from "lucide-react";

import { Card, Input, Select, Button, Badge, Tabs, ProgressBar, Toast } from "@/components/ui";

type Profile = {
  id: string;
  full_name: string;
  display_name: string;
  year_level: string;
  email: string;
  contact_num: string;
  address: string;
  student_num: number | string;
  pronouns: string;
  role: string;
  program: string;
  college: string;
  sex_at_birth: string;
  gender_identity: string;
  gso_attended: number | null;
};

type ToastState = { type: "success" | "error"; message: string } | null;

const TAB_OPTIONS = ["Personal", "Academic", "Identity"];

const YEAR_LEVELS = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
  { value: "Graduate", label: "Graduate" },
];

const SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Intersex", label: "Intersex" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const PRONOUNS = [
  { value: "he/him", label: "he/him" },
  { value: "she/her", label: "she/her" },
  { value: "they/them", label: "they/them" },
  { value: "he/they", label: "he/they" },
  { value: "she/they", label: "she/they" },
  { value: "any/all", label: "any/all" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

// imported logic from onboarding
const UPB_PROGRAMS: Record<string, { value: string; label: string }[]> = {
  CS: [
    { value: "BS Biology", label: "BS Biology" },
    { value: "BS Computer Science", label: "BS Computer Science" },
    { value: "BS Mathematics", label: "BS Mathematics" },
    { value: "BS Physics", label: "BS Physics" },
  ],
  CAC: [
    { value: "BA Communication", label: "BA Communication" },
    { value: "BA Fine Arts", label: "BA Fine Arts" },
    { value: "BA Language and Literature", label: "BA Language and Literature" },
    { value: "Certificate in Fine Arts", label: "Certificate in Fine Arts" },
  ],
  CSS: [
    { value: "BA Social Sciences", label: "BA Social Sciences" },
    { value: "BS Management Economics", label: "BS Management Economics" },
  ],
};

export default function StudentProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    id: "", full_name: "", display_name: "", year_level: "",
    email: "", contact_num: "", address: "", student_num: "",
    pronouns: "", role: "student", program: "", college: "",
    sex_at_birth: "", gender_identity: "", gso_attended: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [tab, setTab] = useState("Personal");

  const supabase = createClient();

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({ ...data, email: user.email ?? data.email });
      } else {
        setProfile((p) => ({ ...p, id: user.id, email: user.email ?? "" }));
      }
    } catch {
      setToast({ type: "error", message: "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    if (!profile.full_name.trim()) {
      setToast({ type: "error", message: "Full name is required." });
      setSaving(false);
      return;
    }

    const fullnameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!fullnameRegex.test(profile.full_name)) {
      setToast({ type: "error", message: "Full name can only contain letters, spaces, and basic punctuation." });
      setSaving(false);
      return;
    }

    if (profile.display_name) {
      const displayNameRegex = /^[a-zA-Z\s.'-]+$/;
      if (!displayNameRegex.test(profile.display_name)) {
        setToast({ type: "error", message: "Display name can only contain letters, spaces, and basic punctuation." });
        setSaving(false);
        return;
      }
    }

    if (profile.contact_num) {
      const contactRegex = /^[0-9]{10,15}$/;
      if (!contactRegex.test(profile.contact_num)) {
        setToast({ type: "error", message: "Contact number must be 10-15 digits." });
        setSaving(false);
        return;
      }
    }

    if (profile.student_num) {
      const cleanStudentNum = String(profile.student_num).replace(/\D/g, "");
      if (cleanStudentNum.length !== 9) {
        setToast({ type: "error", message: "Student number must be exactly 9 digits." });
        setSaving(false);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("profile")
        .upsert(
          { ...profile, student_num: profile.student_num === "" ? null : Number(profile.student_num) },
          { onConflict: "id" }
        );
      if (error) throw error;
      setToast({ type: "success", message: "Profile saved successfully." });
    } catch {
      setToast({ type: "error", message: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  }

  const set = (field: keyof Profile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-0">
        <div className="w-8 h-8 border-4 border-[var(--periwinkle-light)] border-t-[var(--periwinkle)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    // main wrapper
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 lg:gap-6 animate-in fade-in duration-500 pb-[100px] lg:pb-6">

      {/* two columns */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

        {/* left column: profile card */}
        <div className="w-full lg:w-[35%] lg:min-w-[240px] shrink-0 flex flex-col">
          <Card className="flex flex-col items-center text-center p-4 lg:p-6">
            
            {/* user details */}
            <h2 className="heading-lg mb-1">{profile.full_name || "Your Name"}</h2>
            <p className="text-sm text-[var(--gray)] mb-4">
              {profile.display_name ? `@${profile.display_name}` : "No display name set"}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="periwinkle" dot>Student</Badge>
              {profile.student_num && <Badge variant="pink">#{profile.student_num}</Badge>}
              {profile.program && <Badge variant="dark">{profile.program}</Badge>}
            </div>

            {/* gso progress bar */}
            <div className="w-full text-left pt-6 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar 
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0} 
                variant="dark"
                label="GSO Attendance"
                sublabel={`${profile.gso_attended ?? 0} / 2 completed`}
              />
            </div>

          </Card>
        </div>

        {/* right column: wrapper for form card and save button */}
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">

          <Card className="flex flex-col p-4 lg:p-6">

            <div className="shrink-0 mb-4 lg:mb-6">
              <Tabs
                tabs={TAB_OPTIONS}
                defaultTab={tab}
                onChange={setTab}
              />
            </div>

            {/* form area */}
            <div>
              
              {/* added content-start to prevent vertical stretching */}
              {tab === "Personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  <Input
                    label="Full Name"
                    prefixIcon={<User size={15} />}
                    placeholder="e.g. Juan Dela Cruz"
                    value={profile.full_name}
                    onChange={set("full_name")}
                  />
                  <Input
                    label="Display Name"
                    prefixIcon={<User size={15} />}
                    placeholder="e.g. juandc"
                    value={profile.display_name}
                    onChange={set("display_name")}
                  />
                  <Select
                    label="Pronouns"
                    options={[{ value: "", label: "Select pronouns" }, ...PRONOUNS]}
                    value={profile.pronouns}
                    onChange={set("pronouns")}
                  />
                  <Input
                    label="Contact Number"
                    prefixIcon={<Phone size={15} />}
                    placeholder="e.g. 09XX XXX XXXX"
                    value={profile.contact_num}
                    onChange={set("contact_num")}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      prefixIcon={<MapPin size={15} />}
                      placeholder="Street, Barangay, City, Province"
                      value={profile.address}
                      onChange={set("address")}
                    />
                  </div>
                </div>
              )}

              {/* updated academic fields to use dynamic selects */}
              {tab === "Academic" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  <Input
                    label="Student Number"
                    prefixIcon={<BookOpen size={15} />}
                    placeholder="e.g. 202400123"
                    value={profile.student_num}
                    onChange={set("student_num")}
                  />
                  <Select
                    label="Year Level"
                    options={[{ value: "", label: "Select year level" }, ...YEAR_LEVELS]}
                    value={profile.year_level}
                    onChange={set("year_level")}
                  />
                  <Select
                    label="College"
                    options={[
                      { value: "", label: "Select college" },
                      { value: "CS", label: "College of Science (CS)" },
                      { value: "CAC", label: "College of Arts and Communication (CAC)" },
                      { value: "CSS", label: "College of Social Sciences (CSS)" },
                    ]}
                    value={profile.college}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, college: e.target.value, program: "" }));
                    }}
                  />
                  <Select
                    label="Program"
                    value={profile.program}
                    onChange={set("program")}
                    disabled={!profile.college}
                    options={
                      profile.college && UPB_PROGRAMS[profile.college]
                        ? [{ value: "", label: "Select program" }, ...UPB_PROGRAMS[profile.college]]
                        : [{ value: "", label: "Select a college first" }]
                    }
                  />
                </div>
              )}

              {tab === "Identity" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  <Select
                    label="Sex at Birth"
                    options={[{ value: "", label: "Select option" }, ...SEX_OPTIONS]}
                    value={profile.sex_at_birth}
                    onChange={set("sex_at_birth")}
                  />
                  <Input
                    label="Gender Identity"
                    prefixIcon={<Heart size={15} />}
                    placeholder="e.g. Non-binary, Transgender…"
                    value={profile.gender_identity}
                    onChange={set("gender_identity")}
                  />
                  <div className="md:col-span-2 mt-2 p-4 bg-[var(--periwinkle-light)] rounded-xl border border-[rgba(45,42,74,0.05)]">
                    <p className="text-sm text-[var(--primary-dark)] leading-relaxed">
                      <strong>Privacy Note:</strong> This information is kept strictly private and is used only for institutional reporting. You are not required to fill this out.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* save button positioned directly below the right card */}
          <div className="flex justify-end shrink-0 pt-2 lg:pt-0">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="px-8 w-full md:w-auto"
            >
              {saving ? "Saving…" : "Save changes"}
              {!saving && <Save size={16} className="ml-2" />}
            </Button>
          </div>

        </div>
      </div>

      {/* fixed toast notification */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-6 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-6 z-[9999] animate-in slide-in-from-bottom-5">
          <Toast variant={toast.type} title={toast.message} />
        </div>
      )}
    </div>
  );
}