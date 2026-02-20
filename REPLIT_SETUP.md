# Shopify App Proxy - Replit Deployment

## 🚀 Deploy to Replit (5 minutes)

### Step 1: Upload to Replit

1. Go to [Replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Select **"Import from GitHub"** OR **"Upload files"**
4. Upload these files from `~/Desktop/tools/shopify-app-proxy/`:
   - `index.js`
   - `package.json`
   - `.replit`

### Step 2: Set Environment Variable (Optional)

1. In Replit, click the **🔒 Secrets** tab (left sidebar)
2. Add a secret:
   - Key: `SHOPIFY_APP_SECRET`
   - Value: (your Shopify app secret - get this from Shopify admin later)
3. Click **"Add secret"**

**Note:** You can skip this for now and add it later after creating your Shopify app.

### Step 3: Run the Server

1. Click the **"Run"** button at the top
2. Wait for installation (first time only)
3. You'll see:
   ```
   🚀 Server running on port 3000
   📦 Products loaded: 1
   🔗 Replit URL: https://your-repl.your-username.repl.co
   ```
4. **Copy your Replit URL** - you'll need it for Shopify!

### Step 4: Test It Works

Click the browser preview in Replit or visit:
```
https://your-repl.your-username.repl.co
```

You should see:
```json
{
  "message": "Shopify App Proxy Server - Running on Replit",
  "products_count": 1
}
```

Test the health endpoint:
```
https://your-repl.your-username.repl.co/proxy/health
```

## 🛍️ Configure Shopify App

### Step 5: Create Shopify App

1. Go to Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **"Develop apps"**
3. Click **"Create an app"**
4. Name it: `Product Manager`
5. Click **"Create app"**

### Step 6: Get App Secret

1. In your app, go to **"API credentials"**
2. Copy the **"API secret key"**
3. Go back to Replit → **🔒 Secrets** tab
4. Add/update the secret:
   - Key: `SHOPIFY_APP_SECRET`
   - Value: (paste the secret you just copied)
5. Click the **"Restart"** button (arrow icon) to reload with the new secret

### Step 7: Configure App Proxy

1. In Shopify app settings, click **"Configuration"**
2. Scroll to **"App proxy"**
3. Click **"Set up"** or **"Edit"**
4. Enter:
   ```
   Subpath prefix: apps
   Subpath: products
   Proxy URL: https://your-repl.your-username.repl.co/proxy
   ```
   ⚠️ **Important:** Use YOUR Replit URL from Step 3!
5. Click **"Save"**

## ✅ Verify It's Working

Test the proxy through Shopify:
```
https://your-store.myshopify.com/apps/products/health
```

Should return:
```json
{"status":"ok","products":1}
```

If it works → you're done with the backend! 🎉

## 🎨 Add to Your Theme

### Step 8: Install Theme Snippet

1. Shopify Admin → **Online Store** → **Themes**
2. Click **"..."** → **"Edit code"**
3. In **Snippets**, click **"Add a new snippet"**
4. Name: `product-proxy-data`
5. Paste contents from `theme-snippet.liquid` (in this folder)
6. **Save**

### Step 9: Include in Product Template

1. Open `sections/main-product.liquid`
2. Add near the top:
   ```liquid
   {% render 'product-proxy-data' %}
   ```
3. **Save**

### Step 10: Test on Product Page

1. Visit any product on your store
2. Open browser console (F12)
3. You should see:
   ```
   ✅ Product data loaded: {...}
   ```

## 📝 Adding Products

### Via Replit Console:
Edit `index.js` and add to the `products` object:
```javascript
const products = {
  '123': { ... },
  '456': {
    id: '456',
    shopify_id: '456',
    title: 'New Product',
    description: 'Amazing product',
    price: '149.99'
  }
};
```

### Via API (from terminal):
```bash
curl -X POST https://your-repl.your-username.repl.co/admin/product \
  -H "Content-Type: application/json" \
  -d '{
    "shopify_id": "789",
    "title": "API Product",
    "description": "Added via API",
    "price": "199.99"
  }'
```

## 🔧 Replit Tips

### Keep Your Repl Always On
- Free tier: Repl sleeps after inactivity
- Upgrade to **Hacker plan** ($7/mo) for always-on
- Or use a free uptime monitor (UptimeRobot) to ping it every 5 minutes

### View Logs
Click the **"Console"** tab in Replit to see all server logs

### Restart Server
Click the **"Restart"** button (circular arrow icon) after changing code or secrets

## 🐛 Troubleshooting

### Repl won't start
- Check **Console** tab for errors
- Make sure `package.json` has correct dependencies
- Try: Delete `node_modules` folder and restart

### "Unauthorized" errors
- Check `SHOPIFY_APP_SECRET` matches your Shopify app secret
- Make sure you restarted after adding the secret

### Proxy not working
- Verify proxy URL in Shopify matches your Replit URL exactly
- Must end with `/proxy` (not `/proxy/`)
- Test direct: `curl https://your-repl.../proxy/health`

## 📊 Your URLs

Once deployed, you'll have:

**Replit (backend):**
- Dashboard: `https://your-repl.your-username.repl.co`
- Proxy: `https://your-repl.your-username.repl.co/proxy/*`
- Admin: `https://your-repl.your-username.repl.co/admin/*`

**Shopify (frontend - invisible to customers):**
- Proxy: `https://your-store.myshopify.com/apps/products/*`

All customer requests go through the Shopify URL → completely invisible! 🎯

---

**Total setup time:** ~10 minutes

**Cost:** $0 (free Replit tier works, just might sleep)
