import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "input-healthcare",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const SearchInput = React.forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-calm-400" />
      )}
      <input
        type="search"
        className={cn(
          "input-healthcare pl-10",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
})
SearchInput.displayName = "SearchInput"

export { Input, SearchInput } 