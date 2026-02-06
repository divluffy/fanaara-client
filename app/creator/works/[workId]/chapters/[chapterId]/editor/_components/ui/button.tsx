// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ui\button.tsx
"use client";

import React from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium " +
  "transition-colors select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-fuchsia-600 text-white hover:bg-fuchsia-500 border border-fuchsia-600 shadow-sm",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900 shadow-sm",
  outline:
    "bg-white/80 text-zinc-900 hover:bg-white border border-zinc-200 shadow-sm",
  ghost:
    "bg-transparent text-zinc-800 hover:bg-zinc-100 border border-transparent",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 border border-rose-600 shadow-sm",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export function IconButton(props: ButtonProps) {
  return <Button size="icon" {...props} />;
}
