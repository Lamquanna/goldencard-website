/**
 * Google Indexing API - Automatic URL Submission
 * 
 * Submit new/updated URLs to Google Search Console for faster indexing
 * Requires Google Cloud service account with Indexing API enabled
 * 
 * Setup:
 * 1. Create service account: https://console.cloud.google.com/iam-admin/serviceaccounts
 * 2. Enable Google Indexing API
 * 3. Add service account email to Google Search Console as owner
 * 4. Download JSON key file
 * 5. Set GOOGLE_APPLICATION_CREDENTIALS env var
 * 
 * Usage:
 *   npm run index-urls
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://goldenenergy.vn';

// Rate limit: 200 requests per minute
const RATE_LIMIT_MS = 300; // 300ms between requests = 200/min

interface IndexingResult {
  url: string;
  status: 'success' | 'error';
  message: string;
}

/**
 * Initialize Google Indexing API client
 */
function getIndexingClient() {
  try {
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!keyFile) {
      throw new Error(
        'GOOGLE_APPLICATION_CREDENTIALS not set. Please set it to path of service account JSON key.'
      );
    }

    const keyPath = resolve(keyFile);
    const key = JSON.parse(readFileSync(keyPath, 'utf8'));

    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );

    return google.indexing({ version: 'v3', auth: jwtClient });
  } catch (error) {
    console.error('❌ Failed to initialize Indexing API client:', error);
    throw error;
  }
}

/**
 * Submit single URL to Google for indexing
 */
async function submitUrl(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    const indexing = getIndexingClient();

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    return {
      url,
      status: 'success',
      message: `Status ${response.status}: ${response.statusText}`,
    };
  } catch (error: any) {
    return {
      url,
      status: 'error',
      message: error.message || 'Unknown error',
    };
  }
}

/**
 * Submit multiple URLs with rate limiting
 */
async function submitBatch(urls: string[]): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  console.log(`\n📤 Submitting ${urls.length} URLs to Google Indexing API...\n`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    console.log(`[${i + 1}/${urls.length}] ${url}`);
    
    const result = await submitUrl(url);
    results.push(result);

    if (result.status === 'success') {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.log(`  ❌ ${result.message}`);
    }

    // Rate limiting (except last URL)
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }

  return results;
}

/**
 * Get metadata about URL status
 */
async function getUrlStatus(url: string): Promise<any> {
  try {
    const indexing = getIndexingClient();

    const response = await indexing.urlNotifications.getMetadata({ url });

    return response.data;
  } catch (error: any) {
    console.error(`❌ Failed to get status for ${url}:`, error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  // Priority URLs for immediate indexing
  const priorityUrls = [
    `${SITE_URL}/vi`,
    `${SITE_URL}/en`,
    `${SITE_URL}/zh`,
    `${SITE_URL}/id`,
    `${SITE_URL}/vi/giai-phap/dien-mat-troi-ho-gia-dinh`,
    `${SITE_URL}/vi/giai-phap/dien-mat-troi-thuong-mai`,
    `${SITE_URL}/vi/giai-phap/dien-mat-troi-cong-nghiep`,
    `${SITE_URL}/vi/san-pham/tam-pin-mat-troi`,
    `${SITE_URL}/vi/san-pham/bien-tan`,
    `${SITE_URL}/vi/san-pham/pin-luu-tru`,
    `${SITE_URL}/vi/lien-he`,
  ];

  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Google Indexing API - URL Submission Tool           ║
║  Golden Energy Vietnam                                ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    // Submit batch
    const results = await submitBatch(priorityUrls);

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`
╔═══════════════════════════════════════════════════════╗
║  SUMMARY                                              ║
╠═══════════════════════════════════════════════════════╣
║  Total URLs:        ${results.length.toString().padStart(3)}                              ║
║  Successful:        ${successCount.toString().padStart(3)}                              ║
║  Errors:            ${errorCount.toString().padStart(3)}                              ║
╚═══════════════════════════════════════════════════════╝
    `);

    if (errorCount > 0) {
      console.log('\n❌ Failed URLs:\n');
      results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`  - ${r.url}: ${r.message}`));
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { submitUrl, submitBatch, getUrlStatus };
