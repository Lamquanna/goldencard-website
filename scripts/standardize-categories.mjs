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

// Standardized category mappings
const categoryMapping = {
  // Inverters
  'inverters': 'inverter',
  'Inverter': 'inverter',
  'Inverters': 'inverter',
  
  // Solar Panels
  'panels': 'solar-panel',
  'panel': 'solar-panel',
  'Panel': 'solar-panel',
  'Panels': 'solar-panel',
  'solar-panels': 'solar-panel',
  'Solar Panel': 'solar-panel',
  'Solar Panels': 'solar-panel',
  
  // Batteries
  'batteries': 'battery',
  'Battery': 'battery',
  'Batteries': 'battery',
  
  // Accessories (optional standardization)
  'accessories': 'accessory',
  'Accessory': 'accessory',
  'Accessories': 'accessory',
}

async function standardizeCategories() {
  try {
    console.log('🔍 Fetching all products...\n')
    
    const products = await client.fetch(
      `*[_type == "product"] {
        _id,
        _rev,
        name,
        locale,
        category
      }`
    )
    
    console.log(`✅ Found ${products.length} products\n`)
    
    // Group by current category
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Current Categories:')
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const standardized = categoryMapping[cat] || cat
        const status = standardized === cat ? '✅' : '⚠️'
        console.log(`   ${status} ${cat}: ${count} products${standardized !== cat ? ` → ${standardized}` : ''}`)
      })
    
    console.log('\n🔧 Standardizing categories...\n')
    
    let updated = 0
    let skipped = 0
    
    for (const product of products) {
      const currentCategory = product.category
      const standardCategory = categoryMapping[currentCategory] || currentCategory
      
      if (currentCategory !== standardCategory) {
        try {
          await client
            .patch(product._id)
            .set({ category: standardCategory })
            .commit()
          
          updated++
          console.log(`✅ ${product.name} (${product.locale}): ${currentCategory} → ${standardCategory}`)
        } catch (error) {
          console.error(`❌ Failed to update ${product.name}:`, error.message)
        }
      } else {
        skipped++
      }
    }
    
    console.log(`\n🎉 Standardization complete!`)
    console.log(`   ✅ Updated: ${updated} products`)
    console.log(`   ⏭️  Skipped: ${skipped} products (already correct)`)
    
    // Show final category distribution
    console.log('\n📊 Final Category Distribution:')
    const finalProducts = await client.fetch(
      `*[_type == "product"] {
        category
      }`
    )
    
    const finalCounts = finalProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})
    
    Object.entries(finalCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ✅ ${cat}: ${count} products`)
      })
    
  } catch (error) {
    console.error('❌ Standardization failed:', error)
    throw error
  }
}

console.log('🚀 Starting category standardization...\n')
standardizeCategories()
  .then(() => {
    console.log('\n✅ Standardization completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Standardization failed:', error)
    process.exit(1)
  })
