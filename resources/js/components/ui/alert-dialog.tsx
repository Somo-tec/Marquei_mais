"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/components/ui/utils";
import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/components/ui/use-mobile";

// Context to ensure all children use the same rendering mode as the parent
const AlertDialogModeContext = React.createContext<boolean>(false);
function useIsDrawerMode() {
  return React.useContext(AlertDialogModeContext);
}

function AlertDialog({
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  const isMobile = useIsMobile();

  return (
    <AlertDialogModeContext.Provider value={isMobile}>
      {isMobile ? (
        <DrawerPrimitive.Root
          data-slot="alert-dialog"
          open={props.open}
          onOpenChange={props.onOpenChange}
        >
          {children}
        </DrawerPrimitive.Root>
      ) : (
        <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props}>
          {children}
        </AlertDialogPrimitive.Root>
      )}
    </AlertDialogModeContext.Provider>
  );
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return <DrawerPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
  }

  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return (
      <DrawerPrimitive.Portal data-slot="alert-dialog-portal">
        <DrawerPrimitive.Overlay
          data-slot="alert-dialog-overlay"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
        />
        <DrawerPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(
            "bg-background fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl border-t p-6 pt-0 shadow-lg overflow-y-auto",
            className,
          )}
        >
          <div className="mx-auto mt-3 mb-4 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    );
  }

  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay
        data-slot="alert-dialog-overlay"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
      />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...(props as any)}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return (
      <DrawerPrimitive.Title
        data-slot="alert-dialog-title"
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    );
  }

  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return (
      <DrawerPrimitive.Description
        data-slot="alert-dialog-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
      />
    );
  }

  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return (
      <DrawerPrimitive.Close
        data-slot="alert-dialog-action"
        className={cn(buttonVariants(), className)}
        {...(props as any)}
      />
    );
  }

  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  const isDrawer = useIsDrawerMode();

  if (isDrawer) {
    return (
      <DrawerPrimitive.Close
        data-slot="alert-dialog-cancel"
        className={cn(buttonVariants({ variant: "outline" }), className)}
        {...(props as any)}
      />
    );
  }

  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
