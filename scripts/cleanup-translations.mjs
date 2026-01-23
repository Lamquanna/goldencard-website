import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function deleteDuplicateTranslations() {
  try {
    console.log('🔍 Finding existing translations to clean up...\n')
    
    // Delete all EN/ZH/ID projects that were created by migration
    const locales = ['en', 'zh', 'id']
    let deleted = 0
    
    for (const locale of locales) {
      console.log(`🗑️  Deleting ${locale.toUpperCase()} projects...`)
      
      const projects = await client.fetch(
        `*[_type == "project" && locale == $locale] {
          _id,
          title
        }`,
        { locale }
      )
      
      for (const project of projects) {
        try {
          await client.delete(project._id)
          deleted++
          console.log(`   ✅ Deleted: ${project.title}`)
        } catch (error) {
          console.error(`   ❌ Failed: ${project.title}`)
        }
      }
    }
    
    console.log(`\n🎉 Cleanup complete! Deleted ${deleted} projects\n`)
    
    // Also clean up duplicate products
    console.log('🔍 Finding duplicate products...\n')
    
    for (const locale of locales) {
      console.log(`🗑️  Deleting ${locale.toUpperCase()} products...`)
      
      const products = await client.fetch(
        `*[_type == "product" && locale == $locale] {
          _id,
          name
        }`,
        { locale }
      )
      
      for (const product of products) {
        try {
          await client.delete(product._id)
          deleted++
          console.log(`   ✅ Deleted: ${product.name}`)
        } catch (error) {
          console.error(`   ❌ Failed: ${product.name}`)
        }
      }
    }
    
    console.log(`\n🎉 Total cleanup: Deleted ${deleted} documents`)
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

console.log('🚀 Starting cleanup of duplicate translations...\n')
deleteDuplicateTranslations()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  })
