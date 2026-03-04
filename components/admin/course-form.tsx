"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paper, Typography } from "@snowball-tech/fractal";

export type EventFormData = {
  id?: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  semester: string;
  status: string;
};

type CourseFormProps = {
  initialData?: EventFormData;
  mode: "create" | "edit";
};

const SEMESTERS = ["1st", "2nd", "Mid-Year"];
const STATUSES = ["Open", "Closed"];