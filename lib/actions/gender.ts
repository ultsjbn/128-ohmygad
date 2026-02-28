"use server";

import { createClient } from "@/lib/supabase/server";

interface GenderCount {
  name: string;
  value: number;
}

export async function getGenderDistribution(): Promise<GenderCount[]> {
  try {
    const supabase = await createClient();

    // Fetch all gender_identity values and count them
    const { data, error } = await supabase
      .from("profile")
      .select("gender_identity");

    if (error) {
      console.error("Error fetching gender data:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Count occurrences of each gender identity
    const genderCounts: { [key: string]: number } = {};

    data.forEach((profile: { gender_identity: string | null }) => {
      const gender = profile.gender_identity || "Not specified";
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    // Convert to chart format
    const chartData = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return chartData;
  } catch (error) {
    console.error("Error in getGenderDistribution:", error);
    return [];
  }
}
