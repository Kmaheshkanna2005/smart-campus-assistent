# 🔧 FIX: Environment Variable Not Working

## The Problem
Your console shows: `REACT_APP_API_URL env var: undefined`

This means the environment variable is **NOT** being passed to the build process.

## ✅ Solution - Follow These Steps EXACTLY:

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Click on your project: **smart-campus-assistent**

### Step 2: Set Environment Variable (CRITICAL)
1. Go to **Settings** → **Environment Variables**
2. Look for `REACT_APP_API_URL` - **DELETE IT IF IT EXISTS** (to start fresh)
3. Click **Add New**
4. Enter exactly:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.onrender.com` or `https://your-backend.railway.app`)
   - **Environment**: ✅ Check ALL THREE:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
5. Click **Save**

### Step 3: Clear Build Cache & Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots menu)
4. Click **Redeploy**
5. **IMPORTANT**: Check the box "Use existing Build Cache" - **UNCHECK IT** ❌
6. Click **Redeploy**

### Step 4: Wait for Build
- Wait for the build to complete (2-3 minutes)
- Check the build logs to ensure no errors

### Step 5: Verify
1. Open your deployed app
2. Open browser console (F12)
3. You should see:
   ```
   API Base URL: https://your-backend-url.com
   REACT_APP_API_URL env var: https://your-backend-url.com
   ```
4. If you still see `undefined`, the variable wasn't set correctly

## 🚨 Common Mistakes:

1. ❌ Setting the variable AFTER deploying (must set BEFORE build)
2. ❌ Not checking "Production" environment checkbox
3. ❌ Variable name typo (must be exactly `REACT_APP_API_URL`)
4. ❌ Not clearing build cache when redeploying
5. ❌ Setting it but not redeploying

## 📝 What Backend URL Should You Use?

You need to deploy your FastAPI backend first. Options:
- **Render.com** (free tier available)
- **Railway.app** (free tier available)
- **Fly.io** (free tier available)
- **Your own server**

Once deployed, use that URL as the `REACT_APP_API_URL` value.

## 🔍 Still Not Working?

If after following all steps you still see `undefined`:
1. Check Vercel build logs - look for the environment variable in the logs
2. Make sure you're looking at the Production deployment (not Preview)
3. Try setting a test variable like `REACT_APP_TEST=hello` and check if it appears in console

