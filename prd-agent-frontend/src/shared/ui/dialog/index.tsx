import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/shared/utils";
import { X } from "lucide-react";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

interface IDialogOverlay
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}

function DialogOverlayComponent(
  props: IDialogOverlay,
  ref: React.ForwardedRef<React.ComponentRef<typeof DialogPrimitive.Overlay>>,
) {
  const { className, ...rest } = props;

  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
}

DialogOverlayComponent.displayName = DialogPrimitive.Overlay.displayName;

export const DialogOverlay = React.memo(
  React.forwardRef(DialogOverlayComponent),
);

interface IDialogContent
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {}

function DialogContentComponent(
  props: IDialogContent,
  ref: React.ForwardedRef<React.ComponentRef<typeof DialogPrimitive.Content>>,
) {
  const { className, children, ...rest } = props;

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className,
        )}
        ref={ref}
        {...rest}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

DialogContentComponent.displayName = DialogPrimitive.Content.displayName;

export const DialogContent = React.memo(
  React.forwardRef(DialogContentComponent),
);

interface IDialogHeader extends React.HTMLAttributes<HTMLDivElement> {}

function DialogHeaderComponent(props: IDialogHeader) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...rest}
    />
  );
}

DialogHeaderComponent.displayName = "DialogHeader";

export const DialogHeader = React.memo(DialogHeaderComponent);

interface IDialogFooter extends React.HTMLAttributes<HTMLDivElement> {}

function DialogFooterComponent(props: IDialogFooter) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...rest}
    />
  );
}

DialogFooterComponent.displayName = "DialogFooter";

export const DialogFooter = React.memo(DialogFooterComponent);

interface IDialogTitle
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}

function DialogTitleComponent(
  props: IDialogTitle,
  ref: React.ForwardedRef<React.ComponentRef<typeof DialogPrimitive.Title>>,
) {
  const { className, ...rest } = props;

  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
}

DialogTitleComponent.displayName = DialogPrimitive.Title.displayName;

export const DialogTitle = React.memo(React.forwardRef(DialogTitleComponent));

interface IDialogDescription
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}

function DialogDescriptionComponent(
  props: IDialogDescription,
  ref: React.ForwardedRef<
    React.ComponentRef<typeof DialogPrimitive.Description>
  >,
) {
  const { className, ...rest } = props;

  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      ref={ref}
      {...rest}
    />
  );
}

DialogDescriptionComponent.displayName =
  DialogPrimitive.Description.displayName;

export const DialogDescription = React.memo(
  React.forwardRef(DialogDescriptionComponent),
);
