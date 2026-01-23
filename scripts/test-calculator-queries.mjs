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

async function testCalculatorQueries() {
  console.log('🧪 Testing Calculator Product Queries...\n')
  
  const testSystemSize = 5000 // 5kW = 5000W
  
  try {
    // Test 1: Inverter Query
    console.log('🔌 Test 1: Inverter Query')
    console.log(`   Looking for inverter with capacity >= ${testSystemSize}W\n`)
    
    const inverterQuery = `*[
      _type == "product" && 
      (category == "inverter" || category == "inverters") && 
      techSpecs.capacity >= $systemSize &&
      inStock == true
    ] | order(techSpecs.capacity asc) [0...3] {
      name,
      category,
      "capacity": techSpecs.capacity,
      inStock,
      price
    }`
    
    const inverters = await client.fetch(inverterQuery, { systemSize: testSystemSize })
    
    if (inverters.length > 0) {
      console.log(`   ✅ Found ${inverters.length} inverter(s):`)
      inverters.forEach(inv => {
        console.log(`      - ${inv.name} (${inv.capacity}W) [${inv.category}] ${inv.price.toLocaleString()} VND`)
      })
    } else {
      console.log('   ❌ No inverters found!')
    }
    
    // Test 2: Solar Panel Query
    console.log('\n☀️  Test 2: Solar Panel Query')
    console.log('   Looking for panels with highest efficiency\n')
    
    const panelQuery = `*[
      _type == "product" && 
      (category == "solar-panel" || category == "panels") && 
      inStock == true
    ] | order(techSpecs.efficiency desc) [0...3] {
      name,
      category,
      "capacity": techSpecs.capacity,
      "efficiency": techSpecs.efficiency,
      inStock,
      price
    }`
    
    const panels = await client.fetch(panelQuery)
    
    if (panels.length > 0) {
      console.log(`   ✅ Found ${panels.length} panel(s):`)
      panels.forEach(panel => {
        console.log(`      - ${panel.name} (${panel.capacity}W, ${panel.efficiency}%) [${panel.category}] ${panel.price.toLocaleString()} VND`)
      })
    } else {
      console.log('   ❌ No panels found!')
    }
    
    // Test 3: Battery Query
    console.log('\n🔋 Test 3: Battery Query')
    console.log('   Looking for batteries with capacity >= 10000Wh\n')
    
    const batteryQuery = `*[
      _type == "product" && 
      (category == "battery" || category == "batteries") && 
      techSpecs.capacity >= $minCapacity &&
      inStock == true
    ] | order(techSpecs.capacity asc) [0...3] {
      name,
      category,
      "capacity": techSpecs.capacity,
      inStock,
      price
    }`
    
    const batteries = await client.fetch(batteryQuery, { minCapacity: 10000 })
    
    if (batteries.length > 0) {
      console.log(`   ✅ Found ${batteries.length} battery/batteries:`)
      batteries.forEach(bat => {
        console.log(`      - ${bat.name} (${bat.capacity}Wh) [${bat.category}] ${bat.price.toLocaleString()} VND`)
      })
    } else {
      console.log('   ❌ No batteries found!')
    }
    
    // Summary
    console.log('\n📊 Summary:')
    console.log(`   Inverters: ${inverters.length > 0 ? '✅' : '❌'}`)
    console.log(`   Panels: ${panels.length > 0 ? '✅' : '❌'}`)
    console.log(`   Batteries: ${batteries.length > 0 ? '✅' : '❌'}`)
    
    if (inverters.length > 0 && panels.length > 0) {
      console.log('\n✅ Calculator should work! Products are available.')
    } else {
      console.log('\n⚠️  Calculator may show fallback message.')
    }
    
  } catch (error) {
    console.error('\n❌ Error testing queries:', error)
  }
}

testCalculatorQueries()
