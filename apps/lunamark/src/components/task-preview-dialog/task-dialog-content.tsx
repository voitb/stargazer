"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "@ui/components";

interface TaskDialogContentProps {
  mode: "preview" | "edit";
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TaskDialogContent({
  mode,
  content,
  onChange,
}: TaskDialogContentProps) {
  if (mode === "edit") {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <Textarea
          value={content}
          onChange={onChange}
          placeholder="## Description&#10;&#10;Add task details using Markdown...&#10;&#10;- Use **bold** and *italic* for emphasis&#10;- Create lists with `-` or `1.`&#10;- Add code with `backticks`"
          className="min-h-75 font-mono text-sm resize-none border-[rgb(var(--color-neutral-stroke-1))/0.5] focus:border-[rgb(var(--color-brand-background))/0.5]"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-6 prose-container">
        {content.trim() ? (
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-[rgb(var(--color-neutral-foreground-1))] mb-4 pb-2 border-b border-[rgb(var(--color-neutral-stroke-1))/0.3]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-[rgb(var(--color-neutral-foreground-1))] mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-[rgb(var(--color-neutral-foreground-1))] mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-[rgb(var(--color-neutral-foreground-1))/0.9] leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-sm text-[rgb(var(--color-neutral-foreground-1))/0.9] mb-4 space-y-1.5">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-sm text-[rgb(var(--color-neutral-foreground-1))/0.9] mb-4 space-y-1.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-sm">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgb(var(--color-brand-foreground-1))] hover:underline"
                >
                  {children}
                </a>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 text-xs font-mono bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-1))] rounded border border-[rgb(var(--color-neutral-stroke-1))/0.3]">
                      {children}
                    </code>
                  );
                }
                return <code className="text-xs font-mono">{children}</code>;
              },
              pre: ({ children }) => (
                <pre className="p-4 my-4 text-xs font-mono bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-1))] rounded-lg border border-[rgb(var(--color-neutral-stroke-1))/0.3] overflow-x-auto">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="pl-4 my-4 text-sm italic text-[rgb(var(--color-neutral-foreground-2))] border-l-2 border-[rgb(var(--color-brand-background))/0.5]">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-6 border-t border-[rgb(var(--color-neutral-stroke-1))/0.3]" />
              ),
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-[rgb(var(--color-neutral-stroke-1))/0.3] rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[rgb(var(--color-neutral-background-3))]">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-neutral-foreground-1))] border-b border-[rgb(var(--color-neutral-stroke-1))/0.3]">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-[rgb(var(--color-neutral-foreground-1))/0.9] border-b border-[rgb(var(--color-neutral-stroke-1))/0.2]">
                  {children}
                </td>
              ),
              input: ({ type, checked, disabled }) => {
                if (type === "checkbox") {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      readOnly
                      className="mr-2 accent-[rgb(var(--color-brand-background))]"
                    />
                  );
                }
                return null;
              },
              strong: ({ children }) => (
                <strong className="font-semibold text-[rgb(var(--color-neutral-foreground-1))]">
                  {children}
                </strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              del: ({ children }) => (
                <del className="line-through text-[rgb(var(--color-neutral-foreground-2))]">
                  {children}
                </del>
              ),
            }}
          >
            {content}
          </Markdown>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 mb-4 rounded-full bg-[rgb(var(--color-neutral-background-3))] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[rgb(var(--color-neutral-foreground-2))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[rgb(var(--color-neutral-foreground-2))]">
              No description
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--color-neutral-foreground-2))/0.7]">
              Switch to Edit mode to add details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
