import { useState } from "react"
import { Share2, Facebook, Twitter, Linkedin, Copy, Check, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  className?: string
}

export function SocialShare({ url, title, description, image, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.origin + url : url
  const shareText = description || title

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, "_blank", "width=600,height=400")
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedInUrl, "_blank", "width=600,height=400")
  }

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareByEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description || title}\n\n${shareUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("URL copiada al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Error al copiar URL")
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={shareNative}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartir
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareToFacebook}
        className="border-white/20 text-white hover:bg-blue-600/20 hover:border-blue-500"
        title="Compartir en Facebook"
      >
        <Facebook className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="border-white/20 text-white hover:bg-sky-500/20 hover:border-sky-400"
        title="Compartir en Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareToLinkedIn}
        className="border-white/20 text-white hover:bg-blue-700/20 hover:border-blue-600"
        title="Compartir en LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareToWhatsApp}
        className="border-white/20 text-white hover:bg-green-600/20 hover:border-green-500"
        title="Compartir en WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareByEmail}
        className="border-white/20 text-white hover:bg-white/10"
        title="Compartir por email"
      >
        <Mail className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="border-white/20 text-white hover:bg-white/10"
        title="Copiar enlace"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}

