"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // using shared client
import { useRouter } from "next/navigation";
import {
  User, Phone, MapPin,
  Save, ChevronLeft, Heart, Building2
} from "lucide-react";

import { Card, Input, Select, Button, Badge, Tabs, ProgressBar, Toast } from "@/components/ui";

type Profile = {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  contact_num: string;
  address: string;
  pronouns: string;
  role: string;
  office: string;
  sex_at_birth: string;
  gender_identity: string;
  gso_attended: number | null;
};

type ToastState = { type: "success" | "error"; message: string } | null;

const TAB_OPTIONS = ["Personal", "Professional", "Identity"];

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

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    id: "", full_name: "", display_name: "", email: "", 
    contact_num: "", address: "", pronouns: "", role: "admin", 
    office: "",
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
    try {
      const { error } = await supabase
        .from("profile")
        .upsert({ ...profile }, { onConflict: "id" });
        
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
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-4 lg:gap-6 flex-1 min-h-0 animate-in fade-in duration-500">

      {/* scrollable on mobile, two columns on desktop */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden custom-scrollbar pr-1 lg:pr-0 pb-[100px] lg:pb-0">

        {/* left column: profile card */}
<<<<<<< Updated upstream
        <div className="w-full lg:w-[35%] flex flex-col shrink-0">
          <Card className="flex flex-col items-center text-center p-4 lg:p-6">
            
=======
        <div className="rounded-[var(--radius-lg)] w-full lg:w-[35%] flex flex-col shrink-0">
          <Card variant="no-hover" className="flex flex-col items-center text-center p-4 lg:p-6">

>>>>>>> Stashed changes
            {/* user details */}
            <h2 className="heading-lg mb-1">{profile.full_name || "Your Name"}</h2>
            <p className="text-sm text-[var(--gray)] mb-2">
              {profile.display_name ? `@${profile.display_name}` : "No display name set"}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="dark" dot>Administrator</Badge>
              {profile.office && <Badge variant="pink">{profile.office}</Badge>}
            </div>

            {/* gso progress bar */}
<<<<<<< Updated upstream
            <div className="w-full text-left pt-6 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar 
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0} 
=======
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
>>>>>>> Stashed changes
                variant="dark"
                label="GSO Attendance"
                sublabel={`${profile.gso_attended ?? 0} / 2 completed`}
              />
            </div>
            {/* asho progress bar */}
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
                variant="dark"
                label="ASHO Attendance"
                sublabel={`${profile.gso_attended ?? 0} / 2 completed`}
              />
            </div>
            {/* forums progress bar */}
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
                variant="dark"
                label="Forums Attended"
                sublabel={`${profile.gso_attended ?? 0} attended`}
              />
            </div>
            {/* research progress bar */}
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
                variant="dark"
                label="Research Attended"
                sublabel={`${profile.gso_attended ?? 0} attended`}
              />
            </div>
            {/* training progress bar */}
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
                variant="dark"
                label="Trainings Attended"
                sublabel={`${profile.gso_attended ?? 0} attended`}
              />
            </div>
            {/* research progress bar */}
            <div className="w-full text-left pt-3 border-t border-[rgba(45,42,74,0.08)]">
              <ProgressBar
                value={profile.gso_attended === 2 ? 100 : profile.gso_attended === 1 ? 50 : 0}
                variant="dark"
                label="Workshops Attended"
                sublabel={`${profile.gso_attended ?? 0} attended`}
              />
            </div>

          </Card>
        </div>

        {/* right column: wrapper for form card and save button */}
        <div className="w-full lg:w-[65%] flex flex-col gap-4 lg:flex-1 lg:min-h-0">
<<<<<<< Updated upstream
          
          <Card className="flex flex-col lg:flex-1 lg:min-h-0 p-4 lg:p-6">
            
=======

          <Card variant="no-hover" className="flex flex-col lg:flex-1 lg:min-h-0 p-4 lg:p-6">

>>>>>>> Stashed changes
            <div className="shrink-0 mb-4 lg:mb-6">
              <Tabs 
                tabs={TAB_OPTIONS} 
                defaultTab={tab} 
                onChange={setTab} 
              />
            </div>

            {/* form area */}
            <div className="lg:flex-1 lg:min-h-0 custom-scrollbar lg:pr-2 lg:pb-4">
              
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

              {tab === "Professional" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  <div className="md:col-span-2">
                    <Input
                      label="Office / Unit"
                      prefixIcon={<Building2 size={15} />}
                      placeholder="e.g. Office of the Chancellor"
                      value={profile.office}
                      onChange={set("office")}
                    />
                  </div>
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