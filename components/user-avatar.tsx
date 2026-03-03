import { AVATAR_COLORS } from "./profile.constants";

const getInitials = (name: string | null) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

const getAvatarColor = (name: string | null) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export function UserAvatar({ name }: { name: string | null }) {
  return (
    <span
      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-median text-fractal-text-dark ${getAvatarColor(name)}`}
    >
      {getInitials(name)}
    </span>
  );
}
