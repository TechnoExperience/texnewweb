import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
    message?: string
    className?: string
}

export function ErrorMessage({ message = "Ha ocurrido un error", className }: ErrorMessageProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center min-h-[200px] text-zinc-400",
                className
            )}
        >
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{message}</span>
            </div>
        </div>
    )
}
