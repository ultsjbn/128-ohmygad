"use client";

import { useRouter } from "next/navigation";
import { Typography } from "@/components/typography";
import { Button } from "@/components/button";
import { ChevronLeft } from "lucide-react";
import SurveyForm from "@/components/admin/survey-form";

export default function CreateSurveyPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      <SurveyForm mode="create" />
    </div>
  );
}