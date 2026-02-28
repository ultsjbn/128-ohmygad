"use server";

// use generic supabase-js client here so we can supply the service role key manually
import { createClient as createAdminClient } from "@supabase/supabase-js";

interface GenderCount {
  name: string;
  value: number;
}

export async function getGenderDistribution(): Promise<GenderCount[]> {
  try {
    // build admin client with service role to bypass RLS
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set, results may be empty.");
    } else if (key.startsWith("sb_publishable_")) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY appears to be a publishable key – please set the real service key.");
    }
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // Fetch all gender_identity values and count them
    const { data, error } = await supabase
      .from("profile")
      .select("gender_identity");

    if (error) {
      console.error("Error fetching gender data:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("No gender rows returned, verify table contents and RLS policies");
      return [];
    }

    console.debug("raw gender rows", data);
    // Count occurrences of each gender identity
    const genderCounts: { [key: string]: number } = {};

    data.forEach((profile: { gender_identity: string | null }) => {
      let gender = profile.gender_identity || "Not specified";
      gender = gender.toUpperCase();
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    // Convert to chart format
    const chartData = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
    }));

    console.debug("computed genderCounts", chartData);
    return chartData;
  } catch (error) {
    console.error("Error in getGenderDistribution:", error);
    return [];
  }
}
