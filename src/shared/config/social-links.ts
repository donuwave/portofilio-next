import type { SocialIconName } from "@/shared/ui/social-icon";

export type SocialLink = { label: string; href: string; icon: SocialIconName };

// Placeholder hrefs — swap in real profile URLs once available.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "#", icon: "github" },
  { label: "Telegram", href: "#", icon: "telegram" },
  { label: "Instagram", href: "#", icon: "instagram" },
];
