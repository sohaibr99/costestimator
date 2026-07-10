import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary", className)} {...props} />;
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn("h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-left text-sm", className)} {...props}>
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-foreground/55">{placeholder}</span>;
}

export function SelectContent({ children }: React.PropsWithChildren) {
  return <div>{children}</div>;
}

export function SelectItem({ children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props}>{children}</option>;
}