import type * as React from "react";

import { cn } from "../lib/cn.js";

export interface SectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Actions beside the title. */
  action?: React.ReactNode;
  /** A hairline under the heading; spacing alone by default. */
  divided?: boolean;
  /** For the document outline. Defaults to h2. */
  headingLevel?: "h2" | "h3";
  children: React.ReactNode;
}

/**
 * A page region, expressed as a heading rather than a border: the top level
 * of `PageFrame > Section > (Card | table | chart)`. Never wrap a bordered box
 * around another, and never put a Section inside a Card.
 */
export function Section({
  title,
  description,
  action,
  divided = false,
  headingLevel = "h2",
  className,
  children,
  ...props
}: SectionProps) {
  const Heading = headingLevel;
  const hasHeader = Boolean(title || description || action);
  return (
    <section
      data-slot="section"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
            divided && "border-b pb-3"
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <Heading className="text-base font-semibold tracking-tight">{title}</Heading>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
