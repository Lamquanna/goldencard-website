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

async function fixProductFields() {
  try {
    console.log('🔍 Fetching all products...')
    
    const products = await client.fetch(
      `*[_type == "product"] {
        _id,
        name,
        locale,
        category,
        inStock,
        image,
        mainImage,
        techSpecs
      }`
    )
    
    console.log(`✅ Found ${products.length} products\n`)
    
    let fixed = 0
    
    for (const product of products) {
      const patches = {}
      
      // Fix 1: Ensure inStock is true
      if (product.inStock !== true) {
        patches.inStock = true
      }
      
      // Fix 2: Copy image to mainImage if missing
      if (!product.mainImage && product.image) {
        patches.mainImage = product.image
      }
      
      // Fix 3: Ensure techSpecs exists
      if (!product.techSpecs) {
        // Extract from existing data if available
        patches.techSpecs = {
          capacity: 5000, // Default 5kW
          efficiency: 98,
          warrantyYears: 10
        }
      }
      
      if (Object.keys(patches).length > 0) {
        await client
          .patch(product._id)
          .set(patches)
          .commit()
        
        fixed++
        console.log(`✅ Fixed: ${product.name} (${product.locale})`)
        console.log(`   Patches:`, patches)
      }
    }
    
    console.log(`\n🎉 Fixed ${fixed} products`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixProductFields()
