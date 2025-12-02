import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"
import { config } from "dotenv"

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials in .env file")
    process.exit(1)
}

console.log("🔧 Connecting to Supabase...")
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function executeMigration() {
    try {
        // Read the migration file
        const migrationPath = join(process.cwd(), "supabase", "migrations", "00005_enterprise_features.sql")
        console.log(`📂 Reading migration file: ${migrationPath}`)

        const sqlContent = readFileSync(migrationPath, "utf-8")

        console.log("📝 Migration file loaded successfully")
        console.log(`   Size: ${sqlContent.length} characters`)
        console.log("")
        console.log("⚠️  IMPORTANT: This script uses the ANON key which has limited permissions.")
        console.log("   For production migrations, you should:")
        console.log("   1. Use Supabase Dashboard SQL Editor")
        console.log("   2. Or use Supabase CLI with service_role key")
        console.log("")
        console.log("📋 Migration Summary:")
        console.log("   - Creates content_versions table")
        console.log("   - Creates audit_logs table")
        console.log("   - Creates api_keys table")
        console.log("   - Creates rate_limits table")
        console.log("   - Creates cache_invalidations table")
        console.log("   - Adds versioning triggers")
        console.log("   - Adds audit triggers")
        console.log("   - Configures RLS policies")
        console.log("")

        // Try to execute via RPC (this will likely fail with anon key)
        console.log("🚀 Attempting to execute migration...")
        console.log("")
        console.log("⚠️  Since we're using the anon key, this will fail.")
        console.log("   Please copy the SQL and execute it manually in Supabase Dashboard:")
        console.log("")
        console.log("=".repeat(80))
        console.log("COPY THIS SQL TO SUPABASE DASHBOARD SQL EDITOR:")
        console.log("=".repeat(80))
        console.log(sqlContent)
        console.log("=".repeat(80))
        console.log("")
        console.log("📍 Steps to execute:")
        console.log("   1. Go to: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql")
        console.log("   2. Click 'New Query'")
        console.log("   3. Paste the SQL above")
        console.log("   4. Click 'Run' (or press F5)")
        console.log("")

    } catch (error: any) {
        console.error("❌ Error:", error.message)
        process.exit(1)
    }
}

executeMigration()
