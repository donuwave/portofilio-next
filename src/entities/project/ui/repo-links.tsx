import { SocialIcon } from "@/shared/ui/social-icon";
import type { RepoLink } from "../model/types";

/** "https://github.com/user/repo/" -> "github.com/user/repo" */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

/** Links to a project's source code, as a block of its own. */
export function RepoLinks({ repos }: { repos: RepoLink[] }) {
  return (
    <ul className="mt-10 grid gap-3 sm:grid-cols-2">
      {repos.map((repo) => (
        <li key={repo.url}>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-lg border border-[#2a2824] bg-[#1a1816] p-4 transition-colors hover:border-[#e2451f]"
          >
            <SocialIcon name="github" className="h-6 w-6 shrink-0 text-[#ece5d6]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-[#ece5d6]">{repo.label}</span>
              <span className="block truncate text-sm text-[#8a8378]">{displayUrl(repo.url)}</span>
            </span>
            <span aria-hidden="true" className="text-[#8a8378] transition-colors group-hover:text-[#e2451f]">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
