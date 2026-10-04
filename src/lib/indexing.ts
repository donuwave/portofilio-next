/**
 * Whether search engines may index the site. Off until ALLOW_INDEXING="true" is set in the
 * server's environment, so an unfinished site stays out of Google/Yandex. Read at request
 * time, so flipping it needs only a restart, not a rebuild.
 */
export function indexingAllowed() {
  return process.env.ALLOW_INDEXING === "true";
}

/** Sent as the X-Robots-Tag header while indexing is off (covers pages, the API and images alike). */
export const NOINDEX_HEADER = "noindex, nofollow, noarchive, noimageindex";
