import type { MetadataRoute } from "next";
import { indexingAllowed } from "@/lib/indexing";

// Answers per request: the rules depend on ALLOW_INDEXING, which is read at runtime.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] } };
}
