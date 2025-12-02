/**
 * Script to sync events from Resident Advisor
 * Run with: npx tsx scripts/sync-ra-events.ts
 */

import { syncRAEventsAllCountries } from '../src/services/ra-sync'

async function main() {
  console.log('🚀 Starting Resident Advisor events sync...\n')
  
  const result = await syncRAEventsAllCountries()
  
  console.log('\n📊 Sync Results:')
  console.log(`  ✅ Created: ${result.totalCreated}`)
  console.log(`  🔄 Updated: ${result.totalUpdated}`)
  console.log(`  📦 Total Processed: ${result.totalProcessed}`)
  
  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors (${result.errors.length}):`)
    result.errors.slice(0, 10).forEach(error => console.log(`  - ${error}`))
  }
  
  if (result.success) {
    console.log('\n✅ Sync completed successfully!')
    process.exit(0)
  } else {
    console.log('\n❌ Sync completed with errors')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

