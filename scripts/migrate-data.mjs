import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-20',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

function getPlaceholderImage(keyword, index) {
  const collections = ['solar-panel', 'solar-energy', 'renewable-energy', 'green-energy']
  const collection = collections[index % collections.length]
  return `https://source.unsplash.com/featured/1200x800/?${collection},${keyword}`
}

async function uploadImageFromUrl(url, filename) {
  try {
    console.log(`  Đang tải ảnh: ${filename}...`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: filename,
      contentType: blob.type
    })
    console.log(`  ✅ Upload thành công`)
    return asset._id
  } catch (error) {
    console.error(`  ❌ Lỗi upload:`, error.message)
    return null
  }
}

async function createProject(project) {
  try {
    console.log(`\n📦 Đang tạo: ${project.title}`)
    const imageRefs = []
    if (project.images && project.images.length > 0) {
      for (let i = 0; i < project.images.length; i++) {
        const filename = project.images[i].split('/').pop()
        const keyword = project.slug.replace(/-/g, '+')
        const placeholderUrl = getPlaceholderImage(keyword, i)
        const assetId = await uploadImageFromUrl(placeholderUrl, filename)
        if (assetId) {
          imageRefs.push({
            _type: 'image',
            _key: `img-${i}`,
            asset: { _type: 'reference', _ref: assetId }
          })
        }
      }
    }

    const doc = {
      _type: 'project',
      _id: `project-${project.slug}`,
      title: project.title,
      slug: { _type: 'slug', current: project.slug },
      locale: project.locale || 'vi',
      projectType: project.type,
      capacity: project.capacity,
      location: project.location,
      completionDate: project.completionDate,
      investment: project.investment,
      savings: project.savings,
      paybackPeriod: project.paybackPeriod,
      description: project.description,
      challenge: project.challenge,
      solution: project.solution,
      results: project.results,
      testimonial: project.testimonial ? {
        _type: 'testimonial',
        quote: project.testimonial.quote,
        author: project.testimonial.author,
        position: project.testimonial.position
      } : undefined,
      images: imageRefs,
      featured: project.featured !== false,
      tags: project.tags || [],
      publishedAt: new Date().toISOString()
    }

    const result = await client.createOrReplace(doc)
    console.log(`✅ Thành công: ${result._id}`)
    return result
  } catch (error) {
    console.error(`❌ Lỗi:`, error.message)
    return null
  }
}

async function createSiteSettings() {
  try {
    console.log('\n⚙️  Tạo Site Settings...')
    const doc = {
      _type: 'siteSettings',
      _id: 'siteSettings',
      companyName: 'Golden Card Solution Co., Ltd',
      hotline: '0903 117 277',
      phone2: '03333 142 88',
      email: 'sales@goldenenergy.vn',
      address: '123 Đường ABC, TP. Hồ Chí Minh, Việt Nam',
      socialLinks: {
        facebook: 'https://facebook.com/goldenenergy',
        linkedin: 'https://linkedin.com/company/goldenenergy',
        youtube: 'https://youtube.com/c/goldenenergy'
      },
      seo: {
        title: 'Golden Energy - Giải pháp năng lượng mặt trời hàng đầu Việt Nam',
        description: 'Chuyên cung cấp giải pháp điện mặt trời cho hộ gia đình, thương mại và công nghiệp. Doanh thu 110 tỷ, thị phần 90% thẻ ETC B2B.',
        keywords: 'điện mặt trời, năng lượng sạch, solar energy, Golden Energy'
      }
    }
    await client.createOrReplace(doc)
    console.log('✅ Site Settings OK')
  } catch (error) {
    console.error('❌ Lỗi Site Settings:', error.message)
  }
}

async function migrate() {
  console.log('🚀 BẮT ĐẦU MIGRATION...\n')
  console.log('Project:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'production')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Thiếu SANITY_API_TOKEN')
    process.exit(1)
  }

  try {
    const dataPath = join(__dirname, '..', 'data', 'projects-real.json')
    const rawData = readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(rawData)

    console.log(`\n📊 Tìm thấy ${data.projects.length} dự án\n`)

    await createSiteSettings()

    let successCount = 0
    for (const project of data.projects) {
      const result = await createProject(project)
      if (result) successCount++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ MIGRATION HOÀN TẤT!')
    console.log(`📈 Thành công: ${successCount}/${data.projects.length}`)
    console.log('\n🎯 NEXT:')
    console.log('1. Kiểm tra: http://localhost:3000/cms')
    console.log('2. Deploy: git push origin main')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ LỖI:', error.message)
    process.exit(1)
  }
}

migrate()
