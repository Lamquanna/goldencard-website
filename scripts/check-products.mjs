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

async function checkProducts() {
  try {
    console.log('🔍 Checking Products in Sanity...\n')
    
    const products = await client.fetch(
      `*[_type == "product"] {
        _id,
        name,
        locale,
        category,
        inStock,
        price
      }`
    )
    
    console.log(`✅ Found ${products.length} products\n`)
    
    if (products.length === 0) {
      console.log('⚠️  No products found in Sanity!')
      console.log('📝 Run: node scripts/seed-calculator-products.mjs')
      return
    }
    
    // Group by locale
    const byLocale = products.reduce((acc, p) => {
      acc[p.locale] = (acc[p.locale] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Products by Locale:')
    Object.entries(byLocale).forEach(([locale, count]) => {
      console.log(`   ${locale}: ${count} products`)
    })
    
    // Group by category
    const byCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📦 Products by Category:')
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`)
    })
    
    console.log('\n📋 Sample Products:')
    products.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} (${p.locale}) [${p.category}] ${p.inStock ? '✅' : '❌'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkProducts()
