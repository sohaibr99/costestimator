import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

const variantStyles = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-foreground",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ className, variant = "default", ...props }, ref) {
  return <span ref={ref} className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", variantStyles[variant], className)} {...props} />;
});

export { Badge };