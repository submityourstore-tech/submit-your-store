import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jd-blue)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--jd-blue)] text-white hover:bg-[var(--jd-blue-dark)]",
        secondary: "bg-[var(--jd-surface)] text-[var(--jd-text)] border border-[var(--jd-border)] hover:bg-[var(--jd-border)]",
        outline: "border border-[var(--jd-border)] bg-transparent hover:bg-[var(--jd-surface)]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        ghost: "hover:bg-[var(--jd-surface)]",
        orange: "bg-[var(--jd-orange)] text-white hover:bg-[var(--jd-orange-dark)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
