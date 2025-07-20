import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
        destructive: "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
        outline: "border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300",
        ghost: "text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200",
        link: "text-primary-600 underline-offset-4 hover:underline",
        success: "bg-success-600 text-white hover:bg-success-700 active:bg-success-800",
        warning: "bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants } 