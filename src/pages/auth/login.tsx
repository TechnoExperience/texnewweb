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

const loginSchema = z.object({
  identifier: z.string().min(1, "El email o nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState("") // Puede ser email o username
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})

  const validateForm = () => {
    try {
      loginSchema.parse({ identifier, password })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { identifier?: string; password?: string } = {}
        error.errors.forEach((err) => {
          if (err.path[0] === "identifier") fieldErrors.identifier = err.message
          if (err.path[0] === "password") fieldErrors.password = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      console.log("[Login] Attempting login for:", identifier.trim())
      
      // Determinar si es email o username
      const isEmail = identifier.includes("@")
      let emailToUse = identifier.trim().toLowerCase()
      
      // Si no es email, buscar el username en profiles para obtener el email
      if (!isEmail) {
        console.log("[Login] Searching for username:", identifier.trim().toLowerCase())
        
        try {
          // Primero intentar búsqueda exacta (case-insensitive)
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email, username')
            .eq('username', identifier.trim().toLowerCase())
            .maybeSingle()
          
          // Si no se encuentra con búsqueda exacta, intentar con ilike
          if ((profileError && profileError.code === 'PGRST116') || !profileData) {
            console.log("[Login] Exact match not found, trying ilike...")
            const { data: ilikeData, error: ilikeError } = await supabase
              .from('profiles')
              .select('email, username')
              .ilike('username', `%${identifier.trim().toLowerCase()}%`)
              .maybeSingle()
            
            if (!ilikeError && ilikeData) {
              profileData = ilikeData
              profileError = null
            } else if (ilikeError && ilikeError.code !== 'PGRST116') {
              profileError = ilikeError
            }
          }
          
          console.log("[Login] Profile search result:", { profileData, profileError })
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("[Login] Error searching profile:", profileError)
            toast.error("Error al buscar usuario", {
              description: profileError.message || "Error al buscar el usuario en la base de datos.",
            })
            setLoading(false)
            return
          }
          
          if (!profileData || !profileData.email) {
            toast.error("Error al iniciar sesión", {
              description: "Usuario no encontrado. Verifica tu nombre de usuario o usa tu email.",
            })
            setLoading(false)
            return
          }
          
          emailToUse = profileData.email
          console.log("[Login] Found email for username:", emailToUse)
        } catch (err: any) {
          console.error("[Login] Exception searching username:", err)
          toast.error("Error al buscar usuario", {
            description: "Ocurrió un error al buscar el nombre de usuario. Intenta usar tu email.",
          })
          setLoading(false)
          return
        }
      }
      
      console.log("[Login] Attempting authentication with email:", emailToUse)
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

      if (error) {
        console.error("[Login] Error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          error: error
        })
        
        // Better error messages in Spanish
        let errorMessage = error.message || "Error desconocido"
        
        // Mostrar el mensaje completo del error para debugging
        if (error.status === 400) {
          if (error.message.includes("Invalid login credentials") || 
              error.message.includes("Invalid email or password") ||
              error.message.includes("Invalid credentials") ||
              error.message.includes("Email rate limit exceeded")) {
            errorMessage = "Email o contraseña incorrectos. Verifica tus credenciales."
          } else if (error.message.includes("Email not confirmed") || 
                     error.message.includes("email_not_confirmed")) {
            errorMessage = "Por favor, confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada."
          } else if (error.message.includes("User not found") || 
                     error.message.includes("No user found")) {
            errorMessage = "Usuario no encontrado. ¿Has creado una cuenta? Si acabas de registrarte, verifica tu email para confirmar la cuenta."
          } else {
            // Mostrar el mensaje real del error para debugging
            errorMessage = `Error de autenticación: ${error.message}`
          }
        } else if (error.message.includes("Too many requests") || 
                   error.message.includes("rate_limit")) {
          errorMessage = "Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo."
        }
        
        toast.error("Error al iniciar sesión", {
          description: errorMessage,
          duration: 6000,
        })
        setLoading(false)
        return
      }

      if (!authData.user) {
        console.error("[Login] No user returned from auth")
        toast.error("Error al iniciar sesión", {
          description: "No se pudo obtener la información del usuario. Intenta de nuevo.",
        })
        setLoading(false)
        return
      }

      console.log("[Login] User authenticated successfully:", authData.user.id)

      toast.success("¡Bienvenido!")

      // Check profile type and redirect accordingly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_type, role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error("[Login] Profile error:", profileError)
        // If profile doesn't exist, create a basic one
        if (profileError.code === 'PGRST116') {
          console.log("[Login] Profile doesn't exist, creating basic profile...")
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email || '',
              role: 'user',
              profile_type: null
            })
          
          if (insertError) {
            console.error("[Login] Error creating profile:", insertError)
          }
          
          // Redirect to home or profile selection
          navigate('/')
          return
        }
      }

      // Redirect based on role and profile type
      if (profile?.role === 'admin' || profile?.role === 'editor') {
        navigate('/admin')
      } else if (!profile || !profile.profile_type) {
        // If no profile or no profile_type, redirect to profile selection
        navigate('/auth/profile-selection')
      } else {
        // Redirect to user's profile page or home
        navigate('/')
      }
    } catch (err) {
      console.error("[Login] Unexpected error:", err)
      toast.error("Error inesperado al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full  bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-zinc-400">
            Ingresa tu correo y contraseña para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-white">
                Email o Nombre de Usuario
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="tu@email.com o tu_usuario"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  if (errors.identifier) setErrors({ ...errors, identifier: undefined })
                }}
                required
                autoComplete="username"
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.identifier ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.identifier && (
                <p className="text-sm text-red-400">{errors.identifier}</p>
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                required
                autoComplete="current-password"
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm text-zinc-400">
            <div>
              ¿No tienes cuenta?{" "}
              <Link to="/auth/sign-up" className="text-white hover:underline">
                Regístrate
              </Link>
            </div>
            <div>
              <Link to="/auth/forgot-password" className="text-white hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
