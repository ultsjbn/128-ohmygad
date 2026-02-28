"use client";

import { Typography, Paper, Button, InputText } from "@snowball-tech/fractal";
import { Search, Users } from "lucide-react";

const mockCourses = [
  { id: 1, code: "GAD 101", title: "Gender and Society", college: "CSS", enrolled: 45, slots: 50, color: "bg-fractal-decorative-pink-90" },
  { id: 2, code: "GAD 102", title: "Women's Studies", college: "CSS", enrolled: 38, slots: 40, color: "bg-fractal-decorative-purple-90" },
  { id: 3, code: "GAD 201", title: "Gender and Development", college: "CAC", enrolled: 30, slots: 35, color: "bg-fractal-decorative-blue-90" },
  { id: 4, code: "CS 195", title: "Technology and Gender", college: "CS", enrolled: 22, slots: 30, color: "bg-fractal-decorative-green-90" },
  { id: 5, code: "GAD 301", title: "Policy and Gender Advocacy", college: "CSS", enrolled: 18, slots: 25, color: "bg-fractal-decorative-yellow-90" },
];

export default function CoursesPage() {
  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      {/* Course Cards */}
      <Paper elevation="bordered" title="All Courses" titleVariant="heading-2" className="flex flex-col gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm shadow-brutal-1 pb-4">
          <Search size={16} className="text-fractal-text-placeholder" />
          <InputText
            value="Search courses..."
            className="flex-1 bg-transparent outline-none text-sm font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockCourses.map((course) => {
            const fillPct = Math.round((course.enrolled / course.slots) * 100);
            return (
              <div
                key={course.id}
                className="flex flex-col gap-3 p-4 border-2 border-fractal-border-default rounded-s bg-white shadow-brutal-1 hover:shadow-none transition-all"
              >
                {/* Top accent bar */}
                <div className={`h-2 w-full rounded-fractal-xs border-2 border-fractal-border-default ${course.color}`} />

                <div className="flex items-start justify-between">
                  <div>
                    <Typography variant="body-2-median" className="text-fractal-text-placeholder">{course.code}</Typography>
                    <Typography variant="body-1-median">{course.title}</Typography>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-median border-2 border-fractal-border-default rounded-fractal-xs bg-fractal-base-grey-90">
                    {course.college}
                  </span>
                </div>

                {/* Enrollment bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-fractal-text-placeholder">
                      <Users size={13} />
                      <Typography variant="body-2">{course.enrolled} / {course.slots} enrolled</Typography>
                    </div>
                    <Typography variant="body-2-median">{fillPct}%</Typography>
                  </div>
                  <div className="w-full h-2 bg-fractal-base-grey-90 rounded-fractal-full border-2 border-fractal-border-default overflow-hidden">
                    <div
                      className={`h-full ${course.color} transition-all`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button label="Edit" variant="secondary" />
                  <Button label="View" variant="display" />
                </div>
              </div>
            );
          })}
        </div>
      </Paper>

    </div>
  );
}