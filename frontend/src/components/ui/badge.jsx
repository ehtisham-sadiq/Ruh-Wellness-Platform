import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white hover:bg-primary-700",
        secondary:
          "border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-200",
        destructive:
          "border-transparent bg-error-600 text-white hover:bg-error-700",
        success:
          "border-transparent bg-success-600 text-white hover:bg-success-700",
        warning:
          "border-transparent bg-warning-600 text-white hover:bg-warning-700",
        outline: "text-secondary-700 border-secondary-300",
        scheduled:
          "border-transparent bg-primary-50 text-primary-800 border border-primary-200",
        completed:
          "border-transparent bg-success-50 text-success-800 border border-success-200",
        cancelled:
          "border-transparent bg-error-50 text-error-800 border border-error-200",
        pending:
          "border-transparent bg-secondary-50 text-secondary-800 border border-secondary-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 