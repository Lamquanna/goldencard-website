/**
 * Webhook endpoint for Sanity to trigger revalidation
 * https://www.sanity.io/docs/webhooks
 * 
 * Setup in Sanity Studio:
 * 1. Go to Manage > API > Webhooks
 * 2. Create new webhook
 * 3. URL: https://goldenenergy.vn/api/revalidate
 * 4. Trigger on: Create, Update, Delete
 * 5. Dataset: production
 * 6. Add secret token (same as SANITY_REVALIDATE_SECRET below)
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

const SANITY_REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('sanity-webhook-signature');
    
    if (!SANITY_REVALIDATE_SECRET) {
      console.error('⚠️ SANITY_REVALIDATE_SECRET not configured');
      return NextResponse.json(
        { message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Parse webhook body
    const body = await parseBody(
      await request.text(),
      signature,
      SANITY_REVALIDATE_SECRET
    );

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const { _type, slug } = body;

    console.log('🔄 Revalidation triggered:', { _type, slug: slug?.current });

    // Revalidate based on document type
    switch (_type) {
      case 'product':
        // Revalidate products page
        revalidatePath('/[locale]/san-pham', 'page');
        revalidateTag('products');
        
        // Revalidate specific product page if slug exists
        if (slug?.current) {
          revalidatePath(`/[locale]/san-pham/${slug.current}`, 'page');
        }
        
        console.log('✅ Revalidated product pages');
        break;

      case 'project':
        // Revalidate projects page
        revalidatePath('/[locale]/du-an', 'page');
        revalidateTag('projects');
        
        // Revalidate specific project page if slug exists
        if (slug?.current) {
          revalidatePath(`/[locale]/du-an/${slug.current}`, 'page');
        }
        
        console.log('✅ Revalidated project pages');
        break;

      case 'siteSettings':
        // Revalidate all pages when site settings change
        revalidatePath('/', 'layout');
        console.log('✅ Revalidated all pages (site settings changed)');
        break;

      default:
        console.log(`⚠️ Unknown document type: ${_type}`);
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      _type,
      slug: slug?.current,
    });
  } catch (error: any) {
    console.error('❌ Revalidation error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
