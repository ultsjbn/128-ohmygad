"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { InputText, Button, Select, SelectItem, InputCheckbox } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import { Plus, Trash2, GripVertical, X } from "lucide-react";

export type SurveyFormData = {
  id?: string;
  title: string;
  description?: string | null;
  event_id?: string | null;
  open_at?: string | null;
  close_at?: string | null;
  status?: string;
};

export type QuestionType = "text" | "multiple_choice" | "checkbox" | "rating" | "yes_no";

export type SurveyQuestion = {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  is_required: boolean;
  order_index: number;
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "rating", label: "Likert Scale (1–5)" },
  { value: "yes_no", label: "Yes / No" },
];

const STATUSES = ["open", "closed"];

interface SurveyFormProps extends React.ComponentPropsWithoutRef<"div"> {
  mode: "create" | "edit";
  initialData?: SurveyFormData;
  initialQuestions?: SurveyQuestion[];
}

const formatDate = (val: string) => (val ? `${val}:00` : null);

const newQuestion = (order: number): SurveyQuestion => ({
  question_text: "",
  question_type: "text",
  options: [],
  is_required: false,
  order_index: order,
});

export default function SurveyForm({
  className,
  mode,
  initialData,
  initialQuestions = [],
  ...props
}: SurveyFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Survey fields
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "");
  const [event_id, setEventId] = useState(initialData?.event_id ?? "");
  const [open_at, setOpenAt] = useState(initialData?.open_at?.slice(0, 16) ?? "");
  const [close_at, setCloseAt] = useState(initialData?.close_at?.slice(0, 16) ?? "");

  // Event list dropdown
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("event")
        .select("id, title")
        .order("start_date", { ascending: false });
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  // Questions
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question helpers
  const addQuestion = () => {
    setQuestions((prev) => [...prev, newQuestion(prev.length)]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i }))
    );
  };

  const updateQuestion = (index: number, patch: Partial<SurveyQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const updated = { ...q, ...patch };
        if (patch.question_type && !["multiple_choice", "checkbox"].includes(patch.question_type)) {
          updated.options = [];
        }
        return updated;
      })
    );
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      })
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) };
      })
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim()) { setError("Title is required."); setIsLoading(false); return; }
    if (!status) { setError("Please select a status."); setIsLoading(false); return; }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} is missing its text.`);
        setIsLoading(false);
        return;
      }
      if (["multiple_choice", "checkbox"].includes(q.question_type) && q.options.length < 2) {
        setError(`Question ${i + 1} needs at least 2 choices.`);
        setIsLoading(false);
        return;
      }
    }

    const supabase = createClient();

    const surveyPayload = {
      title: title.trim(),
      description: description || null,
      status,
      event_id: event_id || null,
      open_at: formatDate(open_at),
      close_at: formatDate(close_at),
    };

    try {
      let surveyId = initialData?.id;

      if (isEdit) {
        const { error } = await supabase.from("survey").update(surveyPayload).eq("id", surveyId!);
        if (error) throw error;

        const { error: delError } = await supabase
          .from("survey_questions")
          .delete()
          .eq("survey_id", surveyId!);
        if (delError) throw delError;
      } else {
        const { data, error } = await supabase
          .from("survey")
          .insert(surveyPayload)
          .select("id")
          .single();
        if (error) throw error;
        surveyId = data.id;
      }

      if (questions.length > 0) {
        const questionsPayload = questions.map((q, i) => ({
          survey_id: surveyId,
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          options: ["multiple_choice", "checkbox"].includes(q.question_type)
            ? JSON.stringify(q.options.filter((o) => o.trim() !== ""))
            : null,
          is_required: q.is_required,
          order_index: i,
        }));

        const { error: qError } = await supabase.from("survey_questions").insert(questionsPayload);
        if (qError) throw qError;
      }

      router.push("/admin/surveys");
      router.refresh();
    } catch (err: unknown) {
      console.error("Survey submit error:", err);
      const message = err instanceof Error ? err.message : (err as any)?.message ?? JSON.stringify(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white",
        className
      )}
      {...props}
    >
      <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
        {isEdit ? "Edit Survey" : "Create Survey"}
      </Typography>
      <Typography variant="body-2" className="text-fractal-text-placeholder">
        {isEdit ? "Update the survey details and questions." : "Fill in the details and add questions."}
      </Typography>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">

          {/* ── Survey Details ── */}
          <Typography variant="body-1-median">Survey Details</Typography>

          <InputText
            id="title"
            label="Title *"
            required
            fullWidth
            placeholder="e.g. Post-Event Feedback Form"
            value={title}
            onChange={(_e, val) => setTitle(val)}
          />

          <InputText
            id="description"
            label="Description (optional)"
            fullWidth
            placeholder="Briefly describe the purpose of this survey..."
            value={description}
            onChange={(_e, val) => setDescription(val)}
          />

          {/* Linked Event */}
          <Select
            id="event_id"
            label="Linked Event (optional)"
            fullWidth
            value={event_id || "none"}
            // defaultValue={initialData?.event_id ?? "none"}
            onSelect={(val) => setEventId(val === "none" ? "" : val)}
            dropdown={{ className: "!text-black" }}
          >
            <SelectItem value="none" label="— Not linked to an event —" />
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id} label={e.title} />
            ))}
          </Select>


          {/* Status & Availability */}
          <Typography variant="body-1-median">Status & Availability</Typography>

          <Select
            id="status"
            label="Status *"
            fullWidth
            required
            value={status}
            onSelect={(val) => setStatus(val)}
            dropdown={{ className: "!text-black" }}
          >
            {STATUSES.map((s) => (
              <SelectItem
                key={s}
                value={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
          </Select>

          <InputText
            id="open_at"
            label="Opens At (optional)"
            type="datetime-local"
            fullWidth
            value={open_at}
            onChange={(_e, val) => setOpenAt(val)}
          />

          <InputText
            id="close_at"
            label="Closes At (optional)"
            type="datetime-local"
            fullWidth
            value={close_at}
            onChange={(_e, val) => setCloseAt(val)}
          />

          {/* Questions*/}
          <div className="flex items-center justify-between pt-2">
            <Typography variant="body-1-median">Questions</Typography>
            <Typography variant="body-2" className="text-fractal-text-placeholder">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </Typography>
          </div>

          {questions.length === 0 && (
            <div className="border-2 border-dashed border-fractal-border-default rounded-s p-6 text-center">
              <Typography variant="body-2" className="text-fractal-text-placeholder">
                No questions yet. Click "Add Question" to get started.
              </Typography>
            </div>
          )}

          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="border-2 border-fractal-border-default rounded-s bg-fractal-bg-body-default p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-fractal-text-placeholder shrink-0" />
                  <Typography variant="body-2" className="font-median text-fractal-text-placeholder">
                    Question {qIndex + 1}
                  </Typography>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="p-1 hover:bg-red-100 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors text-red-500"
                  title="Remove question"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <InputText
                label="Question *"
                fullWidth
                placeholder="e.g. How would you rate this event?"
                value={question.question_text}
                onChange={(_e, val) => updateQuestion(qIndex, { question_text: val })}
              />

              <Select
                label="Question Type"
                fullWidth
                defaultValue={question.question_type}
                onSelect={(val) => updateQuestion(qIndex, { question_type: val as QuestionType })}
                dropdown={{ className: "!text-black" }}
              >
                {QUESTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} label={t.label} />
                ))}
              </Select>

              {["multiple_choice", "checkbox"].includes(question.question_type) && (
                <div className="flex flex-col gap-2">
                  <Typography variant="body-2" className="font-median">Choices</Typography>

                  {question.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        <InputText
                          fullWidth
                          placeholder={`Choice ${oIndex + 1}`}
                          value={opt}
                          onChange={(_e, val) => updateOption(qIndex, oIndex, val)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="p-2 hover:bg-red-100 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors text-red-500 shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="flex items-center gap-1 text-sm text-fractal-text-placeholder hover:text-fractal-text-default border-2 border-dashed border-fractal-border-default rounded-s px-3 py-2 transition-colors hover:bg-fractal-base-grey-90 w-full"
                  >
                    <Plus size={14} />
                    Add choice
                  </button>
                </div>
              )}

              <InputCheckbox
                label="Required"
                variant="tertiary"
                checked={question.is_required}
                onCheckedChange={(checked) =>
                  updateQuestion(qIndex, { is_required: checked === true })
                }
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 border-2 border-dashed border-fractal-border-default rounded-s px-4 py-3 text-sm font-median hover:bg-fractal-base-grey-90 hover:border-fractal-brand-primary transition-colors"
          >
            <Plus size={16} />
            Add Question
          </button>

          {error && (
            <Typography variant="body-2" className="text-fractal-feedback-error-50">
              {error}
            </Typography>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              label="Cancel"
              variant="secondary"
              onClick={() => router.push("/admin/surveys")}
              disabled={isLoading}
            />
            <Button
              type="submit"
              label={
                isLoading
                  ? isEdit ? "Saving..." : "Creating..."
                  : isEdit ? "Save Changes" : "Create Survey"
              }
              variant="primary"
              disabled={isLoading}
            />
          </div>

        </div>
      </form>
    </div>
  );
}