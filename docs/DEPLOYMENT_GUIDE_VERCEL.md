# 🚀 Deployment Guide - Vercel

> **Target Platform:** Vercel  
> **Deployment Time:** ~10 minutes  
> **Difficulty:** Beginner-friendly

---

## 📋 Prerequisites

### Required Accounts
- [x] GitHub account with repository access
- [x] Vercel account (free tier OK for testing)
- [x] Database URL (PostgreSQL from Vercel/Supabase/Railway)
- [x] Domain (optional: goldenenergy.vn)

### Required Information
Gather these before starting:
```
✓ GitHub repo URL: https://github.com/Lamquanna/goldencard-website
✓ Database connection string
✓ NextAuth secret key
✓ Google Analytics ID
✓ API keys (Coze, Firebase)
```

---

## 🔐 Step 1: Prepare Environment Variables

### 1.1 Copy Local Environment

From your `.env.local`, prepare these variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="https://goldenenergy.vn"

# APIs
COZE_API_KEY="your-coze-key"
FIREBASE_PROJECT_ID="your-firebase-project"
FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional
REVALIDATE_SECRET="your-revalidate-secret"
```

### 1.2 Generate Secrets

**NextAuth Secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Revalidate Secret:**
```bash
# Any random string
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🏗️ Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose: `Lamquanna/goldencard-website`
5. Click **"Import"**

### 2.2 Configure Project

**Framework Detection:**
- Vercel auto-detects: ✅ Next.js

**Build Settings:**
```
Framework Preset:     Next.js
Build Command:        npm run build
Output Directory:     .next (automatic)
Install Command:      npm install
Development Command:  npm run dev
```

**Root Directory:**
```
./  (repository root)
```

**Node Version:**
```
20.x  (automatic)
```

### 2.3 Add Environment Variables

Click **"Environment Variables"** tab:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | postgresql://... | Production, Preview |
| `NEXTAUTH_SECRET` | (generated secret) | Production, Preview |
| `NEXTAUTH_URL` | https://goldenenergy.vn | Production only |
| `NEXTAUTH_URL` | https://preview-url.vercel.app | Preview only |
| `COZE_API_KEY` | (your key) | All |
| `FIREBASE_PROJECT_ID` | (your project) | All |
| `FIREBASE_CLIENT_EMAIL` | (service account) | All |
| `FIREBASE_PRIVATE_KEY` | (private key) | All |
| `NEXT_PUBLIC_GA_ID` | G-XXXXXXXXXX | Production, Preview |

**Important Notes:**
- `NEXTAUTH_URL` must match deployment URL
- Use different URLs for Production vs Preview
- `FIREBASE_PRIVATE_KEY` must include `\n` characters
- Preview env for testing before production

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for build
3. Watch build logs for errors

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (212/212)
✓ Finalizing page optimization

Build completed in 2m 14s
```

---

## 🌐 Step 3: Configure Custom Domain

### 3.1 Add Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `goldenenergy.vn`
4. Click **"Add"

### 3.2 Configure DNS (Domain Registrar)

**Option A: Using Vercel Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: Using CNAME Record**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Redirect Root to WWW:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### 3.3 SSL Certificate

- Vercel auto-provisions SSL (Let's Encrypt)
- Wait 5-10 minutes for propagation
- Check: https://goldenenergy.vn

---

## ✅ Step 4: Post-Deployment Verification

### 4.1 Core Functionality Checks

**Homepage:**
- [ ] https://goldenenergy.vn loads
- [ ] All 4 locales work (vi, en, zh, id)
- [ ] Images load correctly
- [ ] Navigation works
- [ ] No console errors

**Content Pages:**
- [ ] Solutions: `/giai-phap/dien-mat-troi-ho-gia-dinh`
- [ ] Products: `/san-pham/tam-pin`
- [ ] Blog: `/bai-viet`
- [ ] Projects: `/du-an`
- [ ] FAQ: `/faq`
- [ ] Contact: `/lien-he`

**Dynamic Routes:**
- [ ] Blog article: `/bai-viet/huong-dan-chon-tam-pin`
- [ ] Project: `/du-an/khach-san-abc-tphcm`
- [ ] Product: `/san-pham/tam-pin/longi-550w`

**Forms:**
- [ ] Contact form submits
- [ ] Solar calculator works
- [ ] Newsletter signup works
- [ ] No validation errors

### 4.2 SEO Verification

**Sitemap:**
```bash
curl https://goldenenergy.vn/sitemap.xml
# Should return 221 URLs
```

**Robots.txt:**
```bash
curl https://goldenenergy.vn/robots.txt
# Should show Allow/Disallow rules
```

**Schema Validation:**
1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Test homepage
3. Should detect: Organization schema
4. Test blog article
5. Should detect: Article + BreadcrumbList schemas

**Meta Tags:**
- [ ] Open Graph tags present (Facebook debugger)
- [ ] Twitter Card tags present
- [ ] Canonical URLs correct
- [ ] Hreflang tags for all locales

### 4.3 Performance Testing

**Lighthouse Audit:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://goldenenergy.vn --view

# Or use Chrome DevTools → Lighthouse tab
```

**Target Scores:**
- Performance: 90+ ✅
- Accessibility: 95+ ✅
- Best Practices: 95+ ✅
- SEO: 100 ✅

**Core Web Vitals:**
- LCP: < 2.5s ✅
- FID: < 100ms ✅
- CLS: < 0.1 ✅

### 4.4 Analytics Verification

**Google Analytics:**
1. Go to [GA4 Dashboard](https://analytics.google.com)
2. Check real-time report
3. Visit website in incognito
4. Should see 1 active user

**Vercel Analytics:**
1. Vercel Dashboard → Your Project → **Analytics**
2. Check real-time visitors
3. Monitor page views

### 4.5 Mobile Testing

**Responsive Design:**
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test tablet view
- [ ] Navigation menu works
- [ ] Forms usable
- [ ] Images scale correctly

**Mobile Speed:**
- Use [PageSpeed Insights](https://pagespeed.web.dev/)
- Test: https://goldenenergy.vn
- Mobile score: 90+ ✅

---

## 🔍 Step 5: Google Search Console Setup

### 5.1 Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Select **"URL prefix"**
4. Enter: `https://goldenenergy.vn`

### 5.2 Verify Ownership

**Method 1: HTML File (Recommended)**
1. Download verification file
2. Upload to `public/` folder
3. Deploy to Vercel
4. Click "Verify"

**Method 2: DNS TXT Record**
1. Copy TXT record value
2. Add to domain DNS
3. Wait 5-10 minutes
4. Click "Verify"

**Method 3: Vercel Integration**
1. In GSC, select "Domain provider"
2. Choose "Other"
3. Copy meta tag
4. Add to `app/layout.tsx` <head>

### 5.3 Submit Sitemap

1. In GSC → **Sitemaps**
2. Enter: `sitemap.xml`
3. Click **"Submit"**
4. Wait 24-48 hours for processing

**Expected Result:**
```
Status: Success
URLs discovered: 221
URLs submitted: 221
```

### 5.4 Request Indexing

**Priority Pages (Index First):**
1. Homepage: `/`
2. Solutions hub: `/giai-phap`
3. Blog hub: `/bai-viet`
4. Projects hub: `/du-an`
5. Contact: `/lien-he`

**How to Request:**
1. GSC → URL Inspection
2. Enter URL
3. Click "Request Indexing"
4. Repeat for all priority pages

---

## 🐛 Step 6: Troubleshooting

### Issue 1: Build Fails

**Error:** `Type error: ...`
```bash
# Solution: Check TypeScript locally
npm run build

# Fix all errors, then redeploy
```

**Error:** `Module not found: Can't resolve '...'`
```bash
# Solution: Install missing dependency
npm install <package-name>
git commit -am "Add missing dependency"
git push
```

### Issue 2: Environment Variables Not Working

**Symptom:** Database connection fails, auth broken

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Check all vars are set
3. Click **"Redeploy"** button
4. Select "Use existing build cache: No"

**Common Mistakes:**
- Forgot to add var for "Preview" environment
- `NEXTAUTH_URL` doesn't match actual URL
- `FIREBASE_PRIVATE_KEY` missing `\n` characters

### Issue 3: Domain Not Resolving

**Symptom:** Domain shows "Not Found" or times out

**Solution:**
1. Check DNS propagation: https://dnschecker.org
2. Wait up to 48 hours for propagation
3. Clear browser cache (Ctrl+Shift+R)
4. Try incognito mode

**Check Nameservers:**
```bash
# Windows
nslookup -type=NS goldenenergy.vn

# macOS/Linux
dig NS goldenenergy.vn
```

### Issue 4: Images Not Loading

**Symptom:** Broken image icons, 404 errors

**Solution:**
1. Check images are in `public/` folder
2. Verify paths start with `/` (e.g., `/images/logo.png`)
3. Use Next.js `<Image>` component
4. Check Vercel Logs for 404s

### Issue 5: Analytics Not Tracking

**Symptom:** No data in GA4 dashboard

**Solution:**
1. Check `NEXT_PUBLIC_GA_ID` is set
2. Verify ID format: `G-XXXXXXXXXX`
3. Check browser console for gtag errors
4. Wait 24 hours for initial data
5. Use Real-Time report for instant feedback

### Issue 6: Slow Build Times

**Symptom:** Build takes > 10 minutes

**Solution:**
1. Check bundle size: `npm run build`
2. Remove unused dependencies: `npm prune`
3. Optimize images (compress, WebP)
4. Use dynamic imports for heavy components
5. Enable Turbopack in next.config.ts

---

## 🔄 Step 7: Continuous Deployment

### 7.1 Auto-Deploy on Push

Vercel automatically deploys on:
- **Production:** Push to `main` branch
- **Preview:** Push to any branch or PR

**Workflow:**
```bash
# 1. Make changes locally
git checkout -b feature/new-content

# 2. Commit changes
git add .
git commit -m "feat: Add new blog article"

# 3. Push to GitHub
git push origin feature/new-content

# 4. Vercel creates preview deployment
# Preview URL: https://goldencard-website-abc123.vercel.app

# 5. Test preview URL
# 6. Merge PR to main
# 7. Production deploys automatically
```

### 7.2 Rollback to Previous Version

**If deployment breaks:**
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click **"⋮"** menu → **"Promote to Production"**
4. Confirm rollback

### 7.3 Preview Deployments

**For every PR:**
- Vercel creates preview URL
- Test changes before merging
- Share with stakeholders

**Preview URL Format:**
```
https://goldencard-website-<git-branch>-<team>.vercel.app
```

---

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring

**Vercel Analytics:**
- Real-time visitors
- Page views
- Top pages
- Geographic distribution

**Google Analytics 4:**
- User acquisition
- User behavior flow
- Conversion tracking
- Custom events

**Sentry (Optional):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 8.2 Weekly Checks

- [ ] Check GSC for indexing status
- [ ] Review Vercel Analytics
- [ ] Check for broken links
- [ ] Monitor Core Web Vitals
- [ ] Review error logs

### 8.3 Monthly Tasks

- [ ] Update dependencies: `npm outdated`
- [ ] Security audit: `npm audit fix`
- [ ] Review SEO rankings
- [ ] Analyze traffic trends
- [ ] Backup database

### 8.4 Quarterly Reviews

- [ ] Lighthouse audit (all pages)
- [ ] Content audit (update old articles)
- [ ] Competitor analysis
- [ ] A/B testing results
- [ ] ROI assessment

---

## 🎯 Success Metrics

### Week 1 Targets
- [ ] All pages indexed in GSC
- [ ] Lighthouse scores > 90
- [ ] Zero build errors
- [ ] Forms working
- [ ] Analytics tracking

### Month 1 Targets
- [ ] 100+ indexed pages
- [ ] 1,000+ organic visits
- [ ] 50+ calculator uses
- [ ] 10+ contact form submissions
- [ ] 5+ keywords ranking

### Month 3 Targets
- [ ] 200+ indexed pages
- [ ] 5,000+ organic visits
- [ ] 20+ top 10 keywords
- [ ] 100+ leads/month
- [ ] 20+ rich results

---

## 🆘 Support & Resources

### Documentation
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Schema.org: https://schema.org
- GSC Help: https://support.google.com/webmasters

### Community
- Vercel Discord: https://vercel.com/discord
- Next.js GitHub: https://github.com/vercel/next.js
- Stack Overflow: Tag `next.js` + `vercel`

### Emergency Contact
| Issue | Contact | Response Time |
|-------|---------|---------------|
| Deployment failure | TBD | 1 hour |
| Domain/DNS issues | TBD | 4 hours |
| Database problems | TBD | 1 hour |
| Security incident | TBD | Immediate |

---

## 📝 Deployment Checklist

### Pre-Deployment
- [x] All environment variables ready
- [x] Database connection tested
- [x] Local build successful (`npm run build`)
- [x] All tests passing
- [x] Content reviewed and approved
- [x] Images optimized
- [x] Analytics configured

### During Deployment
- [ ] Connect GitHub repository
- [ ] Configure project settings
- [ ] Add environment variables
- [ ] Verify build settings
- [ ] Click "Deploy"
- [ ] Monitor build logs
- [ ] Wait for successful deployment

### Post-Deployment
- [ ] Test all pages
- [ ] Verify forms work
- [ ] Check mobile responsive
- [ ] Run Lighthouse audit
- [ ] Submit sitemap to GSC
- [ ] Request indexing (priority pages)
- [ ] Verify analytics tracking
- [ ] Test all locales (4 languages)
- [ ] Check console for errors
- [ ] Monitor real-time analytics

### Domain Setup
- [ ] Add custom domain to Vercel
- [ ] Configure DNS records
- [ ] Wait for SSL provisioning
- [ ] Test HTTPS
- [ ] Verify www redirect

### Ongoing Maintenance
- [ ] Set up monitoring alerts
- [ ] Schedule weekly checks
- [ ] Plan content calendar
- [ ] Review analytics weekly
- [ ] Update dependencies monthly

---

## 🎉 Deployment Complete!

**Your website is now live at:**
🌐 **https://goldenenergy.vn**

**Next steps:**
1. ✅ Submit sitemap to Google Search Console
2. ✅ Request indexing for priority pages
3. ✅ Monitor analytics for 7 days
4. ✅ Create content calendar
5. ✅ Start backlink acquisition
6. ✅ Launch social media campaigns

**Expected Timeline:**
- **Week 1:** Initial indexing begins
- **Week 2-3:** First rankings appear
- **Month 1:** Steady organic traffic
- **Month 3:** Target metrics achieved

**Good luck! 🚀**

---

**Last Updated:** 2026-01-19  
**Version:** 1.0  
**Maintainer:** Development Team
