import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/shared/utils";

interface IScrollArea
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: "vertical" | "horizontal";
}

const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  IScrollArea
>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      ref={ref}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

interface IScrollBar
  extends React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > {}

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  IScrollBar
>((props, ref) => {
  const { className, orientation = "vertical", ...rest } = props;

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className,
      )}
      orientation={orientation}
      ref={ref}
      {...rest}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
