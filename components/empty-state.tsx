import { CircleAlert, UserX } from "lucide-react";

export function EmptyState({
  type,
  message,
}: {
  type: "empty" | "error";
  message: string;
}) {
  const isError = type === "error";
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2
        ${
          isError
            ? "border-fractal-feedback-danger-50 bg-fractal-feedback-danger-90 text-fractal-feedback-danger-50"
            : "border-fractal-border-primary bg-fractal-bg-body-light text-fractal-text-light"
        }`}
      >
        {isError ? (
          <CircleAlert size={20} className="text-fractal-icon-error" />
        ) : (
          <UserX size={40} className="text-fractal-icon-primary" />
        )}
      </div>
      <p className="text-sm text-fractal-base-grey-30 max-w-xs">{message}</p>
    </div>
  );
}
