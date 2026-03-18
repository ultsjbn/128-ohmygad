"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Mail, Lock, ShieldCheck, KeyRound, AlertCircle
} from "lucide-react";

import { Card, Input, Button, Toast } from "@/components/ui";

type ToastState = { type: "success" | "error" | "info"; message: string } | null;

export default function SharedSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // states
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState("");
  
  // email form states
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // password form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchUser() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setCurrentEmail(user.email ?? "");
    setLoading(false);
  }

  // handle email update
  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || newEmail === currentEmail) return;

    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;
      
      setToast({ 
        type: "info", 
        message: "Verification links sent! Please check both your old and new email inboxes to confirm the change." 
      });
      setNewEmail(""); // clear input
    } catch (error: any) {
      setToast({ type: "error", message: error.message || "Failed to update email." });
    } finally {
      setSavingEmail(false);
    }
  }

  // handle password update
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters long." });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setToast({ type: "success", message: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setToast({ type: "error", message: error.message || "Failed to update password." });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-0">
        <div className="w-8 h-8 border-4 border-[var(--periwinkle-light)] border-t-[var(--periwinkle)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 lg:gap-6 animate-in fade-in duration-500 pb-24 lg:pb-6">

      {/* top bar */}
      <div className="shrink-0 flex items-center justify-between md:mt-2">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button variant="icon" onClick={() => router.back()}>
            <ChevronLeft size={16} />
          </Button>
          <div>
            <h1 className="heading-lg lg:heading-xl leading-none">Account Settings</h1>
            <p className="hidden md:block body text-[var(--gray)] mt-1">Manage your login credentials.</p>
          </div>
        </div>
      </div>

      {/* content cards wrapper - completely unrestricted flow */}
      <div className="flex flex-col gap-6">

        {/* email section */}
        <Card className="flex flex-col md:flex-row gap-4 p-3 lg:p-6">
          
          {/* description side */}
          <div className="w-full md:w-1/3 shrink-0">
            <h2 className="heading-md mb-2">Change Email Address</h2>
            <p className="text-sm text-[var(--gray)] leading-relaxed">
              Update the email address associated with your account. We will send a verification link to your new address to confirm ownership.
            </p>
          </div>

          {/* form side */}
          <form onSubmit={handleUpdateEmail} className="w-full md:w-2/3 flex flex-col gap-3">
            <Input
              label="Current Email"
              value={currentEmail}
              disabled
              prefixIcon={<Lock size={15} />}
            />
            <Input
              label="New Email"
              type="email"
              placeholder="e.g. new.email@up.edu.ph"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              prefixIcon={<Mail size={15} />}
            />
            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={savingEmail || !newEmail || newEmail === currentEmail}
                className="w-full md:w-auto px-8"
              >
                {savingEmail ? "Sending Verification..." : "Update Email"}
              </Button>
            </div>
          </form>
        </Card>

        {/* password section */}
        <Card className="flex flex-col md:flex-row gap-4 p-3 lg:p-6">
          
          {/* description side */}
          <div className="w-full md:w-1/3 shrink-0">
            <h2 className="heading-md mb-2">Change Password</h2>
            <p className="text-sm text-[var(--gray)] leading-relaxed">
              Ensure your account is using a long, random password to stay secure. It must be at least 6 characters long.
            </p>
          </div>

          {/* form side */}
          <form onSubmit={handleUpdatePassword} className="w-full md:w-2/3 flex flex-col gap-3">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              prefixIcon={<KeyRound size={15} />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              prefixIcon={<KeyRound size={15} />}
            />
            
            {/* inline warning */}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <div className="flex items-center gap-2 text-[var(--error)] text-sm mt-1">
                <AlertCircle size={14} />
                <span>Passwords do not match.</span>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={savingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full md:w-auto px-8"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>

      </div>

      {/* fixed toast notification */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-6 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-6 z-[9999] animate-in slide-in-from-bottom-5">
          <Toast variant={toast.type === "info" ? "warning" : toast.type} title={toast.message} />
        </div>
      )}
    </div>
  );
}