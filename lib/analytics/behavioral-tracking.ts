/**
 * BEHAVIORAL ANALYTICS TRACKER
 * 
 * Track user behavior to understand:
 * - Which pages users visit most
 * - Which sections get most engagement (dwell time)
 * - Geographic patterns (IP → location)
 * - Content recommendations based on behavior
 * 
 * Privacy: No PII stored, only anonymous analytics
 */

import { sql } from '@vercel/postgres';

// Types
export interface PageView {
  session_id: string;
  page_url: string;
  page_title: string;
  referrer: string | null;
  user_agent: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet';
  timestamp: Date;
}

export interface SectionEngagement {
  session_id: string;
  page_url: string;
  section_id: string; // e.g., 'hero', 'calculator', 'solutions'
  section_name: string;
  dwell_time_seconds: number;
  scroll_depth_percentage: number;
  timestamp: Date;
}

export interface ContentRecommendation {
  current_page: string;
  recommended_pages: string[];
  reason: string;
  confidence_score: number;
}

// Database Schema (PostgreSQL)
export const ANALYTICS_SCHEMA = `
-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_session (session_id),
  INDEX idx_page (page_url),
  INDEX idx_timestamp (timestamp),
  INDEX idx_location (country, city)
);

-- Section Engagement Table
CREATE TABLE IF NOT EXISTS section_engagement (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  section_id VARCHAR(100) NOT NULL,
  section_name VARCHAR(255),
  dwell_time_seconds INT DEFAULT 0,
  scroll_depth_percentage INT DEFAULT 0,
  interactions INT DEFAULT 0, -- clicks, hovers, form fills
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_session (session_id),
  INDEX idx_section (section_id),
  INDEX idx_page_section (page_url, section_id)
);

-- Popular Content View (Materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_content AS
SELECT 
  page_url,
  COUNT(*) as view_count,
  AVG(dwell_time_seconds) as avg_dwell_time,
  COUNT(DISTINCT session_id) as unique_visitors,
  DATE(timestamp) as date
FROM page_views pv
LEFT JOIN (
  SELECT session_id, page_url, SUM(dwell_time_seconds) as dwell_time_seconds
  FROM section_engagement
  GROUP BY session_id, page_url
) se ON pv.session_id = se.session_id AND pv.page_url = se.page_url
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page_url, DATE(timestamp)
ORDER BY view_count DESC;

-- Geographic Patterns View
CREATE MATERIALIZED VIEW IF NOT EXISTS geographic_patterns AS
SELECT 
  country,
  city,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_visitors,
  ARRAY_AGG(DISTINCT page_url ORDER BY page_url) as top_pages
FROM page_views
WHERE timestamp >= NOW() - INTERVAL '30 days'
  AND country IS NOT NULL
GROUP BY country, city
ORDER BY visit_count DESC;

-- Content Affinity (Co-occurrence matrix)
CREATE TABLE IF NOT EXISTS content_affinity (
  page_a VARCHAR(500) NOT NULL,
  page_b VARCHAR(500) NOT NULL,
  co_occurrence_count INT DEFAULT 0,
  affinity_score DECIMAL(5,4), -- 0.0 to 1.0
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (page_a, page_b),
  INDEX idx_affinity_score (affinity_score DESC)
);
`;

// API Functions

/**
 * Track page view
 */
export async function trackPageView(data: Omit<PageView, 'timestamp'>) {
  try {
    await sql`
      INSERT INTO page_views (
        session_id, page_url, page_title, referrer, user_agent,
        ip_address, country, city, device_type
      ) VALUES (
        ${data.session_id},
        ${data.page_url},
        ${data.page_title},
        ${data.referrer},
        ${data.user_agent},
        ${data.ip_address},
        ${data.country},
        ${data.city},
        ${data.device_type}
      )
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to track page view:', error);
    return { success: false, error };
  }
}

/**
 * Track section engagement
 */
export async function trackSectionEngagement(data: Omit<SectionEngagement, 'timestamp'>) {
  try {
    await sql`
      INSERT INTO section_engagement (
        session_id, page_url, section_id, section_name,
        dwell_time_seconds, scroll_depth_percentage
      ) VALUES (
        ${data.session_id},
        ${data.page_url},
        ${data.section_id},
        ${data.section_name},
        ${data.dwell_time_seconds},
        ${data.scroll_depth_percentage}
      )
      ON CONFLICT (session_id, page_url, section_id) 
      DO UPDATE SET
        dwell_time_seconds = section_engagement.dwell_time_seconds + EXCLUDED.dwell_time_seconds,
        scroll_depth_percentage = GREATEST(section_engagement.scroll_depth_percentage, EXCLUDED.scroll_depth_percentage)
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to track section engagement:', error);
    return { success: false, error };
  }
}

/**
 * Get popular content by location
 */
export async function getPopularContentByLocation(country?: string, city?: string) {
  try {
    let query;
    
    if (country && city) {
      query = sql`
        SELECT 
          page_url,
          COUNT(*) as view_count,
          AVG(dwell_time_seconds) as avg_dwell_time
        FROM page_views pv
        LEFT JOIN (
          SELECT session_id, page_url, SUM(dwell_time_seconds) as dwell_time_seconds
          FROM section_engagement
          GROUP BY session_id, page_url
        ) se ON pv.session_id = se.session_id AND pv.page_url = se.page_url
        WHERE pv.country = ${country} 
          AND pv.city = ${city}
          AND pv.timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY page_url
        ORDER BY view_count DESC
        LIMIT 10
      `;
    } else if (country) {
      query = sql`
        SELECT 
          page_url,
          COUNT(*) as view_count,
          AVG(dwell_time_seconds) as avg_dwell_time
        FROM page_views pv
        LEFT JOIN (
          SELECT session_id, page_url, SUM(dwell_time_seconds) as dwell_time_seconds
          FROM section_engagement
          GROUP BY session_id, page_url
        ) se ON pv.session_id = se.session_id AND pv.page_url = se.page_url
        WHERE pv.country = ${country}
          AND pv.timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY page_url
        ORDER BY view_count DESC
        LIMIT 10
      `;
    } else {
      query = sql`
        SELECT * FROM popular_content
        LIMIT 10
      `;
    }
    
    const result = await query;
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Failed to get popular content:', error);
    return { success: false, error };
  }
}

/**
 * Get content recommendations based on current page
 * Uses collaborative filtering (users who viewed X also viewed Y)
 */
export async function getContentRecommendations(
  currentPage: string,
  limit: number = 5
): Promise<ContentRecommendation> {
  try {
    // Find pages that were viewed in the same session as current page
    const result = await sql`
      WITH same_session_pages AS (
        SELECT 
          pv2.page_url,
          COUNT(*) as co_occurrence_count,
          COUNT(DISTINCT pv1.session_id) as session_count
        FROM page_views pv1
        JOIN page_views pv2 
          ON pv1.session_id = pv2.session_id 
          AND pv1.page_url != pv2.page_url
        WHERE pv1.page_url = ${currentPage}
          AND pv1.timestamp >= NOW() - INTERVAL '30 days'
          AND pv2.page_url != ${currentPage}
        GROUP BY pv2.page_url
      ),
      page_popularity AS (
        SELECT 
          page_url,
          COUNT(*) as total_views
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY page_url
      )
      SELECT 
        ssp.page_url,
        ssp.co_occurrence_count,
        ssp.session_count,
        pp.total_views,
        -- Affinity score: (co-occurrence / total_views) * session_count
        ROUND((ssp.co_occurrence_count::DECIMAL / NULLIF(pp.total_views, 0)) * ssp.session_count, 4) as affinity_score
      FROM same_session_pages ssp
      JOIN page_popularity pp ON ssp.page_url = pp.page_url
      ORDER BY affinity_score DESC
      LIMIT ${limit}
    `;
    
    const recommendedPages = result.rows.map((row: any) => row.page_url);
    const avgConfidence = result.rows.length > 0
      ? result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.affinity_score), 0) / result.rows.length
      : 0;
    
    return {
      current_page: currentPage,
      recommended_pages: recommendedPages,
      reason: 'collaborative_filtering',
      confidence_score: avgConfidence,
    };
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return {
      current_page: currentPage,
      recommended_pages: [],
      reason: 'error',
      confidence_score: 0,
    };
  }
}

/**
 * Get most engaged sections on a page
 */
export async function getMostEngagedSections(pageUrl: string) {
  try {
    const result = await sql`
      SELECT 
        section_id,
        section_name,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(dwell_time_seconds) as avg_dwell_time,
        AVG(scroll_depth_percentage) as avg_scroll_depth,
        SUM(interactions) as total_interactions
      FROM section_engagement
      WHERE page_url = ${pageUrl}
        AND timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY section_id, section_name
      ORDER BY avg_dwell_time DESC
      LIMIT 10
    `;
    
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Failed to get engaged sections:', error);
    return { success: false, error };
  }
}

/**
 * Update content affinity matrix (run daily via cron)
 */
export async function updateContentAffinity() {
  try {
    await sql`
      INSERT INTO content_affinity (page_a, page_b, co_occurrence_count, affinity_score)
      SELECT 
        pv1.page_url as page_a,
        pv2.page_url as page_b,
        COUNT(*) as co_occurrence_count,
        ROUND(
          COUNT(*)::DECIMAL / 
          (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE page_url = pv1.page_url),
          4
        ) as affinity_score
      FROM page_views pv1
      JOIN page_views pv2 
        ON pv1.session_id = pv2.session_id 
        AND pv1.page_url < pv2.page_url -- Avoid duplicates
      WHERE pv1.timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY pv1.page_url, pv2.page_url
      HAVING COUNT(*) >= 3 -- Minimum 3 co-occurrences
      ON CONFLICT (page_a, page_b) 
      DO UPDATE SET
        co_occurrence_count = EXCLUDED.co_occurrence_count,
        affinity_score = EXCLUDED.affinity_score,
        last_updated = NOW()
    `;
    
    // Refresh materialized views
    await sql`REFRESH MATERIALIZED VIEW popular_content`;
    await sql`REFRESH MATERIALIZED VIEW geographic_patterns`;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update content affinity:', error);
    return { success: false, error };
  }
}

/**
 * Get analytics dashboard summary
 */
export async function getAnalyticsSummary(days: number = 7) {
  try {
    const [pageViews, uniqueVisitors, topPages, topLocations] = await Promise.all([
      // Total page views
      sql`
        SELECT COUNT(*) as count
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
      `,
      
      // Unique visitors
      sql`
        SELECT COUNT(DISTINCT session_id) as count
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
      `,
      
      // Top 5 pages
      sql`
        SELECT 
          page_url,
          page_title,
          COUNT(*) as views,
          COUNT(DISTINCT session_id) as unique_visitors
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY page_url, page_title
        ORDER BY views DESC
        LIMIT 5
      `,
      
      // Top 5 locations
      sql`
        SELECT 
          country,
          city,
          COUNT(*) as visits
        FROM page_views
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
          AND country IS NOT NULL
        GROUP BY country, city
        ORDER BY visits DESC
        LIMIT 5
      `
    ]);
    
    return {
      success: true,
      data: {
        total_page_views: parseInt(pageViews.rows[0].count),
        unique_visitors: parseInt(uniqueVisitors.rows[0].count),
        top_pages: topPages.rows,
        top_locations: topLocations.rows,
      }
    };
  } catch (error) {
    console.error('Failed to get analytics summary:', error);
    return { success: false, error };
  }
}

// Export for cron jobs
export const cronJobs = {
  // Run daily at 2 AM
  updateContentAffinity: '0 2 * * *',
  
  // Run every hour to refresh materialized views
  refreshViews: '0 * * * *',
};
