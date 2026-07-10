"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange(open: boolean): void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange(open: boolean): void }>) {
  return <DropdownMenuContext.Provider value={{ open, onOpenChange }}>{children}</DropdownMenuContext.Provider>;
}

export function DropdownMenuTrigger({ children }: React.PropsWithChildren) {
  const context = React.useContext(DropdownMenuContext);
  if (!React.isValidElement(children) || !context) return <>{children}</>;
  const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler; className?: string }>;
  return React.cloneElement(child, {
    onClick: (event: React.MouseEvent) => {
      child.props.onClick?.(event);
      context.onOpenChange(!context.open);
    },
  });
}

export function DropdownMenuContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0" aria-label="Close menu" onClick={() => context.onOpenChange(false)} />
      <div className={cn("absolute right-4 top-14 min-w-48 rounded-2xl border border-border bg-card p-2 shadow-xl", className)}>{children}</div>
    </div>,
    document.body,
  );
}

export function DropdownMenuItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className={cn("flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-muted", className)}
      onClick={(event) => {
        props.onClick?.(event);
        context?.onOpenChange(false);
      }}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-2 h-px bg-border", className)} {...props} />;
}