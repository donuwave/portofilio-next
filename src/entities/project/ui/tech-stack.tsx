import { findTechIcon } from "@/shared/lib/tech-icons";
import { TechIcon } from "@/shared/ui/tech-icon";

/**
 * The technologies of a project with their brand icons. Server component on purpose: the icon
 * lookup pulls in all of Simple Icons, which must not be sent to the browser. Names without a
 * known icon are shown as plain text.
 */
export function TechStack({ items, variant }: { items: string[]; variant: "chips" | "inline" }) {
  if (items.length === 0) return null;

  if (variant === "chips") {
    return (
      <ul className="flex flex-wrap gap-2">
        {items.map((name) => {
          const icon = findTechIcon(name);
          return (
            <li
              key={name}
              className="inline-flex items-center gap-2 rounded-full border border-[#3a372f] px-3 py-1.5 text-sm text-[#cfc8b8]"
            >
              {icon && <TechIcon path={icon.path} className="h-4 w-4 text-[#ece5d6]" />}
              {name}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#8a8378]">
      {items.map((name) => {
        const icon = findTechIcon(name);
        return (
          <li key={name} className="inline-flex items-center gap-1.5">
            {icon && <TechIcon path={icon.path} className="h-3.5 w-3.5" />}
            {name}
          </li>
        );
      })}
    </ul>
  );
}
