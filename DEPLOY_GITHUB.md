# Deploy to Railway/Render from GitHub

## 🚀 Quick Deploy (5 minutes)

Your repo: `git@github.com:yayab0/products.git`

### Step 1: Push Code to GitHub

```bash
cd ~/Desktop/tools/shopify-app-proxy

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Shopify App Proxy setup"

# Add your GitHub repo
git remote add origin git@github.com:yayab0/products.git

# Push to GitHub
git push -u origin main
```

**If you get errors:**
```bash
# If main branch doesn't exist, create it:
git branch -M main
git push -u origin main

# If it says "repository not empty":
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 🚂 Deploy to Railway (RECOMMENDED - FREE)

### Step 2: Deploy on Railway

1. Go to [Railway.app](https://railway.app)
2. Click **"Login"** → Sign in with **GitHub**
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select: **`yayab0/products`**
6. Railway auto-detects Node.js and deploys!

### Step 3: Add Environment Variable

1. Click your deployed project
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Variable:** `SHOPIFY_APP_SECRET`
   - **Value:** (your Shopify app secret key)
5. Click **"Add"**
6. Service will auto-restart

### Step 4: Get Your URL

1. Click **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://products-production-abcd.up.railway.app`)

✅ **Use this URL in your Shopify App Proxy settings!**

---

## 🎨 Alternative: Deploy to Render (100% FREE)

### Step 2b: Deploy on Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"** → select **`yayab0/products`**
5. Settings:
   - **Name:** `shopify-proxy`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **"Create Web Service"**

### Step 3b: Add Environment Variable

1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Key: `SHOPIFY_APP_SECRET`
4. Value: (your secret)
5. Click **"Save Changes"**

Your URL: `https://shopify-proxy.onrender.com`

---

## ✅ Configure Shopify

Once deployed (Railway or Render), use your new URL:

1. Shopify Admin → Your App → **"Configuration"**
2. App Proxy settings:
   - **Subpath prefix:** `apps`
   - **Subpath:** `products`
   - **Proxy URL:** `https://YOUR-RAILWAY-OR-RENDER-URL/proxy`
   
   Example: `https://products-production-abcd.up.railway.app/proxy`
3. Save

## 🧪 Test

Visit:
```
https://your-store.myshopify.com/apps/products/health
```

Should return:
```json
{"status":"ok","products":1}
```

---

## 🔄 Update Your Code

When you want to update:

```bash
cd ~/Desktop/tools/shopify-app-proxy

# Make changes to index.js or other files

git add .
git commit -m "Updated product logic"
git push origin main
```

Railway/Render auto-deploys on every push! 🚀

---

## 📊 Current Files in Repo

After pushing, your GitHub repo will have:
```
products/
├── index.js           (main server)
├── package.json       (dependencies)
├── .replit           (Replit config)
├── railway.json      (Railway config)
├── render.yaml       (Render config)
├── .gitignore        (ignore node_modules)
├── theme-snippet.liquid
├── README.md
└── REPLIT_SETUP.md
```

Everything is ready to deploy automatically!
