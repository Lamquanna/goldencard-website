const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop';
const OUTPUT_DIR = path.join(__dirname, '../public/images/optimized');
const TEMP_PATH = path.join(__dirname, '../temp-hero.jpg');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📥 Downloading hero image from Unsplash...');

// Download image
const file = fs.createWriteStream(TEMP_PATH);
https.get(HERO_IMAGE_URL, (response) => {
  response.pipe(file);
  
  file.on('finish', async () => {
    file.close();
    console.log('✅ Download complete!');
    
    try {
      console.log('\n🔧 Optimizing image...');
      
      // Get original size
      const originalStats = fs.statSync(TEMP_PATH);
      const originalSizeKB = (originalStats.size / 1024).toFixed(2);
      console.log(`   Original size: ${originalSizeKB} KB`);
      
      // Generate WebP version (best compression)
      await sharp(TEMP_PATH)
        .resize(2560, 1440, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85, effort: 6 })
        .toFile(path.join(OUTPUT_DIR, 'hero-banner.webp'));
      
      const webpStats = fs.statSync(path.join(OUTPUT_DIR, 'hero-banner.webp'));
      const webpSizeKB = (webpStats.size / 1024).toFixed(2);
      const webpReduction = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);
      console.log(`   ✅ WebP: ${webpSizeKB} KB (${webpReduction}% reduction)`);
      
      // Generate AVIF version (even better compression for modern browsers)
      await sharp(TEMP_PATH)
        .resize(2560, 1440, {
          fit: 'cover',
          position: 'center'
        })
        .avif({ quality: 75, effort: 6 })
        .toFile(path.join(OUTPUT_DIR, 'hero-banner.avif'));
      
      const avifStats = fs.statSync(path.join(OUTPUT_DIR, 'hero-banner.avif'));
      const avifSizeKB = (avifStats.size / 1024).toFixed(2);
      const avifReduction = (((originalStats.size - avifStats.size) / originalStats.size) * 100).toFixed(1);
      console.log(`   ✅ AVIF: ${avifSizeKB} KB (${avifReduction}% reduction)`);
      
      // Generate responsive sizes
      const sizes = [
        { width: 640, name: 'hero-banner-640' },
        { width: 750, name: 'hero-banner-750' },
        { width: 1080, name: 'hero-banner-1080' },
        { width: 1920, name: 'hero-banner-1920' }
      ];
      
      console.log('\n📐 Generating responsive sizes...');
      for (const size of sizes) {
        await sharp(TEMP_PATH)
          .resize(size.width, null, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(OUTPUT_DIR, `${size.name}.webp`));
        
        const stats = fs.statSync(path.join(OUTPUT_DIR, `${size.name}.webp`));
        console.log(`   ✅ ${size.width}w: ${(stats.size / 1024).toFixed(2)} KB`);
      }
      
      // Clean up temp file
      fs.unlinkSync(TEMP_PATH);
      
      console.log('\n🎉 Optimization complete!');
      console.log(`\n📊 Summary:`);
      console.log(`   Original: ${originalSizeKB} KB`);
      console.log(`   WebP: ${webpSizeKB} KB (${webpReduction}% smaller)`);
      console.log(`   AVIF: ${avifSizeKB} KB (${avifReduction}% smaller)`);
      console.log(`\n✨ Files saved to: ${OUTPUT_DIR}`);
      
    } catch (error) {
      console.error('❌ Error optimizing image:', error);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  fs.unlink(TEMP_PATH, () => {});
  console.error('❌ Error downloading image:', err);
  process.exit(1);
});
