/**
 * edit is now handled inline via the edit modal in users-client.tsx.
 * this route redirects back to the users list so any direct visits still land somewhere
 */
import { redirect } from "next/navigation";

export default function EditUserPage() {
  redirect("/admin/users");
}