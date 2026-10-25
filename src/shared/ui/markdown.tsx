import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

/**
 * Renders markdown in the site's look (the styles live under `.markdown` in globals.css).
 * Raw HTML in the source is NOT rendered (react-markdown's default), so content cannot inject
 * markup or scripts; "javascript:" links are dropped by its URL sanitising.
 *
 * remark-breaks keeps single line breaks, which is how the text was written before markdown.
 */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children: label }) => {
            const external = typeof href === "string" && /^https?:\/\//i.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {label}
              </a>
            );
          },
          // A wide table scrolls by itself instead of stretching the page.
          table: ({ children: rows }) => (
            <div className="markdown-table">
              <table>{rows}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
