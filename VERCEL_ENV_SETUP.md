# Vercel Environment Variables Setup

## Problem
The frontend is trying to connect to `http://127.0.0.1:8000` which only works locally. In production, you need to set your backend API URL.

## Solution

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard: https://vercel.com
2. Select your project: **smart-campus-assistent**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend-api.vercel.app` or `https://your-backend-api.render.com`)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 2: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeployment

### Step 3: Verify

After redeployment, check the browser console. You should no longer see `127.0.0.1:8000` errors.

## Important Notes

- **For Create React App**: Environment variables must start with `REACT_APP_` to be accessible in the browser
- **Backend URL**: Make sure your backend is deployed and accessible. If you haven't deployed the backend yet, you'll need to do that first.
- **CORS**: Ensure your backend allows requests from your Vercel frontend URL

## Example Backend Deployment Options

1. **Vercel** (for serverless functions)
2. **Render** (for Python/FastAPI)
3. **Railway**
4. **Heroku**
5. **Your own server**

Once your backend is deployed, use that URL as the `REACT_APP_API_URL` value.

