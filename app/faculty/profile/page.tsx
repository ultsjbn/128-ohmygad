"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Camera,
  Save, CheckCircle2, AlertCircle, ChevronLeft,
  Heart, Building2, BookOpen, Users,
} from "lucide-react";
import { Loader } from "@snowball-tech/fractal";

type Profile = {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  contact_num: string;
  address: string;
  pronouns: string;
  role: string;
  program: string;
  college: string;
  sex_at_birth: string;
  gender_identity: string;
  gso_attended: number | null;
  avatar_url?: string | null;
};

type ToastState = { type: "success" | "error"; message: string } | null;

const SEX_OPTIONS = ["Male", "Female", "Intersex", "Prefer not to say"];
const PRONOUNS = ["he/him", "she/her", "they/them", "he/they", "she/they", "any/all", "Prefer not to say"];

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-fractal-base-grey-30">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fractal-base-grey-50 pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

const inputCls = (hasIcon = true) =>
  [
    "w-full rounded-s border-1 border-fractal-border-default bg-fractal-bg-body-white",
    hasIcon ? "pl-9" : "pl-3",
    "pr-3 py-2 text-sm text-fractal-text-default placeholder:text-fractal-text-placeholder",
    "focus:outline-none focus:border-fractal-brand-primary focus:ring-2 focus:ring-fractal-brand-highlight",
    "disabled:bg-fractal-bg-disabled disabled:text-fractal-text-disabled disabled:border-fractal-border-disabled disabled:cursor-not-allowed",
    "transition appearance-none",
  ].join(" ");

export default function FacultyProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    id: "", full_name: "", display_name: "",
    email: "", contact_num: "", address: "",
    pronouns: "", role: "faculty", program: "", college: "",
    sex_at_birth: "", gender_identity: "", gso_attended: null, avatar_url: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [tab, setTab] = useState<"personal" | "professional" | "identity">("personal");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      const { avatar_url, ...rest } = profile;
      const { error } = await supabase
        .from("profile")
        .upsert(rest, { onConflict: "id" });
      if (error) throw error;
      setToast({ type: "success", message: "Profile saved successfully." });
    } catch {
      setToast({ type: "error", message: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setProfile((p) => ({ ...p, avatar_url: url }));
      setToast({ type: "success", message: "Photo updated." });
    } catch {
      setToast({ type: "error", message: "Failed to upload photo." });
    } finally {
      setUploadingAvatar(false);
    }
  }

  const set = (field: keyof Profile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "FC";

  const tabs = [
    { key: "personal" as const, label: "Personal" },
    { key: "professional" as const, label: "Professional" },
    { key: "identity" as const, label: "Identity" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fractal-bg-body-default">
        <div className="flex flex-col items-center gap-3">
          <Loader size="xl" />
          <p className="text-sm text-fractal-text-default">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fractal-bg-body-default">

      {/* Top bar */}
      <div className="px-2 h-14 flex items-center justify-between top-0 z-30">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-fractal-base-grey-30 hover:text-fractal-text-default text-sm font-median transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <span className="text-fractal-text-default font-bold text-sm">My Profile</span>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-fractal-brand-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-fractal-base-black text-sm font-bold px-4 py-2 rounded-s border-1 border-fractal-border-default shadow-brutal-1 transition"
        >
          {saving ? <Loader size="xl" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">

        {/* Identity card */}
        <div className="bg-fractal-bg-body-white border-1 border-fractal-border-default rounded-m p-5 flex items-center gap-4 shadow-brutal-1">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-fractal-bg-body-primary flex items-center justify-center text-fractal-base-black text-2xl font-bold overflow-hidden border-1 border-fractal-border-default">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-fractal-base-black border-2 border-fractal-bg-body-white flex items-center justify-center text-fractal-base-white hover:opacity-80 transition"
              title="Change photo"
            >
              {uploadingAvatar
                ? <Loader size="xl" />
                : <Camera size={12} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <p className="font-bold text-fractal-text-default text-base truncate">
              {profile.full_name || "Your Name"}
            </p>
            {profile.display_name && (
              <p className="text-sm text-fractal-base-grey-30 truncate">@{profile.display_name}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs bg-fractal-brand-highlight text-fractal-base-black border-1 border-fractal-border-default rounded-full px-3 py-0.5 font-median shadow-brutal-1">
                Faculty
              </span>
              {profile.college && (
                <span className="text-xs bg-fractal-base-grey-90 text-fractal-base-grey-30 border-1 border-fractal-border-default rounded-full px-3 py-0.5">
                  {profile.college}
                </span>
              )}
              {profile.program && (
                <span className="text-xs bg-fractal-base-grey-90 text-fractal-base-grey-30 border-1 border-fractal-border-default rounded-full px-3 py-0.5">
                  {profile.program}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-fractal-bg-body-white border-1 border-fractal-border-default rounded-m p-1 shadow-brutal-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 text-sm font-median rounded-s transition ${
                tab === key
                  ? "bg-fractal-brand-primary text-fractal-base-black border-1 border-fractal-border-default shadow-brutal-1"
                  : "text-fractal-base-grey-30 hover:bg-fractal-base-grey-90 hover:text-fractal-text-default"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-fractal-bg-body-white border-1 border-fractal-border-default rounded-m p-6 shadow-brutal-1">

          {tab === "personal" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" icon={<User size={15} />}>
                  <input
                    className={inputCls()}
                    placeholder="e.g. Maria Santos"
                    value={profile.full_name}
                    onChange={set("full_name")}
                  />
                </Field>
              </div>

              <Field label="Display Name" icon={<User size={15} />}>
                <input
                  className={inputCls()}
                  placeholder="e.g. Prof. Santos"
                  value={profile.display_name}
                  onChange={set("display_name")}
                />
              </Field>

              <Field label="Pronouns" icon={<Heart size={15} />}>
                <select className={inputCls()} value={profile.pronouns} onChange={set("pronouns")}>
                  <option value="">Select pronouns</option>
                  {PRONOUNS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="Email Address" icon={<Mail size={15} />}>
                <input
                  className={inputCls()}
                  type="email"
                  value={profile.email}
                  disabled
                  title="Email is managed through your account settings"
                />
              </Field>

              <Field label="Contact Number" icon={<Phone size={15} />}>
                <input
                  className={inputCls()}
                  placeholder="e.g. 09XX XXX XXXX"
                  value={profile.contact_num}
                  onChange={set("contact_num")}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Address" icon={<MapPin size={15} />}>
                  <input
                    className={inputCls()}
                    placeholder="Street, Barangay, City, Province"
                    value={profile.address}
                    onChange={set("address")}
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === "professional" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department / Program" icon={<BookOpen size={15} />}>
                <input
                  className={inputCls()}
                  placeholder="e.g. Computer Science"
                  value={profile.program}
                  onChange={set("program")}
                />
              </Field>

              <Field label="College" icon={<Building2 size={15} />}>
                <input
                  className={inputCls()}
                  placeholder="e.g. College of Engineering"
                  value={profile.college}
                  onChange={set("college")}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="GSOs Attended" icon={<Users size={15} />}>
                  <div className={`${inputCls()} flex items-center gap-2 bg-fractal-bg-disabled border-fractal-border-disabled cursor-not-allowed`}>
                    <span className="text-fractal-text-disabled text-sm">
                      {profile.gso_attended ?? 0}
                    </span>
                    <span className="text-fractal-text-disabled text-xs">gender sensitivity orientations attended</span>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {tab === "identity" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sex at Birth" icon={<User size={15} />}>
                <select className={inputCls()} value={profile.sex_at_birth} onChange={set("sex_at_birth")}>
                  <option value="">Select option</option>
                  {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Gender Identity" icon={<Heart size={15} />}>
                <input
                  className={inputCls()}
                  placeholder="e.g. Non-binary, Transgender…"
                  value={profile.gender_identity}
                  onChange={set("gender_identity")}
                />
              </Field>

              <div className="sm:col-span-2 pt-1">
                <p className="text-xs text-fractal-base-grey-30 leading-relaxed">
                  This information is kept private and used only for institutional reporting. You are not required to fill this out.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-median border-1 border-fractal-border-default shadow-brutal-1 z-50 ${
            toast.type === "success"
              ? "bg-fractal-feedback-success-90 text-fractal-base-black"
              : "bg-fractal-feedback-error-90 text-fractal-base-black"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 size={15} className="text-fractal-icon-success" />
            : <AlertCircle size={15} className="text-fractal-icon-error" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}