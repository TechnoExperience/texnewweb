import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_EMAIL = "edu.coco@technoexperience.net"
const ADMIN_PASSWORD = "technoexperience"

async function createAdminUser() {
    console.log(`Attempting to create admin user: ${ADMIN_EMAIL}`)

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    })

    if (authError) {
        console.error("Error creating user:", authError.message)
        // If user already exists, try to sign in
        if (authError.message.includes("already registered")) {
            console.log("User already exists, attempting login...")
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            })

            if (loginError) {
                console.error("Login failed:", loginError.message)
                return
            }

            if (loginData.user) {
                await makeUserAdmin(loginData.user.id)
            }
        }
        return
    }

    if (authData.user) {
        console.log("User created successfully:", authData.user.id)
        await makeUserAdmin(authData.user.id)
    } else {
        console.log("Signup successful but no user returned (maybe email confirmation needed?)")
    }
}

async function makeUserAdmin(userId: string) {
    console.log(`Promoting user ${userId} to admin...`)

    // 2. Check if profile exists
    const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

    const adminProfile = {
        id: userId,
        email: ADMIN_EMAIL,
        role: "admin", // This is the key step
        profile_type: "promoter",
        name: "Admin User",
        bio: "System Administrator",
        city: "Techno City",
        country: "World"
    }

    if (!profile) {
        // Insert profile
        console.log("Profile not found, inserting...")
        const { error: insertError } = await supabase
            .from("profiles")
            .insert(adminProfile)

        if (insertError) {
            console.error("Error inserting profile:", insertError.message)
        } else {
            console.log("Profile created with ADMIN role! 🚀")
        }
    } else {
        // Update profile
        console.log("Profile found, updating...")
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", userId)

        if (updateError) {
            console.error("Error updating profile:", updateError.message)
        } else {
            console.log("Profile updated to ADMIN role! 🚀")
        }
    }
}

createAdminUser().catch(console.error)
