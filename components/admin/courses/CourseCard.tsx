"use client";

import { Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import { InputText } from "@snowball-tech/fractal";

import type { CourseFormData } from "@/components/admin/course-form";

interface Props {
  course: CourseFormData;
  isEditing: boolean;
  editFields: Partial<CourseFormData>;
  setEditFields: (v: Partial<CourseFormData>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function CourseCard({
  course,
  isEditing,
  editFields,
  setEditFields,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-2 border rounded bg-white">

      <div className="h-1.5 w-full bg-blue-500" />

      <div className="px-4 pt-2 flex justify-between">

        {isEditing ? (
          <InputText
            value={editFields.title ?? course.title ?? ""}
            onChange={(e: any) =>
              setEditFields({ ...editFields, title: e.target.value })
            }
          />
        ) : (
          <Typography variant="body-1-median">
            {course.title}
          </Typography>
        )}

        <span className="text-xs border px-2 rounded">
          {course.status ?? "—"}
        </span>
      </div>

      <div className="px-4 flex flex-col gap-1">

        <Typography variant="body-2">
          {course.description ?? "—"}
        </Typography>

        <Typography variant="body-2">
          <strong>Start:</strong> {course.start_time ?? "—"}
        </Typography>

        <Typography variant="body-2">
          <strong>End:</strong> {course.end_time ?? "—"}
        </Typography>

        <Typography variant="body-2">
          <strong>Semester:</strong> {course.semester ?? "—"}
        </Typography>

      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-3 pt-2 mt-auto border-t">

        {isEditing ? (
          <>
            <Button
              label="Save"
              icon={<Save size={14} />}
              onClick={onSave}
            />

            <Button
              label="Cancel"
              icon={<X size={14} />}
              onClick={onCancel}
            />
          </>
        ) : (
          <>
            <Button
              label="Edit"
              icon={<Edit2 size={14} />}
              onClick={onEdit}
            />

            <Button
              label="Delete"
              icon={<Trash2 size={14} />}
              onClick={onDelete}
            />
          </>
        )}

      </div>
    </div>
  );
}