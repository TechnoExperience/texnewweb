import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
    )
}
