import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#015293] text-white",
        secondary:
          "border-transparent bg-[#f2a700] text-black",
        destructive:
          "border-transparent bg-[#f2a700] text-black",
        outline: "border border-[#015293] text-[#015293]",
        blue: "border-transparent bg-[#015293] text-white",
        green: "border-transparent bg-[#f2a700] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
