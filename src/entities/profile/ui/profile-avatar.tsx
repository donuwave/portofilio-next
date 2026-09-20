import type { ProfileAvatar } from "../model/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileAvatarView({ avatar, name, size = 96 }: { avatar: ProfileAvatar; name: string; size?: number }) {
  const style = { width: size, height: size };

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar.path}
        alt={name}
        style={style}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-zinc-900 text-lg font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
    >
      {getInitials(name)}
    </div>
  );
}
