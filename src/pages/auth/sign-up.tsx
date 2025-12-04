import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { z } from "zod"

const signUpSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export default function SignUpPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")

  const calculatePasswordStrength = (pwd: string): "weak" | "medium" | "strong" => {
    if (pwd.length < 6) return "weak"
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    if (score >= 3 && pwd.length >= 8) return "strong"
    if (score >= 2) return "medium"
    return "weak"
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
    if (errors.password) setErrors({ ...errors, password: undefined })
  }

  const validateForm = () => {
    try {
      signUpSchema.parse({ email, password, confirmPassword })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {}
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message
          if (err.path[0] === "password") fieldErrors.password = err.message
          if (err.path[0] === "confirmPassword") fieldErrors.confirmPassword = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/sign-up-success`,
        data: {
          // Datos adicionales que se pueden usar después
        }
      },
    })

    // Si el registro fue exitoso, crear el perfil con username (si se proporciona)
    if (!error && authData.user) {
      // El username se puede agregar después en el perfil
      // Por ahora solo creamos el perfil básico
    }

    if (error) {
      let errorMessage = error.message || "Error desconocido"
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email ya está registrado. ¿Quieres iniciar sesión?"
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "El formato del email no es válido"
      } else if (error.message.includes("Password")) {
        errorMessage = "La contraseña no cumple con los requisitos de seguridad"
      }
      
      toast.error("Error al registrarse", {
        description: errorMessage,
        duration: 5000,
      })
    } else {
      toast.success("¡Cuenta creada! Revisa tu email para confirmar tu cuenta.")
      navigate("/auth/sign-up-success")
    }

    setLoading(false)
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "strong": return "bg-green-500"
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "weak": return "Débil"
      case "medium": return "Media"
      case "strong": return "Fuerte"
    }
  }

  return (
    <div className="w-full px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Crear Cuenta</CardTitle>
          <CardDescription className="text-zinc-400">Crea tu cuenta para acceder a todo el contenido</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
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
                autoComplete="email"
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: passwordStrength === "weak" ? "33%" : passwordStrength === "medium" ? "66%" : "100%" }}
                      />
                    </div>
                    <span className={`text-xs ${
                      passwordStrength === "weak" ? "text-red-400" : 
                      passwordStrength === "medium" ? "text-yellow-400" : 
                      "text-green-400"
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Debe contener: mayúsculas, minúsculas y números
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Contraseña
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
                autoComplete="new-password"
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
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-zinc-400">
            ¿Ya tienes cuenta?{" "}
            <Link to="/auth/login" className="text-white hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
