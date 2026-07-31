import * as React from "react";

import { cn } from "@/shared/utils";

interface ITextarea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function TextareaComponent(
  props: ITextarea,
  ref: React.ForwardedRef<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
}

TextareaComponent.displayName = "Textarea";

export const Textarea = React.memo(React.forwardRef(TextareaComponent));
