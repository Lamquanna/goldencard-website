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

// Translation mappings
const translations = {
  systemType: {
    residential: {
      vi: 'Hộ gia đình',
      en: 'Residential',
      zh: '住宅',
      id: 'Residensial'
    },
    commercial: {
      vi: 'Thương mại',
      en: 'Commercial',
      zh: '商业',
      id: 'Komersial'
    },
    industrial: {
      vi: 'Công nghiệp',
      en: 'Industrial',
      zh: '工业',
      id: 'Industri'
    }
  },
  locations: {
    'TP. Hồ Chí Minh': {
      en: 'Ho Chi Minh City',
      zh: '胡志明市',
      id: 'Kota Ho Chi Minh'
    },
    'Hà Nội': {
      en: 'Hanoi',
      zh: '河内',
      id: 'Hanoi'
    },
    'Đà Nẵng': {
      en: 'Da Nang',
      zh: '岘港',
      id: 'Da Nang'
    },
    'Cà Mau': {
      en: 'Ca Mau',
      zh: '金瓯',
      id: 'Ca Mau'
    },
    'Quận 7 TP.HCM': {
      en: 'District 7, HCMC',
      zh: '胡志明市第7郡',
      id: 'Distrik 7, HCMC'
    },
    'Bến Nghé': {
      en: 'Ben Nghe',
      zh: '滨艺',
      id: 'Ben Nghe'
    }
  },
  titleTemplates: {
    en: {
      prefix: 'Solar System for',
      kw: 'kW'
    },
    zh: {
      prefix: '',
      suffix: '太阳能系统',
      kw: '千瓦'
    },
    id: {
      prefix: 'Sistem Solar untuk',
      kw: 'kW'
    }
  }
}

// Translate project title
function translateTitle(viTitle, targetLang) {
  const templates = translations.titleTemplates[targetLang]
  
  // Extract capacity (e.g., "40kW")
  const capacityMatch = viTitle.match(/(\d+)kW/)
  const capacity = capacityMatch ? capacityMatch[1] : ''
  
  // Extract type
  let type = ''
  if (viTitle.includes('Hộ gia đình') || viTitle.includes('Nhà')) {
    type = targetLang === 'en' ? 'Residential' : targetLang === 'zh' ? '住宅' : 'Rumah Tinggal'
  } else if (viTitle.includes('Khách sạn')) {
    type = targetLang === 'en' ? 'Hotel' : targetLang === 'zh' ? '酒店' : 'Hotel'
  } else if (viTitle.includes('Văn phòng')) {
    type = targetLang === 'en' ? 'Office Building' : targetLang === 'zh' ? '办公楼' : 'Gedung Kantor'
  } else if (viTitle.includes('Khu nghỉ dưỡng')) {
    type = targetLang === 'en' ? 'Resort' : targetLang === 'zh' ? '度假村' : 'Resort'
  } else if (viTitle.includes('Nhà máy')) {
    type = targetLang === 'en' ? 'Factory' : targetLang === 'zh' ? '工厂' : 'Pabrik'
  } else if (viTitle.includes('Trạm xăng')) {
    type = targetLang === 'en' ? 'Gas Station' : targetLang === 'zh' ? '加油站' : 'SPBU'
  } else if (viTitle.includes('Căn hộ')) {
    type = targetLang === 'en' ? 'Apartment' : targetLang === 'zh' ? '公寓' : 'Apartemen'
  } else if (viTitle.includes('Siêu thị')) {
    type = targetLang === 'en' ? 'Minimart' : targetLang === 'zh' ? '超市' : 'Minimarket'
  } else if (viTitle.includes('Biệt thự')) {
    type = targetLang === 'en' ? 'Villa' : targetLang === 'zh' ? '别墅' : 'Villa'
  } else if (viTitle.includes('Nhà xưởng')) {
    type = targetLang === 'en' ? 'Workshop' : targetLang === 'zh' ? '车间' : 'Bengkel'
  } else if (viTitle.includes('Trường')) {
    type = targetLang === 'en' ? 'School' : targetLang === 'zh' ? '学校' : 'Sekolah'
  } else if (viTitle.includes('Homestay')) {
    type = targetLang === 'en' ? 'Homestay' : targetLang === 'zh' ? '民宿' : 'Homestay'
  }
  
  // Build title
  if (targetLang === 'en') {
    return capacity ? `${capacity}kW ${type} Solar System` : `${type} Solar System`
  } else if (targetLang === 'zh') {
    return capacity ? `${capacity}千瓦${type}太阳能系统` : `${type}太阳能系统`
  } else { // id
    return capacity ? `Sistem Solar ${type} ${capacity}kW` : `Sistem Solar ${type}`
  }
}

// Translate location
function translateLocation(viLocation, targetLang) {
  // Direct mapping
  if (translations.locations[viLocation]) {
    return translations.locations[viLocation][targetLang] || viLocation
  }
  
  // Partial mapping
  for (const [viKey, trans] of Object.entries(translations.locations)) {
    if (viLocation.includes(viKey)) {
      return viLocation.replace(viKey, trans[targetLang] || viKey)
    }
  }
  
  return viLocation // Fallback
}

// Translate description
function translateDescription(viDesc, targetLang) {
  if (!viDesc) return null
  
  const keywordMap = {
    en: {
      'Hệ thống': 'Solar system',
      'điện mặt trời': 'solar energy',
      'năng lượng mặt trời': 'solar energy',
      'công suất': 'capacity',
      'lắp đặt': 'installed',
      'hoàn thành': 'completed',
      'tiết kiệm': 'savings',
      'giảm': 'reduce',
      'chi phí điện': 'electricity costs',
      'thân thiện môi trường': 'eco-friendly'
    },
    zh: {
      'Hệ thống': '太阳能系统',
      'điện mặt trời': '太阳能',
      'năng lượng mặt trời': '太阳能',
      'công suất': '容量',
      'lắp đặt': '安装',
      'hoàn thành': '完成',
      'tiết kiệm': '节省',
      'giảm': '减少',
      'chi phí điện': '电费',
      'thân thiện môi trường': '环保'
    },
    id: {
      'Hệ thống': 'Sistem',
      'điện mặt trời': 'energi surya',
      'năng lượng mặt trời': 'energi surya',
      'công suất': 'kapasitas',
      'lắp đặt': 'dipasang',
      'hoàn thành': 'selesai',
      'tiết kiệm': 'hemat',
      'giảm': 'mengurangi',
      'chi phí điện': 'biaya listrik',
      'thân thiện môi trường': 'ramah lingkungan'
    }
  }
  
  let translated = viDesc
  const map = keywordMap[targetLang]
  
  for (const [vi, trans] of Object.entries(map)) {
    translated = translated.replace(new RegExp(vi, 'gi'), trans)
  }
  
  return translated
}

// Main migration function
async function migrateProjects() {
  try {
    console.log('🔍 Fetching Vietnamese projects...')
    
    // Fetch all Vietnamese projects
    const viProjects = await client.fetch(
      `*[_type == "project" && locale == "vi"] {
        _id,
        _type,
        title,
        slug,
        systemType,
        capacity,
        location,
        client,
        completionDate,
        investment,
        savings,
        paybackPeriod,
        shortDescription,
        fullDescription,
        challenges,
        solution,
        results,
        testimonial,
        mainImage,
        gallery,
        featured,
        roi,
        annualSavings,
        investmentCost
      }`
    )
    
    console.log(`✅ Found ${viProjects.length} Vietnamese projects`)
    
    const targetLocales = ['en', 'zh', 'id']
    let created = 0
    
    for (const locale of targetLocales) {
      console.log(`\n🌍 Creating ${locale.toUpperCase()} translations...`)
      
      for (const viProject of viProjects) {
        try {
          // Skip the "Test" project or already processed
          if (viProject.title === 'Test') {
            console.log(`⏭️  Skipping Test project`)
            continue
          }
          
          const translatedProject = {
            _type: 'project',
            locale,
            title: translateTitle(viProject.title, locale),
            slug: {
              _type: 'slug',
              current: `${viProject.slug.current}-${locale}`
            },
            systemType: viProject.systemType,
            capacity: viProject.capacity,
            location: viProject.location ? translateLocation(viProject.location, locale) : null,
            client: viProject.client,
            completionDate: viProject.completionDate,
            investment: viProject.investment,
            savings: viProject.savings,
            paybackPeriod: viProject.paybackPeriod,
            shortDescription: viProject.shortDescription ? translateDescription(viProject.shortDescription, locale) : null,
            fullDescription: viProject.fullDescription,
            challenges: viProject.challenges,
            solution: viProject.solution,
            results: viProject.results,
            testimonial: viProject.testimonial,
            mainImage: viProject.mainImage,
            gallery: viProject.gallery,
            featured: viProject.featured,
            roi: viProject.roi,
            annualSavings: viProject.annualSavings,
            investmentCost: viProject.investmentCost
          }
          
          const result = await client.create(translatedProject)
          created++
          console.log(`✅ Created: ${translatedProject.title} (${locale})`)
          
        } catch (error) {
          console.error(`❌ Failed to create project for ${locale}:`, error.message)
        }
      }
    }
    
    console.log(`\n🎉 Migration complete! Created ${created} new projects`)
    console.log(`\n📊 Summary:`)
    console.log(`   - Vietnamese projects: ${viProjects.length}`)
    console.log(`   - New projects created: ${created}`)
    console.log(`   - Total projects: ${viProjects.length + created}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
console.log('🚀 Starting multi-language project migration...\n')
migrateProjects()
  .then(() => {
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
