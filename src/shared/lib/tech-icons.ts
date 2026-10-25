import * as simpleIcons from "simple-icons";

// Server-side only: this pulls in all of Simple Icons (about 3,500 brand logos), which must never
// reach a client bundle. Client code asks /api/tech-icons instead.

export type TechIcon = { title: string; slug: string; hex: string; path: string };

type RawIcon = { title: string; slug: string; hex: string; path: string };

/** The slug Simple Icons itself derives from a title: "Next.js" -> "nextdotjs", "C++" -> "cplusplus". */
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/&/g, "and")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]/g, "");
}

// Names people actually type that Simple Icons spells differently or does not have under that name.
const ALIASES: Record<string, string> = {
  nextjs: "nextdotjs",
  next: "nextdotjs",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  nestjs: "nestjs",
  nestdotjs: "nestjs",
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  nuxt: "nuxt",
  nuxtjs: "nuxt",
  express: "express",
  expressjs: "express",
  react: "react",
  reactjs: "react",
  reactnative: "react",
  js: "javascript",
  ts: "typescript",
  postgres: "postgresql",
  mongo: "mongodb",
  k8s: "kubernetes",
  tanstackquery: "reactquery",
  reactquery: "reactquery",
  telegraf: "telegram",
  telegrambot: "telegram",
  tailwind: "tailwindcss",
  html: "html5",
  css: "css",
  scss: "sass",
  sass: "sass",
  githubactions: "githubactions",
  ci: "githubactions",
  rest: "openapiinitiative",
  restapi: "openapiinitiative",
  websocket: "socketdotio",
  websockets: "socketdotio",
  socketio: "socketdotio",
};

let index: Map<string, RawIcon> | null = null;

function getIndex() {
  if (index) return index;
  index = new Map();
  for (const value of Object.values(simpleIcons)) {
    const icon = value as Partial<RawIcon> | undefined;
    if (icon && typeof icon.slug === "string" && typeof icon.path === "string") {
      index.set(icon.slug, icon as RawIcon);
    }
  }
  return index;
}

/** The brand icon for a technology name, or null when there is no sensible match. */
export function findTechIcon(name: string): TechIcon | null {
  const key = toSlug(name.trim());
  if (!key) return null;
  const icons = getIndex();
  const icon = icons.get(key) ?? icons.get(ALIASES[key] ?? "");
  return icon ? { title: icon.title, slug: icon.slug, hex: icon.hex, path: icon.path } : null;
}
