"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserForm from "@/components/admin/user-form";

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string | undefined;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Missing user ID");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/get-user?id=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user");
        setUserData(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!userData) return <p>User not found</p>;

  return <UserForm initialData={userData} />;
}