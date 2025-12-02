import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Missing Supabase credentials")
    console.error("   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const OLD_EMAIL = "edu.coco@technoexperience.com"
const NEW_EMAIL = "edu.coco@technoexperience.net"

async function updateAdminEmail() {
    console.log(`🔄 Actualizando email del admin...`)
    console.log(`   De: ${OLD_EMAIL}`)
    console.log(`   A: ${NEW_EMAIL}\n`)

    try {
        // 1. Buscar usuario por email antiguo
        console.log("1️⃣ Buscando usuario con email antiguo...")
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
            console.error("❌ Error al listar usuarios:", listError.message)
            return
        }

        const user = users.users.find(u => u.email === OLD_EMAIL)
        
        if (!user) {
            console.log("⚠️  Usuario no encontrado con el email antiguo.")
            console.log("   Intentando crear nuevo usuario admin con el nuevo email...")
            
            // Si no existe, crear uno nuevo
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: NEW_EMAIL,
                password: "technoexperience",
                email_confirm: true,
                user_metadata: { role: "admin" }
            })

            if (createError) {
                console.error("❌ Error al crear usuario:", createError.message)
                return
            }

            console.log("✅ Usuario creado:", newUser.user.id)
            
            // Crear/actualizar perfil
            await updateProfile(newUser.user.id, NEW_EMAIL)
            return
        }

        console.log("✅ Usuario encontrado:", user.id)

        // 2. Actualizar email en auth.users usando Admin API
        console.log("\n2️⃣ Actualizando email en auth.users...")
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { email: NEW_EMAIL }
        )

        if (updateError) {
            console.error("❌ Error al actualizar email:", updateError.message)
            return
        }

        console.log("✅ Email actualizado en auth.users")

        // 3. Actualizar email en profiles
        console.log("\n3️⃣ Actualizando email en profiles...")
        await updateProfile(user.id, NEW_EMAIL)

        console.log("\n✅ ¡Email del admin actualizado exitosamente!")
        console.log(`   Nuevo email: ${NEW_EMAIL}`)
        console.log(`   Contraseña: technoexperience`)

    } catch (err) {
        console.error("❌ Error inesperado:", err)
    }
}

async function updateProfile(userId: string, email: string) {
    // Verificar si el perfil existe
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

    const profileData = {
        id: userId,
        email: email,
        role: "admin",
        profile_type: "promoter",
        name: "Admin User",
        bio: "System Administrator",
        city: "Techno City",
        country: "World"
    }

    if (!profile) {
        // Insertar perfil
        console.log("   Creando perfil...")
        const { error: insertError } = await supabaseAdmin
            .from("profiles")
            .insert(profileData)

        if (insertError) {
            console.error("   ❌ Error al crear perfil:", insertError.message)
        } else {
            console.log("   ✅ Perfil creado con rol ADMIN")
        }
    } else {
        // Actualizar perfil
        console.log("   Actualizando perfil existente...")
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
                email: email,
                role: "admin" 
            })
            .eq("id", userId)

        if (updateError) {
            console.error("   ❌ Error al actualizar perfil:", updateError.message)
        } else {
            console.log("   ✅ Perfil actualizado con rol ADMIN")
        }
    }
}

updateAdminEmail().catch(console.error)

