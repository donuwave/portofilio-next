/**
 * Markdown -> plain text, for places that show only an excerpt (cards, the home slider, page
 * descriptions for search results) where "**bold**" or "## Heading" would look like noise.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // heading markers
    .replace(/^\s{0,3}>\s?/gm, "") // blockquote markers
    .replace(/^\s*([-*+]|\d+[.)])\s+/gm, "") // list markers
    .replace(/^\s*[-*_]{3,}\s*$/gm, " ") // horizontal rules
    .replace(/\|/g, " ") // table pipes
    .replace(/(\*\*|__|\*|_|~~|`)/g, "") // emphasis and inline code markers
    .replace(/\s+/g, " ")
    .trim();
}
