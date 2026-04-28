/*
TypeScript types for the admin and staff profile page.

Currently used by:
app/admin/profile/page.tsx (Profile state, ToastState) and app/staff/profile/page.tsx
*/

/*
Shape of a user profile row from the Supabase `profile` table.

Used in: app/admin/profile/page.tsx (profile state type) and app/staff/profile/page.tsx
*/
export type Profile = {
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
  asho_attended: number | null;
  avatar_url?: string | null;
};

/*
Toast notification state — success/error message or null when hidden.

Used in: app/admin/profile/page.tsx (toast state) and app/staff/profile/page.tsx
Also re-exported from: components/toast.tsx
*/
export type ToastState = { type: "success" | "error"; message: string } | null;
