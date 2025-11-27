#!/usr/bin/env node

/**
 * AI Avatar Generator for Team Members
 * 
 * This script generates professional headshots for team members using AI.
 * Uses OpenAI DALL-E 3 API to create realistic corporate portraits.
 * 
 * Usage:
 *   node scripts/generate-avatars.js
 * 
 * Requirements:
 *   - OPENAI_API_KEY environment variable
 *   - Node.js 18+ with fetch support
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Team member configurations
const teamMembers = [
  {
    id: 'ceo',
    name: 'Nguyễn Văn Minh',
    role: 'CEO & Founder',
    age: '45-50',
    gender: 'male',
    attire: 'dark navy suit with golden tie',
    expression: 'confident, visionary leader',
    filename: 'ceo-nguyen-van-minh.webp'
  },
  {
    id: 'cto',
    name: 'Trần Hoàng Nam',
    role: 'Chief Technology Officer',
    age: '40-45',
    gender: 'male',
    attire: 'business casual, light blue shirt',
    expression: 'intelligent, tech expert',
    filename: 'cto-tran-hoang-nam.webp'
  },
  {
    id: 'engineer',
    name: 'Lê Quang Hải',
    role: 'Senior Solar Engineer',
    age: '35-40',
    gender: 'male',
    attire: 'technical polo shirt with company logo',
    expression: 'focused, professional engineer',
    filename: 'engineer-le-quang-hai.webp'
  },
  {
    id: 'storage',
    name: 'Phạm Thị Lan',
    role: 'Energy Storage Specialist',
    age: '30-35',
    gender: 'female',
    attire: 'smart casual blouse, professional',
    expression: 'confident, technical expert',
    filename: 'storage-pham-thi-lan.webp'
  },
  {
    id: 'electronics',
    name: 'Vũ Đức Anh',
    role: 'Power Electronics Engineer',
    age: '28-33',
    gender: 'male',
    attire: 'technical shirt, modern style',
    expression: 'innovative, young professional',
    filename: 'electronics-vu-duc-anh.webp'
  },
  {
    id: 'support',
    name: 'Đỗ Thị Hương',
    role: 'Technical Support Manager',
    age: '32-38',
    gender: 'female',
    attire: 'professional attire, friendly',
    expression: 'approachable, service-oriented',
    filename: 'support-do-thi-huong.webp'
  }
];

// Generate prompt for DALL-E 3
function generatePrompt(member) {
  return `Professional corporate headshot portrait of a Vietnamese ${member.age} year old ${member.gender} ${member.role}, 
wearing ${member.attire}, ${member.expression}, 
studio lighting with subtle warm golden accent (#D4AF37 color tone), 
neutral background with subtle gradient, 
high resolution 4K, sharp focus, professional photography, 
clean modern aesthetic, similar to Huawei Solar executive photography style, 
confident demeanor, looking at camera, 
corporate professional portrait, business headshot`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate avatar using OpenAI DALL-E 3
async function generateAvatar(member) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('\nPlease set your OpenAI API key:');
    console.log('  $env:OPENAI_API_KEY="sk-..."');
    console.log('  npm run generate:avatars\n');
    process.exit(1);
  }

  const prompt = generatePrompt(member);
  
  console.log(`\n🎨 Generating avatar for ${member.name} (${member.role})...`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download image
    const outputDir = path.join(__dirname, '..', 'public', 'images', 'team');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, member.filename);
    await downloadImage(imageUrl, filepath);

    console.log(`✅ Saved: ${member.filename}`);
    return filepath;

  } catch (error) {
    console.error(`❌ Error generating ${member.name}: ${error.message}`);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting AI Avatar Generation for Golden Energy Team\n');
  console.log('═══════════════════════════════════════════════════════════');

  const results = [];

  for (const member of teamMembers) {
    try {
      const filepath = await generateAvatar(member);
      results.push({ member: member.name, success: true, filepath });
      
      // Rate limiting: wait 2 seconds between requests
      if (teamMembers.indexOf(member) < teamMembers.length - 1) {
        console.log('⏳ Waiting 2 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.push({ member: member.name, success: false, error: error.message });
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Generation Summary:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${teamMembers.length}`);
  successful.forEach(r => {
    console.log(`   • ${r.member}: ${path.basename(r.filepath)}`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${teamMembers.length}`);
    failed.forEach(r => {
      console.log(`   • ${r.member}: ${r.error}`);
    });
  }

  console.log('\n💰 Estimated Cost:');
  console.log(`   DALL-E 3 HD (1024x1024): $0.080 × ${successful.length} = $${(0.08 * successful.length).toFixed(2)}`);

  console.log('\n📁 Images saved to: public/images/team/');
  console.log('\n🎉 Avatar generation complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated images in public/images/team/');
  console.log('2. Re-run for any failed generations');
  console.log('3. Update lib/team-data.ts with new avatar paths');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
