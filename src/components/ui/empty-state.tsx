import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 p-4 bg-zinc-900 rounded-full">
          <Icon className="h-12 w-12 text-zinc-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-zinc-400 max-w-md mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-white text-black hover:bg-zinc-200">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

