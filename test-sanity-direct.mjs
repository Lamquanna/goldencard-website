// Test Sanity Connection Direct
// Run: node test-sanity-direct.mjs

const projectId = 'u5ue9cmp';
const dataset = 'production';
const apiVersion = '2024-01-01';
const token = 'skidVYzsmQ3eUxfhTeCWZZMsKyllpLxFfVVoVkHY1EPvTv05yonNPYKYDKq8LlbMQV0an4V6XFZRcyCBCIab28gZ9XZBrqKxnqn7YKGz1YwcmzykqEutUnqnCU1GkT9LE3OstGGsFMGkSVlxJODpYWmNyvfjUsTcyCYs6LnAYgYIRCHzk427';

const query = `*[_type == "project" && locale == "vi"] | order(completionDate desc) [0...5] {
  _id,
  title,
  slug,
  locale,
  systemType,
  capacity,
  location,
  "imageUrl": mainImage.asset->url,
  featured
}`;

console.log('🧪 Testing Sanity API...\n');

const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  console.log('✅ SUCCESS!');
  console.log(`Found ${data.result.length} projects with locale "vi"\n`);
  
  data.result.forEach((project, index) => {
    console.log(`${index + 1}. ${project.title}`);
    console.log(`   - Capacity: ${project.capacity}kW`);
    console.log(`   - Slug: ${typeof project.slug === 'string' ? project.slug : project.slug?.current}`);
    console.log(`   - Has Image: ${project.imageUrl ? 'YES' : 'NO'}`);
    console.log('');
  });

  console.log('\n📋 Full Response:');
  console.log(JSON.stringify(data.result, null, 2));

} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error(error);
}
