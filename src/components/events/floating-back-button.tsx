import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingBackButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-[#00F9FF]/50 transition-all shadow-lg hover:shadow-[#00F9FF]/20"
      aria-label="Volver atrás"
    >
      <ArrowLeft className="w-6 h-6" />
    </Button>
  )
}

