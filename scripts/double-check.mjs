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

async function doubleCheck() {
  console.log('='.repeat(60))
  console.log('🔍 DOUBLE CHECK ALL FIXES')
  console.log('='.repeat(60))
  
  // Test 1: Check products with techSpecs and inStock
  console.log('\n1️⃣ Products Status:')
  const productsCheck = await client.fetch(`{
    "total": count(*[_type == "product"]),
    "withTechSpecs": count(*[_type == "product" && defined(techSpecs)]),
    "withInStock": count(*[_type == "product" && inStock == true]),
    "inverters": count(*[_type == "product" && category == "inverter" && inStock == true && defined(techSpecs)]),
    "solarPanels": count(*[_type == "product" && category == "solar-panel" && inStock == true && defined(techSpecs)]),
    "batteries": count(*[_type == "product" && category == "battery" && inStock == true && defined(techSpecs)])
  }`)
  console.log('   Total Products:', productsCheck.total)
  console.log('   With techSpecs:', productsCheck.withTechSpecs)
  console.log('   With inStock=true:', productsCheck.withInStock)
  console.log('   Inverters (ready):', productsCheck.inverters)
  console.log('   Solar Panels (ready):', productsCheck.solarPanels)
  console.log('   Batteries (ready):', productsCheck.batteries)
  
  // Test 2: Simulate Calculator Query (exactly as in calculatorService.ts)
  console.log('\n2️⃣ Calculator Query Simulation (2M VND bill = ~2.78kW):')
  const systemSizeWatts = 2780 // ~2.78kW for 2M VND bill
  
  const inverter = await client.fetch(`*[
    _type == "product" && 
    category == "inverter" && 
    techSpecs.capacity >= $systemSize &&
    inStock == true
  ] | order(techSpecs.capacity asc) [0] {
    _id, name, brand, "capacity": techSpecs.capacity, price
  }`, { systemSize: systemSizeWatts })
  
  console.log('   Inverter:', inverter ? `✅ ${inverter.name} (${inverter.capacity}W)` : '❌ NOT FOUND')
  
  const panel = await client.fetch(`*[
    _type == "product" && 
    category == "solar-panel" && 
    inStock == true
  ] | order(techSpecs.efficiency desc) [0] {
    _id, name, brand, "capacity": techSpecs.capacity, "efficiency": techSpecs.efficiency, price
  }`)
  
  console.log('   Panel:', panel ? `✅ ${panel.name} (${panel.capacity}W, ${panel.efficiency}%)` : '❌ NOT FOUND')
  
  const battery = await client.fetch(`*[
    _type == "product" && 
    category == "battery" && 
    inStock == true
  ] | order(techSpecs.capacity asc) [0] {
    _id, name, brand, "capacity": techSpecs.capacity, price
  }`)
  
  console.log('   Battery:', battery ? `✅ ${battery.name} (${battery.capacity}Wh)` : '❌ NOT FOUND')
  
  // Test 3: Projects count by locale
  console.log('\n3️⃣ Projects by Locale:')
  const projects = await client.fetch(`{
    "vi": count(*[_type == "project" && locale == "vi"]),
    "en": count(*[_type == "project" && locale == "en"]),
    "zh": count(*[_type == "project" && locale == "zh"]),
    "id": count(*[_type == "project" && locale == "id"])
  }`)
  console.log('   Vietnamese:', projects.vi)
  console.log('   English:', projects.en)
  console.log('   Chinese:', projects.zh)
  console.log('   Indonesian:', projects.id)
  
  // Test 4: Products by locale
  console.log('\n4️⃣ Products by Locale:')
  const productsByLocale = await client.fetch(`{
    "vi": count(*[_type == "product" && locale == "vi"]),
    "en": count(*[_type == "product" && locale == "en"]),
    "zh": count(*[_type == "product" && locale == "zh"]),
    "id": count(*[_type == "product" && locale == "id"])
  }`)
  console.log('   Vietnamese:', productsByLocale.vi)
  console.log('   English:', productsByLocale.en)
  console.log('   Chinese:', productsByLocale.zh)
  console.log('   Indonesian:', productsByLocale.id)
  
  // Test 5: Check category page query
  console.log('\n5️⃣ Products Page Query (tam-pin category):')
  const categoryProducts = await client.fetch(`*[
    _type == "product" && 
    locale == "vi" && 
    category in ["panels", "solar-panel"]
  ] | order(featured desc, name asc) {
    _id, name, category, inStock
  }`)
  console.log('   Found:', categoryProducts.length, 'products')
  if (categoryProducts.length > 0) {
    categoryProducts.slice(0, 3).forEach(p => {
      console.log(`   - ${p.name} [${p.category}] ${p.inStock ? '✅' : '❌'}`)
    })
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  
  const issues = []
  
  if (!inverter) issues.push('❌ No inverter found for calculator')
  if (!panel) issues.push('❌ No solar panel found for calculator')
  if (productsCheck.inverters === 0) issues.push('❌ No inverters with techSpecs + inStock')
  if (productsCheck.solarPanels === 0) issues.push('❌ No solar panels with techSpecs + inStock')
  if (projects.en === 0) issues.push('⚠️ No English projects')
  
  if (issues.length === 0) {
    console.log('✅ ALL FIXES VERIFIED - Everything should work!')
  } else {
    console.log('Issues found:')
    issues.forEach(i => console.log('   ' + i))
  }
}

doubleCheck().catch(console.error)
