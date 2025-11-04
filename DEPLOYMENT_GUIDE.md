# Vercel Deployment Guide - AI Kids Story Generator

This guide will help you deploy the AI Kids Story Generator to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A MySQL database (recommended providers):
   - **PlanetScale** (Free tier available, MySQL compatible, serverless)
   - **Railway** (MySQL hosting)
   - **Supabase** (PostgreSQL - would require schema changes)
   - **AWS RDS** or **Google Cloud SQL** (for production)

## Step 1: Set Up Your Database

### Option A: PlanetScale (Recommended)

1. Sign up at https://planetscale.com
2. Create a new database
3. Get your connection string from the database dashboard
4. The connection string format: `mysql://user:password@host/database?sslaccept=strict`

### Option B: Railway

1. Sign up at https://railway.app
2. Create a new project and add MySQL
3. Copy the DATABASE_URL from the MySQL service

## Step 2: Prepare Your Repository

1. Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Make sure `.env*` files are in `.gitignore` (already configured)

## Step 3: Deploy to Vercel

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel
```

### Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Next.js configuration
4. Click "Deploy"

## Step 4: Configure Environment Variables

In your Vercel project dashboard (Settings > Environment Variables), add:

### Required Variables

```env
# Database
DATABASE_URL=your_production_mysql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# HuggingFace (for image generation)
HUGGING_FACE_API_KEY=your_huggingface_api_key

# API Key Encryption (Generate a 32-character random string)
ENCRYPTION_KEY=your_32_character_encryption_key

# Optional
NEXT_PUBLIC_ID=your_app_identifier
```

### Important Notes:

- Never use development/test API keys in production
- Generate a new ENCRYPTION_KEY for production (must be 32 characters)
- Use production Clerk keys (not test keys)
- Ensure DATABASE_URL points to your production database

## Step 5: Set Up Database Schema

After deploying, you need to initialize your database:

### Option 1: Using Vercel CLI

```bash
# Set environment variables locally for migration
export DATABASE_URL="your_production_database_url"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Option 2: Using Prisma Studio

```bash
# Push schema to database (for initial setup)
npx prisma db push
```

### Option 3: Manual SQL Migration

If you have the SQL migration file, you can run it directly on your database:

```bash
# Connect to your database and run
mysql -h your_host -u your_user -p your_database < prisma/migrations/manual_add_api_keys_and_usage_tracking.sql
```

## Step 6: Configure Build Settings (Usually Auto-Detected)

Vercel should auto-detect these, but verify in project settings:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Step 7: Set Up Production Domain

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain (optional)
3. Configure DNS records as instructed by Vercel

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] All environment variables configured
- [ ] Clerk authentication working
- [ ] Story generation working (Gemini API)
- [ ] Image generation working (HuggingFace/Cloudinary)
- [ ] API key encryption working
- [ ] User registration and login working
- [ ] Database connections stable

## Troubleshooting

### Prisma Client Issues

If you see "Prisma Client not generated" errors:

```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

Then redeploy.

### Database Connection Issues

- Ensure DATABASE_URL is correct
- Check if your database allows connections from Vercel's IP ranges
- For PlanetScale, ensure SSL is enabled in connection string

### Build Failures

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Monitoring and Maintenance

1. Monitor usage in Vercel dashboard
2. Check database performance and connections
3. Monitor API usage (Clerk, Gemini, Cloudinary)
4. Set up error tracking (consider Sentry)
5. Regular database backups

## Security Recommendations

1. Enable Vercel's Web Application Firewall (WAF)
2. Use Vercel's environment variable encryption
3. Regularly rotate API keys
4. Monitor suspicious activity
5. Keep dependencies updated
6. Use Vercel's preview deployments for testing

## Cost Considerations

- **Vercel**: Free tier available, Pro for $20/month
- **PlanetScale**: Free tier for hobby projects
- **Cloudinary**: Free tier available
- **Clerk**: Free tier for development
- Monitor API usage to avoid unexpected charges

## Useful Commands

```bash
# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Redeploy
vercel --prod
```

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Clerk Docs: https://clerk.com/docs

---

Generated for AI Kids Story Generator deployment
