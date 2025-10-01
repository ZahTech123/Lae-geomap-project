# Vercel Deployment Guide

This guide will help you deploy your Lae GeoMap project to Vercel with proper environment variable configuration.

## Prerequisites

- GitHub account with your project repository
- Vercel account (sign up at https://vercel.com)
- Supabase account and project
- Mapbox account and access token

## Step 1: Prepare Your Local Environment

1. Ensure your `.env` file is NOT committed to GitHub (it should be in `.gitignore`)
2. Your environment variables should be in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   ```

3. Test locally to ensure everything works:
   ```bash
   npm install
   npm run dev
   ```

## Step 2: Push Your Code to GitHub

```bash
git add .
git commit -m "Configure environment variables for deployment"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `Lae-geomap-project` repository

2. **Configure Environment Variables**
   - In the project configuration page, scroll to "Environment Variables"
   - Add the following variables:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://eevwiajgxlogjfhinzob.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key) |
   | `VITE_MAPBOX_ACCESS_TOKEN` | `pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9...` (your full token) |

   **Important:** Make sure to select all environments (Production, Preview, and Development) for each variable.

3. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Vercel will provide a URL like `https://your-project.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# When prompted, add environment variables or configure them in the dashboard
```

## Step 4: Configure Supabase for Production

1. **Add Vercel Domain to Supabase**
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" → "URL Configuration"
   - Add your Vercel URL to "Site URL": `https://your-project.vercel.app`
   - Add to "Redirect URLs": `https://your-project.vercel.app/**`

2. **Check Row Level Security (RLS) Policies**
   - Ensure your RLS policies allow public access where needed
   - Navigate to "Authentication" → "Policies"
   - Review policies for `properties`, `land_details`, and other tables

## Step 5: Verify Deployment

1. **Check Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify all three variables are present and have correct values
   - If you make changes, redeploy: Deployments → ⋯ → Redeploy

2. **Test Your Application**
   - Visit your Vercel URL
   - Open browser console (F12)
   - Check for any errors
   - Verify data loads correctly on the map

3. **Common Issues to Check**
   - 404 errors: Check if Supabase URL is correct
   - 403 errors: Check RLS policies
   - Map not loading: Check Mapbox token
   - No data showing: Check Supabase connection and CORS settings

## Troubleshooting

### Data Not Showing on Vercel (but works locally)

1. **Check Environment Variables**
   ```
   In Vercel Dashboard:
   Settings → Environment Variables → Verify all are set correctly
   ```

2. **Check Browser Console**
   - Open your deployed site
   - Press F12 to open DevTools
   - Check Console tab for errors
   - Common errors:
     - "Missing Supabase environment variables" → Variables not set in Vercel
     - "Failed to fetch" → Check Supabase URL and CORS
     - "401 Unauthorized" → Check Supabase anon key

3. **Check Supabase Settings**
   - **API Settings**: Ensure "Enable database webhooks" is ON
   - **CORS**: Add your Vercel domain to allowed origins
   - **RLS Policies**: Ensure they allow access for anonymous users where needed

4. **Redeploy After Changes**
   - Any changes to environment variables require a redeploy
   - Go to Deployments → Latest deployment → ⋯ → Redeploy

### Map Not Loading

1. **Check Mapbox Token**
   - Ensure `VITE_MAPBOX_ACCESS_TOKEN` is set correctly in Vercel
   - Verify token is valid at https://account.mapbox.com/access-tokens/
   - Check if token has proper scopes enabled

2. **Check Console Errors**
   - Look for "Mapbox token is missing" error
   - Look for 401 errors from Mapbox API

### Build Failures

1. **Check Build Logs**
   - Vercel Dashboard → Deployments → Failed Build → View Logs
   - Common issues:
     - Missing dependencies: Run `npm install` locally first
     - TypeScript errors: Fix locally then push
     - Memory issues: Contact Vercel support

## Environment Variable Security

- ✅ **DO**: Store sensitive keys in Vercel environment variables
- ✅ **DO**: Use `.env` locally (not committed to GitHub)
- ✅ **DO**: Use different keys for production and development
- ❌ **DON'T**: Commit `.env` file to GitHub
- ❌ **DON'T**: Share API keys publicly
- ❌ **DON'T**: Use production keys in development

## Updating Environment Variables

When you need to update environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find the variable you want to update
3. Click the ⋯ menu → Edit
4. Update the value
5. **Important**: Go to Deployments and redeploy the latest deployment

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel automatically detects the push and deploys

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase "Site URL" with your custom domain

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Mapbox Documentation**: https://docs.mapbox.com

## Summary Checklist

Before deploying:
- [ ] `.env` is in `.gitignore`
- [ ] Code is pushed to GitHub
- [ ] All environment variables are ready

In Vercel:
- [ ] Repository connected
- [ ] All 3 environment variables added
- [ ] Variables applied to all environments
- [ ] Project deployed successfully

In Supabase:
- [ ] Vercel URL added to Site URL
- [ ] Vercel URL added to Redirect URLs
- [ ] RLS policies configured correctly

Testing:
- [ ] Visit deployed URL
- [ ] Check browser console for errors
- [ ] Verify data loads on map
- [ ] Test authentication (if applicable)
