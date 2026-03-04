import { Typography } from "@snowball-tech/fractal";
import CourseForm from "@/components/admin/course-form";

export default function CreateCoursePage() {
  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      <CourseForm mode="create" />
    </div>
  );
}