# Render Deployment Guide

## Database Setup Error Fix

### Problem
```
SequelizeConnectionRefusedError: Database connection failed
```

### Root Cause
Backend trying to connect to `localhost` database, but Render needs actual PostgreSQL URL.

---

## ✅ Solution Steps

### 1. Create PostgreSQL Database on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **PostgreSQL**
3. **Configure:**
   - Name: `resume-database`
   - Database: `MASTERDB`
   - User: `postgres` 
   - Plan: **Free** (testing) or **Starter** (production)
4. **Create Database**
5. **Copy Internal Database URL** (looks like):
   ```
   postgresql://username:password@hostname:port/MASTERDB
   ```

### 2. Configure Web Service Environment Variables

In your Render Web Service → **Environment** tab, add:

```bash
# Database (CRITICAL - Use your actual database URL from step 1)
DATABASE_URL=postgresql://username:password@hostname:port/MASTERDB

# App Config
NODE_ENV=production
PORT=10000

# CORS & Frontend
CORS_ORIGIN=https://res-next-front-z88v.vercel.app
FRONTEND_URL=https://res-next-front-z88v.vercel.app
ALLOW_CROSS_ORIGIN=true

# JWT
JWT_SECRET_KEY=afhsjduhIUHAUIGF^%^&%
JWT_EXPIRE=10d
COOKIE_EXPIRE=10

# OAuth - Google
GOOGLE_CLIENT_ID=39782543230-ih6dbmn0almbvt5iv13he15g6ovjqm59.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OAuth - LinkedIn (UPDATE: Replace with your actual Render URL)
LINKEDIN_CLIENT_ID=7744b9ar3uzd9h
LINKEDIN_CLIENT_SECRET=WPL_AP1.nGDqgp1WWDtCMp1G.T1rI4g==
LINKEDIN_REDIRECT_URL=https://YOUR-BACKEND.onrender.com/v1/auth/linkedin
```

### 3. Update Frontend Environment Variable

In **Vercel** → Settings → Environment Variables:
- Update `NEXT_PUBLIC_API_BASE_URL` to: `https://YOUR-BACKEND.onrender.com/v1/`

---

## 🔧 Code Changes Made

### Updated `db/models/index.js`
- Now supports `DATABASE_URL` (Render's preferred method)
- Includes SSL configuration for Render PostgreSQL
- Falls back to individual DB config for local development

### Created `.env.production`
- Template for production environment variables
- Ready for Render deployment

---

## 🚀 Deployment Steps

1. ✅ **Create PostgreSQL Database** (Step 1 above)
2. ✅ **Set Environment Variables** (Step 2 above)  
3. ✅ **Deploy Code Changes** (push to GitHub)
4. ✅ **Update Vercel API URL** (Step 3 above)

### Deploy to Render:

```bash
# Push changes to trigger deployment
git add .
git commit -m "fix: Configure database for Render deployment"
git push origin main
```

---

## 📋 Checklist

- [ ] PostgreSQL database created on Render
- [ ] DATABASE_URL copied from Render
- [ ] All environment variables added to Render service
- [ ] Code changes pushed to GitHub
- [ ] Render deployment successful
- [ ] Frontend API URL updated in Vercel
- [ ] Login/signup working from Vercel frontend

---

## 🐛 Troubleshooting

### Error: "Database connection failed"
- ✅ Check `DATABASE_URL` is correctly set in Render environment
- ✅ Verify database is running (Render dashboard → database status)

### Error: "SSL connection required"
- ✅ Code now includes SSL config for Render

### Error: "CORS not allowed"
- ✅ Check `CORS_ORIGIN` matches your Vercel URL exactly

### Frontend can't reach backend
- ✅ Update `NEXT_PUBLIC_API_BASE_URL` in Vercel to your Render backend URL

---

## 🌐 URLs After Deployment

- **Frontend**: https://res-next-front-z88v.vercel.app
- **Backend**: https://YOUR-SERVICE-NAME.onrender.com
- **Database**: Internal Render PostgreSQL

---

## 💡 Next Steps

1. **Deploy and test** the current changes
2. **Monitor logs** in Render dashboard
3. **Test login flow** from Vercel frontend
4. **Set up CI/CD** for automatic deployments (optional)

---

## 📞 Support

If deployment still fails:
1. Check Render service logs: Dashboard → Your Service → Logs
2. Verify environment variables are set correctly
3. Test database connection from Render console