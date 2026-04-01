// src/components/ui/markdown-content.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content.trim()) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        // Dark mode overrides — zinc palette
        "prose-invert",
        "prose-p:text-zinc-300 prose-p:leading-relaxed",
        "prose-headings:text-zinc-200 prose-headings:font-semibold",
        "prose-strong:text-zinc-200",
        "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-zinc-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800",
        "prose-blockquote:border-l-zinc-600 prose-blockquote:text-zinc-400 prose-blockquote:italic prose-blockquote:not-italic",
        "prose-li:text-zinc-300 prose-li:marker:text-zinc-600",
        "prose-hr:border-zinc-800",
        // Table dark mode
        "prose-table:text-zinc-300",
        "prose-thead:border-zinc-700",
        "prose-th:text-zinc-200 prose-th:border-zinc-700",
        "prose-td:border-zinc-800",
        className
      )}
    >
      <div className="overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
