# Fixing Vercel 404 NOT_FOUND Error

## Problem
Your Vercel build is succeeding, but you're getting a `404: NOT_FOUND` error when accessing the deployed application. This is caused by missing environment variables in Vercel, which causes the application to crash before it can render.

## Root Cause
Multiple parts of your Next.js application require specific environment variables to function:
- `NEXT_PUBLIC_SUPABASE_URL` - Required by middleware, server components, and API routes
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Required by middleware, server components, and API routes
- `SUPABASE_SERVICE_ROLE_KEY` - Required for agent API key validation
- `NEXT_PUBLIC_APP_URL` - Required for redirects and callbacks

When these variables are not set in Vercel, the application crashes at multiple points:
1. The middleware fails during request processing
2. The root layout fails to create a Supabase client
3. Server components fail to fetch data
4. This causes Vercel to return a 404 error

## Solution Steps

### Step 1: Get Your Supabase Credentials

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key
   - **service_role** secret key (⚠️ Never share this!)

### Step 2: Configure Environment Variables in Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | Production, Preview, Development |

**Important Notes:**
- For `NEXT_PUBLIC_APP_URL`, use:
  - Production: `https://your-project.vercel.app` or your custom domain
  - Preview: `https://your-project-git-branch.vercel.app`
  - Development: `http://localhost:3000` (if using local development)
- The `SUPABASE_SERVICE_ROLE_KEY` is a secret and should never be exposed to the client
- Make sure to select all three environments (Production, Preview, Development) for each variable

### Step 3: Redeploy Your Application

After adding the environment variables, you need to redeploy:

**Option A: Automatic Redeploy**
- Vercel will automatically redeploy when you push new code to your repository

**Option B: Manual Redeploy**
1. Go to the **Deployments** tab in Vercel
2. Click the three dots (⋮) next to your latest deployment
3. Select **Redeploy**
4. Confirm the redeployment

**Option C: Redeploy via CLI**
```bash
vercel --prod
```

### Step 4: Verify the Fix

1. Wait for the deployment to complete
2. Visit your Vercel deployment URL
3. The application should now load correctly

## What We Fixed

### 1. Updated Middleware (`middleware.ts`)
- Added graceful handling for missing environment variables
- Added comprehensive error logging with `[Middleware]` prefix
- In production, the app now continues to function even if env vars are missing (with warnings)
- In development, helpful error messages are shown
- Wrapped Supabase client creation in try-catch blocks to prevent crashes

### 2. Updated Server Client (`src/lib/supabase/server.ts`)
- Added validation for required environment variables before creating Supabase client
- Provides clear error messages when variables are missing
- Throws descriptive errors in both development and production

### 3. Updated Service Role Client (`src/lib/supabase/service-role.ts`)
- Added validation for required environment variables
- Provides clear error messages when variables are missing

### 4. Updated Root Layout (`src/app/layout.tsx`)
- Wrapped Supabase client creation in try-catch block
- App now renders even if Supabase is not configured
- Logs errors for debugging

### 5. Updated Home Page (`src/app/page.tsx`)
- Wrapped data fetching in try-catch block
- Page renders with empty data if Supabase is not configured
- Logs errors for debugging

### 6. Added Vercel Configuration (`vercel.json`)
- Ensures proper build and output directory configuration
- Adds security headers for production

## Troubleshooting

### Still Getting 404 After Following Steps?

1. **Check Vercel Logs**
   - Go to your project in Vercel
   - Navigate to the **Deployments** tab
   - Click on your latest deployment
   - Check the **Build Logs** and **Function Logs** for errors

2. **Verify Environment Variables**
   - Make sure all environment variables are set in Vercel
   - Ensure there are no typos in variable names
   - Confirm the values are correct (no extra spaces or newlines)

3. **Check Middleware Logs**
   - Look for error messages starting with `[Middleware]`
   - These will indicate which environment variables are missing

4. **Test Locally**
   - Ensure your `.env.local` file has the same variables
   - Run `npm run build` and `npm start` locally
   - Verify the app works locally before deploying

### Common Issues

#### Issue: "Missing required environment variables"
**Solution:** Double-check that all three Supabase variables are set in Vercel settings.

#### Issue: "Invalid API key" errors
**Solution:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly. This is different from the anon key.

#### Issue: Build succeeds but app shows errors
**Solution:** The middleware now allows the app to function even with missing env vars in production. Check the browser console and Vercel logs for specific errors.

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Supabase Getting Started Guide](https://supabase.com/docs/guides/getting-started)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env.local` or any environment files with secrets**
2. **The `SUPABASE_SERVICE_ROLE_KEY` gives full database access - keep it secret**
3. **Use different Supabase projects for development and production**
4. **Rotate your service role keys regularly**
5. **Enable two-factor authentication on both Supabase and Vercel accounts**

## Need Help?

If you're still experiencing issues after following these steps:

1. Check the Vercel deployment logs for specific error messages
2. Verify your Supabase project is active (not paused)
3. Ensure your Supabase project has the correct RLS policies enabled
4. Review the middleware logs in the Vercel function logs

---

**Last Updated:** 2025-02-26
