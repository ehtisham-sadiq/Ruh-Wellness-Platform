import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-calm-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-calm-500 focus:outline-none focus:ring-2 focus:ring-health-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea } 