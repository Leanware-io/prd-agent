import * as React from "react";
import { cn } from "@/shared/utils";

const CardComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    ref={ref}
    {...props}
  />
));

CardComponent.displayName = "Card";

export const Card = React.memo(CardComponent);

const CardHeaderComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("flex flex-col space-y-1.5 px-6 pt-6 pb-3", className)}
    ref={ref}
    {...props}
  />
));

CardHeaderComponent.displayName = "CardHeader";

export const CardHeader = React.memo(CardHeaderComponent);

const CardTitleComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    ref={ref}
    {...props}
  >
    {children}
  </h3>
));

CardTitleComponent.displayName = "CardTitle";

export const CardTitle = React.memo(CardTitleComponent);

const CardDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));

CardDescriptionComponent.displayName = "CardDescription";

export const CardDescription = React.memo(CardDescriptionComponent);

const CardContentComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />
));

CardContentComponent.displayName = "CardContent";

export const CardContent = React.memo(CardContentComponent);

const CardFooterComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    ref={ref}
    {...props}
  />
));

CardFooterComponent.displayName = "CardFooter";

export const CardFooter = React.memo(CardFooterComponent);
