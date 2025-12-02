import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { z } from "zod"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Verificar si hay un token válido en la URL
    const token = searchParams.get("token")
    if (!token) {
      toast.error("Token de recuperación no válido")
      navigate("/auth/login")
    } else {
      setIsValidToken(true)
    }
  }, [searchParams, navigate])

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { password?: string; confirmPassword?: string } = {}
        error.errors.forEach((err) => {
          if (err.path[0] === "password") fieldErrors.password = err.message
          if (err.path[0] === "confirmPassword") fieldErrors.confirmPassword = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        toast.error("Error al restablecer la contraseña", {
          description: error.message,
        })
        setLoading(false)
        return
      }

      toast.success("Contraseña restablecida correctamente")
      navigate("/auth/login")
    } catch (err) {
      console.error("[Reset Password] Unexpected error:", err)
      toast.error("Error inesperado al restablecer la contraseña")
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return null
  }

  return (
    <div className="w-full px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full  bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-zinc-400">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Nueva Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                required
                minLength={6}
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Nueva Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                required
                minLength={6}
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer Contraseña"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-zinc-400">
            <Link to="/auth/login" className="text-white hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

