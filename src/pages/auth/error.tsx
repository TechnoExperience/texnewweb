import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ErrorPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Error de Autenticación</CardTitle>
          <CardDescription className="text-zinc-400">
            Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
            <Link to="/auth/login">Ir a Iniciar Sesión</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
          >
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
