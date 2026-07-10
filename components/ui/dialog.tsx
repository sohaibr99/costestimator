"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogContextValue {
  open: boolean;
  onOpenChange(open: boolean): void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange(open: boolean): void }>) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: React.PropsWithChildren) {
  const context = React.useContext(DialogContext);
  if (!React.isValidElement(children) || !context) return <>{children}</>;
  const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler; className?: string }>;
  return React.cloneElement(child, {
    onClick: (event: React.MouseEvent) => {
      child.props.onClick?.(event);
      context.onOpenChange(true);
    },
  });
}

export function DialogContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const context = React.useContext(DialogContext);
  if (!context?.open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={() => context.onOpenChange(false)} />
      <div className={cn("relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl", className)}>
        <button className="absolute right-4 top-4 text-foreground/70 transition hover:text-foreground" onClick={() => context.onOpenChange(false)} aria-label="Close dialog">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-foreground/65", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center justify-end gap-3", className)} {...props} />;
}

export function DialogClose({ asChild, children }: React.PropsWithChildren<{ asChild?: boolean }>) {
  const context = React.useContext(DialogContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler; className?: string }>;
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event);
        context.onOpenChange(false);
      },
    });
  }

  return <Button variant="outline" onClick={() => context.onOpenChange(false)}>{children}</Button>;
}