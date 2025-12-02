/**
 * Script para crear usuario administrador desde la línea de comandos
 * Uso: npm run create-admin [email] [password]
 * Ejemplo: npm run create-admin admin@example.com miPassword123
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import * as readline from "node:readline"

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error("❌ Error: VITE_SUPABASE_URL o SUPABASE_URL no encontrado en .env")
  process.exit(1)
}

// Usar service role key si está disponible, sino usar anon key
const supabaseKey = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error("❌ Error: VITE_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY no encontrado en .env")
  process.exit(1)
}

// Crear cliente con service role key si está disponible (permite más permisos)
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(supabaseUrl, supabaseKey)

// Función para leer input del usuario
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

async function createAdminUser() {
  console.log("\n🚀 ========================================")
  console.log("   CREAR USUARIO ADMINISTRADOR")
  console.log("   ========================================\n")

  // Obtener email y password de argumentos o preguntar
  let email = process.argv[2]
  let password = process.argv[3]

  if (!email) {
    email = await askQuestion("📧 Email del administrador: ")
  }

  if (!password) {
    password = await askQuestion("🔒 Contraseña (mínimo 6 caracteres): ")
  }

  if (!email || !password) {
    console.error("❌ Email y contraseña son requeridos")
    process.exit(1)
  }

  if (password.length < 6) {
    console.error("❌ La contraseña debe tener al menos 6 caracteres")
    process.exit(1)
  }

  console.log(`\n⏳ Creando usuario admin: ${email}...\n`)

  try {
    // Si tenemos service role key, usar Admin API
    if (supabaseServiceKey) {
      console.log("🔑 Usando Service Role Key (máximos permisos)...")
      
      // Crear usuario con Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Confirmar email automáticamente
      })

      if (authError) {
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          console.log("⚠️  Usuario ya existe, actualizando a admin...")
          
          // Buscar usuario existente
          const { data: users, error: listError } = await supabase.auth.admin.listUsers()
          if (listError) {
            console.error("❌ Error al buscar usuario:", listError.message)
            process.exit(1)
          }

          const existingUser = users.users.find(u => u.email === email)
          if (!existingUser) {
            console.error("❌ Usuario no encontrado")
            process.exit(1)
          }

          await makeUserAdmin(existingUser.id, email)
          return
        }
        
        console.error("❌ Error al crear usuario:", authError.message)
        process.exit(1)
      }

      if (authData.user) {
        console.log("✅ Usuario creado exitosamente:", authData.user.id)
        await makeUserAdmin(authData.user.id, email)
      }
    } else {
      // Usar método normal (requiere confirmación de email)
      console.log("🔑 Usando método estándar (puede requerir confirmación de email)...")
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          console.log("⚠️  Usuario ya existe, intentando iniciar sesión...")
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })

          if (loginError) {
            console.error("❌ Error al iniciar sesión:", loginError.message)
            console.log("\n💡 Sugerencia: Usa SUPABASE_SERVICE_ROLE_KEY en .env para crear admins directamente")
            process.exit(1)
          }

          if (loginData.user) {
            await makeUserAdmin(loginData.user.id, email)
          }
        } else {
          console.error("❌ Error al crear usuario:", authError.message)
          process.exit(1)
        }
      } else if (authData.user) {
        console.log("✅ Usuario creado exitosamente:", authData.user.id)
        await makeUserAdmin(authData.user.id, email)
      } else {
        console.log("⚠️  Usuario creado pero requiere confirmación de email")
        console.log("💡 Revisa tu correo y confirma la cuenta, luego ejecuta este script nuevamente")
      }
    }
  } catch (error: any) {
    console.error("❌ Error inesperado:", error.message)
    process.exit(1)
  }
}

async function makeUserAdmin(userId: string, email: string) {
  console.log(`\n👤 Promoviendo usuario a administrador...`)

  // Verificar si el perfil existe
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  const adminProfile = {
    id: userId,
    email: email,
    role: "admin",
    name: "Administrador",
    bio: "Usuario administrador del sistema",
  }

  if (!profile) {
    // Insertar perfil
    console.log("📝 Creando perfil de administrador...")
    const { error: insertError } = await supabase
      .from("profiles")
      .insert(adminProfile)

    if (insertError) {
      console.error("❌ Error al crear perfil:", insertError.message)
      
      // Si es error de RLS, intentar con upsert
      if (insertError.message.includes("policy") || insertError.message.includes("RLS")) {
        console.log("⚠️  Error de permisos, intentando con upsert...")
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(adminProfile, { onConflict: "id" })
        
        if (upsertError) {
          console.error("❌ Error al hacer upsert:", upsertError.message)
          console.log("\n💡 Necesitas ejecutar esto desde Supabase SQL Editor:")
          console.log(`   UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`)
          process.exit(1)
        } else {
          console.log("✅ Perfil creado con rol ADMIN! 🚀")
        }
      } else {
        process.exit(1)
      }
    } else {
      console.log("✅ Perfil creado con rol ADMIN! 🚀")
    }
  } else {
    // Actualizar perfil
    console.log("📝 Actualizando perfil existente a administrador...")
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId)

    if (updateError) {
      console.error("❌ Error al actualizar perfil:", updateError.message)
      
      if (updateError.message.includes("policy") || updateError.message.includes("RLS")) {
        console.log("\n💡 Error de permisos. Ejecuta esto desde Supabase SQL Editor:")
        console.log(`   UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`)
        console.log(`   O agrega SUPABASE_SERVICE_ROLE_KEY a tu archivo .env`)
      }
      process.exit(1)
    } else {
      console.log("✅ Perfil actualizado a ADMIN! 🚀")
    }
  }

  console.log("\n🎉 ========================================")
  console.log("   ¡USUARIO ADMIN CREADO EXITOSAMENTE!")
  console.log("   ========================================")
  console.log(`\n📧 Email: ${email}`)
  console.log(`🆔 User ID: ${userId}`)
  console.log(`🔗 Accede a: /admin`)
  console.log("\n")
}

// Ejecutar
createAdminUser().catch((error) => {
  console.error("❌ Error fatal:", error)
  process.exit(1)
})

