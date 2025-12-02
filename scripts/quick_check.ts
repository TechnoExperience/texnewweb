import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config()

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
)

async function quickCheck() {
    try {
        const { data, error } = await supabase.from('content_versions').select('id').limit(1)

        if (error) {
            console.log("MIGRACIÓN NO APLICADA - Error:", error.message)
            return false
        }

        console.log("MIGRACIÓN YA APLICADA ✅")
        return true
    } catch (e: any) {
        console.log("MIGRACIÓN NO APLICADA - Exception:", e.message)
        return false
    }
}

quickCheck()
