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

// Translation mappings for product names
const brandTranslations = {
  en: {
    // Keep brand names as-is (international brands)
  },
  zh: {
    'Solar Panel': '太阳能板',
    'Inverter': '逆变器',
    'Battery': '电池',
    'Hybrid': '混合',
    'Storage': '储能',
  },
  id: {
    'Solar Panel': 'Panel Surya',
    'Inverter': 'Inverter',
    'Battery': 'Baterai',
    'Hybrid': 'Hybrid',
    'Storage': 'Penyimpanan',
  }
}

// Translate product name
function translateProductName(viName, targetLang) {
  if (targetLang === 'en') {
    // English: Keep brand + model, translate type
    return viName
      .replace(/Tấm pin/gi, 'Solar Panel')
      .replace(/Biến tần/gi, 'Inverter')
      .replace(/Pin lưu trữ/gi, 'Battery Storage')
      .replace(/Hybrid/gi, 'Hybrid')
  } else if (targetLang === 'zh') {
    // Chinese: Translate types, keep brand/model
    return viName
      .replace(/Tấm pin/gi, '太阳能板')
      .replace(/Biến tần/gi, '逆变器')
      .replace(/Pin lưu trữ/gi, '储能电池')
  } else { // id
    // Indonesian: Translate types
    return viName
      .replace(/Tấm pin/gi, 'Panel Surya')
      .replace(/Biến tần/gi, 'Inverter')
      .replace(/Pin lưu trữ/gi, 'Baterai Penyimpanan')
  }
}

// Translate description text
function translateDescription(viDesc, targetLang) {
  if (!viDesc) return null
  
  const translations = {
    en: {
      'Tấm pin': 'Solar panel',
      'Biến tần': 'Inverter',
      'Pin lưu trữ': 'Battery storage',
      'công suất': 'capacity',
      'hiệu suất': 'efficiency',
      'bảo hành': 'warranty',
      'năm': 'years',
      'phù hợp': 'suitable for',
      'hộ gia đình': 'residential',
      'thương mại': 'commercial',
      'công nghiệp': 'industrial',
      'tích hợp': 'integrated',
      'chuyển đổi': 'conversion',
      'điện áp': 'voltage',
      'dung lượng': 'capacity',
      'chu kỳ': 'cycles',
      'sạc': 'charging',
      'người': 'people'
    },
    zh: {
      'Tấm pin': '太阳能板',
      'Biến tần': '逆变器',
      'Pin lưu trữ': '储能电池',
      'công suất': '功率',
      'hiệu suất': '效率',
      'bảo hành': '保修',
      'năm': '年',
      'phù hợp': '适合',
      'hộ gia đình': '住宅',
      'thương mại': '商业',
      'công nghiệp': '工业',
      'tích hợp': '集成',
      'chuyển đổi': '转换',
      'điện áp': '电压',
      'dung lượng': '容量',
      'chu kỳ': '循环',
      'sạc': '充电',
      'người': '人'
    },
    id: {
      'Tấm pin': 'Panel surya',
      'Biến tần': 'Inverter',
      'Pin lưu trữ': 'Baterai penyimpanan',
      'công suất': 'kapasitas',
      'hiệu suất': 'efisiensi',
      'bảo hành': 'garansi',
      'năm': 'tahun',
      'phù hợp': 'cocok untuk',
      'hộ gia đình': 'residensial',
      'thương mại': 'komersial',
      'công nghiệp': 'industri',
      'tích hợp': 'terintegrasi',
      'chuyển đổi': 'konversi',
      'điện áp': 'tegangan',
      'dung lượng': 'kapasitas',
      'chu kỳ': 'siklus',
      'sạc': 'pengisian',
      'người': 'orang'
    }
  }
  
  let result = viDesc
  const map = translations[targetLang]
  
  for (const [vi, trans] of Object.entries(map)) {
    result = result.replace(new RegExp(vi, 'gi'), trans)
  }
  
  return result
}

// Translate block content (Portable Text)
function translateBlockContent(blocks, targetLang) {
  if (!blocks || !Array.isArray(blocks)) return blocks
  
  return blocks.map(block => {
    if (block._type === 'block' && block.children) {
      return {
        ...block,
        children: block.children.map(child => {
          if (child._type === 'span' && child.text) {
            return {
              ...child,
              text: translateDescription(child.text, targetLang)
            }
          }
          return child
        })
      }
    }
    return block
  })
}

// Main migration function
async function migrateProducts() {
  try {
    console.log('🔍 Fetching Vietnamese products...')
    
    const viProducts = await client.fetch(
      `*[_type == "product" && locale == "vi"] {
        _id,
        _type,
        name,
        slug,
        category,
        brand,
        model,
        techSpecs,
        price,
        description,
        specs,
        features,
        certifications,
        applications,
        inStock,
        featured,
        image
      }`
    )
    
    console.log(`✅ Found ${viProducts.length} Vietnamese products\n`)
    
    const targetLocales = ['en', 'zh', 'id']
    let created = 0
    
    for (const locale of targetLocales) {
      console.log(`🌍 Creating ${locale.toUpperCase()} translations...`)
      
      for (const viProduct of viProducts) {
        try {
          const translatedProduct = {
            _type: 'product',
            locale,
            name: translateProductName(viProduct.name, locale),
            slug: {
              _type: 'slug',
              current: `${viProduct.slug.current}-${locale}`
            },
            category: viProduct.category,
            brand: viProduct.brand,
            model: viProduct.model,
            techSpecs: viProduct.techSpecs,
            price: viProduct.price,
            description: viProduct.description ? translateBlockContent(viProduct.description, locale) : null,
            specs: viProduct.specs ? viProduct.specs.map(spec => ({
              ...spec,
              label: translateDescription(spec.label, locale)
            })) : null,
            features: viProduct.features ? viProduct.features.map(f => translateDescription(f, locale)) : null,
            certifications: viProduct.certifications,
            applications: viProduct.applications ? viProduct.applications.map(a => translateDescription(a, locale)) : null,
            inStock: viProduct.inStock,
            featured: viProduct.featured,
            image: viProduct.image
          }
          
          const result = await client.create(translatedProduct)
          created++
          console.log(`✅ ${translatedProduct.name} (${locale})`)
          
        } catch (error) {
          console.error(`❌ Failed: ${viProduct.name} (${locale}):`, error.message)
        }
      }
      console.log('')
    }
    
    console.log(`🎉 Migration complete! Created ${created} new products\n`)
    console.log(`📊 Summary:`)
    console.log(`   - Vietnamese products: ${viProducts.length}`)
    console.log(`   - New products created: ${created}`)
    console.log(`   - Total products: ${viProducts.length + created}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
console.log('🚀 Starting multi-language product migration...\n')
migrateProducts()
  .then(() => {
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
