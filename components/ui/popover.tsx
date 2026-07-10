"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange(open: boolean): void;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function Popover({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange(open: boolean): void }>) {
  return <PopoverContext.Provider value={{ open, onOpenChange }}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ children }: React.PropsWithChildren) {
  const context = React.useContext(PopoverContext);
  if (!React.isValidElement(children) || !context) return <>{children}</>;
  const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler; className?: string }>;
  return React.cloneElement(child, {
    onClick: (event: React.MouseEvent) => {
      child.props.onClick?.(event);
      context.onOpenChange(!context.open);
    },
  });
}

export function PopoverContent({ className, align = "start", children }: React.PropsWithChildren<{ className?: string; align?: "start" | "center" | "end" }>) {
  const context = React.useContext(PopoverContext);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!context?.open) {
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      triggerRef.current = activeElement;
      setAnchorRect(activeElement.getBoundingClientRect());
    }
  }, [context?.open]);

  if (!context?.open || typeof document === "undefined" || !anchorRect) return null;

  const left = align === "end" ? anchorRect.right - 384 : align === "center" ? anchorRect.left + anchorRect.width / 2 - 192 : anchorRect.left;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0" aria-label="Close popover" onClick={() => context.onOpenChange(false)} />
      <div className={cn("absolute z-10 w-96 rounded-2xl border border-border bg-card p-2 shadow-xl", className)} style={{ top: anchorRect.bottom + 8, left, transform: align === "center" ? "translateX(-50%)" : undefined }}>
        {children}
      </div>
    </div>,
    document.body,
  );
}