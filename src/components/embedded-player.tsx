import type { EmbedData } from "@/lib/embeds"

interface EmbeddedPlayerProps {
  embed: EmbedData | null
  className?: string
}

export function EmbeddedPlayer({ embed, className }: EmbeddedPlayerProps) {
  if (!embed || !embed.embed_html) return null

  return (
    <div className={className ?? "w-full"}>
      <div className="aspect-video w-full">
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: embed.embed_html }}
        />
      </div>
    </div>
  )
}


