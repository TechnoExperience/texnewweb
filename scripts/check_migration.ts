import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkMigration() {
    console.log("🔍 Checking if migration 00005 is already applied...\n")

    const tablesToCheck = [
        'content_versions',
        'audit_logs',
        'api_keys',
        'rate_limits',
        'cache_invalidations'
    ]

    let allExist = true

    for (const table of tablesToCheck) {
        try {
            const { error } = await supabase.from(table).select('id').limit(1)

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    console.log(`❌ Table "${table}" does NOT exist`)
                    allExist = false
                } else {
                    console.log(`✅ Table "${table}" exists`)
                }
            } else {
                console.log(`✅ Table "${table}" exists`)
            }
        } catch (err: any) {
            console.log(`❌ Table "${table}" does NOT exist or is not accessible`)
            allExist = false
        }
    }

    console.log("\n" + "=".repeat(60))

    if (allExist) {
        console.log("✅ ¡MIGRACIÓN YA APLICADA!")
        console.log("   Todas las tablas enterprise están creadas.")
        console.log("   Puedes proceder con el desarrollo.")
    } else {
        console.log("❌ MIGRACIÓN PENDIENTE")
        console.log("   Debes ejecutar la migración 00005_enterprise_features.sql")
        console.log("\n📋 Pasos:")
        console.log("   1. Abre: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new")
        console.log("   2. Copia todo el contenido de: supabase/migrations/00005_enterprise_features.sql")
        console.log("   3. Pega en el editor SQL")
        console.log("   4. Haz clic en 'Run' (o presiona F5)")
    }
    console.log("=".repeat(60))
}

checkMigration()
