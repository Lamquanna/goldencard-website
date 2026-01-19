import { createClient } from '@sanity/client'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('❌ ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID not found in .env.local')
  process.exit(1)
}

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ ERROR: SANITY_API_TOKEN not found in .env.local')
  console.log('📝 Create one at: https://www.sanity.io/manage')
  process.exit(1)
}

const stats = {
  products: { success: 0, failed: 0 },
  projects: { success: 0, failed: 0 },
  images: { uploaded: 0, failed: 0 },
}

async function uploadImage(imagePath) {
  try {
    console.log(`  ⏳ Uploading image: ${imagePath}`)
    
    const imageBuffer = readFileSync(imagePath)
    const filename = imagePath.split('/').pop()
    
    const asset = await client.assets.upload('image', imageBuffer, {
      filename,
    })
    
    console.log(`  ✅ Uploaded: ${filename} → ${asset._id}`)
    stats.images.uploaded++
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: filename.replace(/\.(jpg|jpeg|png|webp)$/i, ''),
    }
  } catch (error) {
    console.error(`  ❌ Failed to upload ${imagePath}:`, error.message)
    stats.images.failed++
    return null
  }
}

async function migrateProducts() {
  console.log('\n📦 MIGRATING PRODUCTS...')
  
  try {
    let productsData = []
    
    try {
      const dataFile = readFileSync('data/products.json', 'utf-8')
      productsData = JSON.parse(dataFile)
    } catch {
      console.log('ℹ️  No data/products.json found. Using mock data...')
      
      productsData = [
        {
          name: 'Longi Hi-MO 6 550W',
          slug: 'longi-hi-mo-6-550w',
          category: 'panels',
          brand: 'Longi',
          model: 'Hi-MO 6',
          price: 3500000,
          description: 'High-efficiency monocrystalline solar panel with 550W output',
          specs: [
            { label: 'Power Output', value: '550W' },
            { label: 'Efficiency', value: '21.5%' },
            { label: 'Warranty', value: '25 years' },
          ],
          features: [
            'High efficiency 21.5%',
            'Low degradation 0.5%/year',
            'Snow load 5400Pa',
          ],
          warranty: 25,
          inStock: true,
          locale: 'vi',
        },
        {
          name: 'Huawei SUN2000-20KTL-M2',
          slug: 'huawei-sun2000-20ktl-m2',
          category: 'inverters',
          brand: 'Huawei',
          model: 'SUN2000-20KTL-M2',
          price: 65000000,
          description: 'Smart string inverter 20kW with AI-powered optimization',
          specs: [
            { label: 'Rated Power', value: '20kW' },
            { label: 'Max Efficiency', value: '98.65%' },
            { label: 'MPPT Trackers', value: '4' },
          ],
          features: [
            '98.65% max efficiency',
            'AI curve scanning',
            'Integrated WiFi',
          ],
          warranty: 10,
          inStock: true,
          locale: 'vi',
        },
      ]
    }
    
    for (const product of productsData) {
      try {
        let mainImage = null
        if (product.imageUrl) {
          const imagePath = join('public', product.imageUrl)
          mainImage = await uploadImage(imagePath)
        }
        
        const doc = await client.create({
          _type: 'product',
          name: product.name,
          slug: { _type: 'slug', current: product.slug },
          category: product.category,
          brand: product.brand,
          model: product.model,
          price: product.price,
          mainImage,
          description: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: product.description,
                },
              ],
            },
          ],
          specs: product.specs || [],
          features: product.features || [],
          warranty: product.warranty,
          inStock: product.inStock !== false,
          locale: product.locale || 'vi',
        })
        
        console.log(`✅ Created product: ${product.name}`)
        stats.products.success++
      } catch (error) {
        console.error(`❌ Failed to create product "${product.name}":`, error.message)
        stats.products.failed++
      }
    }
  } catch (error) {
    console.error('❌ Products migration failed:', error.message)
  }
}

async function migrateProjects() {
  console.log('\n🏗️  MIGRATING PROJECTS...')
  
  try {
    let projectsData = []
    
    try {
      const dataFile = readFileSync('data/projects.json', 'utf-8')
      projectsData = JSON.parse(dataFile)
    } catch {
      console.log('ℹ️  No data/projects.json found. Using mock data...')
      
      projectsData = [
        {
          title: 'Khách sạn ABC - Quận 7 TP.HCM',
          slug: 'khach-san-abc-tphcm',
          client: 'Khách sạn ABC',
          location: {
            address: '123 Nguyễn Văn Linh',
            city: 'TP. Hồ Chí Minh',
            region: 'south',
          },
          systemType: 'commercial',
          capacity: 50,
          investment: 650000000,
          savings: 60,
          paybackPeriod: 4.5,
          completionDate: '2025-06-15',
          description: 'Commercial solar installation for hotel with rooftop system',
          challenges: 'Limited roof space, high electricity demand',
          solutions: 'High-efficiency panels, dual MPPT inverters',
          results: [
            '60% electricity bill reduction',
            '4.5 year payback period',
            'Zero grid dependency during day',
          ],
          testimonial: {
            quote: 'Excellent service and professional installation',
            author: 'Mr. Nguyen Van A',
            position: 'Hotel Owner',
            rating: 5,
          },
          featured: true,
          locale: 'vi',
        },
      ]
    }
    
    for (const project of projectsData) {
      try {
        let mainImage = null
        if (project.imageUrl) {
          const imagePath = join('public', project.imageUrl)
          mainImage = await uploadImage(imagePath)
        }
        
        const doc = await client.create({
          _type: 'project',
          title: project.title,
          slug: { _type: 'slug', current: project.slug },
          client: project.client,
          location: project.location,
          systemType: project.systemType,
          capacity: project.capacity,
          investment: project.investment,
          savings: project.savings,
          paybackPeriod: project.paybackPeriod,
          completionDate: project.completionDate,
          mainImage,
          description: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: project.description,
                },
              ],
            },
          ],
          challenges: project.challenges,
          solutions: project.solutions,
          results: project.results || [],
          testimonial: project.testimonial,
          featured: project.featured || false,
          locale: project.locale || 'vi',
        })
        
        console.log(`✅ Created project: ${project.title}`)
        stats.projects.success++
      } catch (error) {
        console.error(`❌ Failed to create project "${project.title}":`, error.message)
        stats.projects.failed++
      }
    }
  } catch (error) {
    console.error('❌ Projects migration failed:', error.message)
  }
}

async function migrate() {
  console.log('🚀 STARTING SMART DATA MIGRATION TO SANITY CMS')
  console.log('================================================')
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`)
  console.log('')
  
  const startTime = Date.now()
  
  await migrateProducts()
  await migrateProjects()
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  
  console.log('\n================================================')
  console.log('📊 MIGRATION SUMMARY')
  console.log('================================================')
  console.log(`Products: ${stats.products.success} success, ${stats.products.failed} failed`)
  console.log(`Projects: ${stats.projects.success} success, ${stats.projects.failed} failed`)
  console.log(`Images: ${stats.images.uploaded} uploaded, ${stats.images.failed} failed`)
  console.log(`Duration: ${duration}s`)
  console.log('================================================')
  
  if (stats.products.failed > 0 || stats.projects.failed > 0) {
    console.log('\n⚠️  Some items failed to migrate. Check errors above.')
    process.exit(1)
  } else {
    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('\n📝 Next steps:')
    console.log('1. Visit Sanity Studio: http://localhost:3000/studio')
    console.log('2. Verify migrated data')
    console.log('3. Update Next.js pages to fetch from Sanity')
  }
}

migrate().catch(error => {
  console.error('💥 MIGRATION FAILED:', error)
  process.exit(1)
})
