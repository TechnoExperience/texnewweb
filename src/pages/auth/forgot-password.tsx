import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string }>({})

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string } = {}
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error("Error al enviar el email", {
          description: error.message,
        })
        setLoading(false)
        return
      }

      setSent(true)
      toast.success("Email de recuperación enviado")
    } catch (err) {
      console.error("[Forgot Password] Unexpected error:", err)
      toast.error("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full  bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Email Enviado</CardTitle>
            <CardDescription className="text-zinc-400">
              Revisa tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 mb-4">
              Hemos enviado un email a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-white/50 text-sm mb-4">
              Si no recibes el email en unos minutos, revisa tu carpeta de spam.
            </p>
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
              <Link to="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full  bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-zinc-400">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                required
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Email de Recuperación"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-zinc-400">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/auth/login" className="text-white hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

