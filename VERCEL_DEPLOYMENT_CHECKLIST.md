# Vercel Deployment Checklist

## Critical Steps to Fix 404 Error

### ✅ Code Changes Completed
The following files have been updated to handle missing environment variables gracefully:

1. **[`middleware.ts`](middleware.ts:1)** - Middleware now handles missing env vars
2. **[`src/lib/supabase/server.ts`](src/lib/supabase/server.ts:1)** - Server client validates env vars
3. **[`src/lib/supabase/service-role.ts`](src/lib/supabase/service-role.ts:1)** - Service role client validates env vars
4. **[`src/app/layout.tsx`](src/app/layout.tsx:1)** - Root layout handles Supabase errors
5. **[`src/app/page.tsx`](src/app/page.tsx:1)** - Home page handles data fetch errors
6. **[`vercel.json`](vercel.json:1)** - Vercel configuration added

### ⚠️ Required Action: Configure Environment Variables in Vercel

You MUST add the following environment variables in your Vercel project:

#### Step 1: Get Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key
   - **service_role** secret key

#### Step 2: Add Variables to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with ALL environments selected (Production, Preview, Development):

| Variable Name | Value | Source |
|---------------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Supabase Dashboard |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | Vercel (see below) |

#### Step 3: Set NEXT_PUBLIC_APP_URL
- **Production**: `https://your-project.vercel.app` (or your custom domain)
- **Preview**: `https://your-project-git-branch.vercel.app`
- **Development**: `http://localhost:3000`

### 🚀 Deploy After Configuration

Once environment variables are configured:

**Option 1: Automatic Redeploy**
- Push the code changes to your repository
- Vercel will automatically redeploy

**Option 2: Manual Redeploy**
1. Go to Vercel → **Deployments**
2. Click ⋮ on latest deployment
3. Select **Redeploy**

**Option 3: CLI Redeploy**
```bash
vercel --prod
```

### ✅ Verify Deployment

After deployment completes:
1. Visit your Vercel URL
2. The application should load without 404 errors
3. Check browser console for any warnings

### 🔍 If Still Getting 404

1. **Check Vercel Logs**
   - Go to Vercel → Deployments → Latest deployment
   - Review **Build Logs** and **Function Logs**
   - Look for `[Middleware]` or `[createClient]` error messages

2. **Verify Environment Variables**
   - Ensure all 4 variables are set
   - Check for typos in variable names
   - Confirm values are correct (no extra spaces)

3. **Check Supabase Status**
   - Ensure your Supabase project is active (not paused)
   - Verify the project URL and keys are correct

4. **Review Error Messages**
   - Look for specific error messages in Vercel logs
   - Check browser console for client-side errors
   - Review the [`VERCEL_404_FIX.md`](VERCEL_404_FIX.md:1) for troubleshooting

### 📊 What the Changes Do

The updated code now:
- ✅ Validates environment variables before use
- ✅ Provides clear error messages when variables are missing
- ✅ Allows the app to render even if Supabase is not configured
- ✅ Logs detailed errors for debugging
- ✅ Prevents crashes from missing configuration

### 🔐 Security Reminders

⚠️ **Important:**
- Never commit `.env.local` or files with secrets
- The `SUPABASE_SERVICE_ROLE_KEY` gives full database access
- Keep service role keys secret and rotate regularly
- Use different Supabase projects for dev and production

### 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [`VERCEL_404_FIX.md`](VERCEL_404_FIX.md:1) - Detailed troubleshooting guide
- [`DEPLOYMENT.md`](DEPLOYMENT.md:1) - Full deployment documentation

---

**Last Updated:** 2025-02-26
**Status:** Code changes complete, awaiting environment variable configuration in Vercel
