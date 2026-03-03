export const AVATAR_COLORS = [
  "bg-fractal-decorative-green-70",
  "bg-fractal-decorative-blue-50",
  "bg-fractal-decorative-purple-70",
  "bg-fractal-decorative-yellow-70",
  "bg-fractal-decorative-pink-70",
];

export const ROLE_STYLES: Record<string, string> = {
  admin:
    "bg-fractal-decorative-pink-70 text-fractal-text-secondary border border-fractal-brand-primary ",
  faculty:
    "bg-fractal-decorative-blue-70 text-fractal-text-secondary border border-fractal-decorative-blue-50",
  student:
    "bg-fractal-decorative-purple-70 text-fractal-text-secondary border border-fractal-decorative-purple-50",
};

export const ROLE_STYLE_FALLBACK =
  "bg-fractal-bg-body-light text-fractal-text-dark border border-fractal-border-dark";

export const PER_PAGE = 5; // 5 muna para di masikip

export const TABLE_COLUMNS = [
  { key: "full_name" as const, label: "Name" },
  { key: "role" as const, label: "Role" },
  { key: "email" as const, label: "Email" },
  { key: "gso_attended" as const, label: "GSOs Attended" },
];
