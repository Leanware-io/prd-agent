import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/shared/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useToast } from "@/app/providers";
import { X } from "lucide-react";

export const ToastProvider = ToastPrimitives.Provider;

interface IToastViewport
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> {}

function ToastViewportComponent(
  props: IToastViewport,
  ref: React.ForwardedRef<React.ComponentRef<typeof ToastPrimitives.Viewport>>,
) {
  const { className, ...rest } = props;

  return (
    <ToastPrimitives.Viewport
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
}

ToastViewportComponent.displayName = ToastPrimitives.Viewport.displayName;

export const ToastViewport = React.memo(
  React.forwardRef(ToastViewportComponent),
);

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
  },
);

interface IToast
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

function ToastComponent(
  props: IToast,
  ref: React.ForwardedRef<React.ComponentRef<typeof ToastPrimitives.Root>>,
) {
  const { className, variant, ...rest } = props;

  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      ref={ref}
      {...rest}
    />
  );
}

ToastComponent.displayName = ToastPrimitives.Root.displayName;

export const Toast = React.memo(React.forwardRef(ToastComponent));

interface IToastAction
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {}

function ToastActionComponent(
  props: IToastAction,
  ref: React.ForwardedRef<React.ComponentRef<typeof ToastPrimitives.Action>>,
) {
  const { className, ...rest } = props;

  return (
    <ToastPrimitives.Action
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
}

ToastActionComponent.displayName = ToastPrimitives.Action.displayName;

export const ToastAction = React.memo(React.forwardRef(ToastActionComponent));

interface IToastClose
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> {}

function ToastCloseComponent(
  props: IToastClose,
  ref: React.ForwardedRef<React.ComponentRef<typeof ToastPrimitives.Close>>,
) {
  const { className, ...rest } = props;

  return (
    <ToastPrimitives.Close
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className,
      )}
      ref={ref}
      toast-close=""
      {...rest}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}

ToastCloseComponent.displayName = ToastPrimitives.Close.displayName;

export const ToastClose = React.memo(React.forwardRef(ToastCloseComponent));

interface IToastTitle
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> {}

function ToastTitleComponent(
  props: IToastTitle,
  ref: React.ForwardedRef<React.ComponentRef<typeof ToastPrimitives.Title>>,
) {
  const { className, ...rest } = props;

  return (
    <ToastPrimitives.Title
      className={cn("text-sm font-semibold", className)}
      ref={ref}
      {...rest}
    />
  );
}

ToastTitleComponent.displayName = ToastPrimitives.Title.displayName;

export const ToastTitle = React.memo(React.forwardRef(ToastTitleComponent));

interface IToastDescription
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> {}

function ToastDescriptionComponent(
  props: IToastDescription,
  ref: React.ForwardedRef<
    React.ComponentRef<typeof ToastPrimitives.Description>
  >,
) {
  const { className, ...rest } = props;

  return (
    <ToastPrimitives.Description
      className={cn("text-sm opacity-90", className)}
      ref={ref}
      {...rest}
    />
  );
}

ToastDescriptionComponent.displayName = ToastPrimitives.Description.displayName;

export const ToastDescription = React.memo(
  React.forwardRef(ToastDescriptionComponent),
);

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { type ToastProps, type ToastActionElement };

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
