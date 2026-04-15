"use client";

import SurveyForm from "@/components/admin/survey-form";

export default function CreateSurveyPage() {

  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      <SurveyForm mode="create" />
    </div>
  );
}