import * as React from "react"
import { cn } from "@/lib/utils"

interface PhoneInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    prefix?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, type, prefix = "+569", ...props }, ref) => {
        return (
        <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-500">
            {prefix}
            </span>
            <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "pl-[4.5rem]", // Padding extra para el prefijo
                className
            )}
            ref={ref}
            {...props}
            />
        </div>
        )
    }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
