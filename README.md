# Shopify App Proxy - Complete Setup Guide

A professional, Shopify-approved method to serve custom product data through your Shopify store domain.

## 🎯 What This Does

- Serves product data through YOUR Shopify domain (e.g., `yourstore.com/apps/products`)
- **100% invisible** - looks like native Shopify functionality
- **No CORS issues** - same-origin requests
- **Secure** - Shopify validates all requests with HMAC signatures
- **Professional** - used by legitimate Shopify apps worldwide

## 📋 Prerequisites

- Shopify store (any plan)
- Node.js server (Replit, Heroku, Railway, etc.)
- Access to Shopify theme code

## 🚀 Setup Steps

### 1. Create Shopify App

1. Go to Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **"Develop apps"**
3. Click **"Create an app"**
4. Name it: `Product Manager` (or anything you want)
5. Click **"Create app"**

### 2. Configure App Proxy

1. In your app settings, click **"Configuration"**
2. Scroll to **"App proxy"** section
3. Click **"Set up"** or **"Edit"**

**Configure these settings:**
```
Subpath prefix: apps
Subpath: products
Proxy URL: https://your-server.com/proxy
```

**Example:**
- If your server is on Replit: `https://your-repl.repl.co/proxy`
- If on Railway: `https://your-app.up.railway.app/proxy`

This means:
- Requests to `yourstore.com/apps/products/*`
- Will proxy to `your-server.com/proxy/*`

4. Click **"Save"**

### 3. Get Your App Secret

1. In your app, go to **"API credentials"**
2. Copy the **"API secret key"**
3. Save it - you'll need it for signature verification

### 4. Deploy Server

#### Option A: Replit (Easiest)
1. Create new Repl (Node.js)
2. Upload `server.js` and `package.json`
3. Create `.env` file:
   ```env
   NODE_ENV=production
   PORT=3000
   SHOPIFY_APP_SECRET=your-api-secret-from-step-3
   ```
4. Run `npm install`
5. Click "Run"
6. Copy your Replit URL

#### Option B: Railway/Heroku
1. Deploy the folder
2. Set environment variables:
   - `NODE_ENV=production`
   - `SHOPIFY_APP_SECRET=your-secret`
3. Deploy and copy the URL

### 5. Install Theme Snippet

1. Go to Shopify Admin → **Online Store** → **Themes**
2. Click **"..."** → **"Edit code"**
3. In **Snippets**, click **"Add a new snippet"**
4. Name it: `product-proxy-data`
5. Paste the contents of `theme-snippet.liquid`
6. Click **"Save"**

### 6. Add to Product Template

1. Open `sections/main-product.liquid` (or your product template)
2. Add this line near the top:
   ```liquid
   {% render 'product-proxy-data' %}
   ```
3. Click **"Save"**

## ✅ Testing

### Test 1: Server Health
```bash
curl https://your-server.com/proxy/health
```
Should return: `{"status":"ok",...}`

### Test 2: Proxy Through Shopify
```bash
curl https://yourstore.com/apps/products/health
```
Should return the same response (proxied through Shopify)

### Test 3: Get Product Data
Visit any product page on your store and check the browser console. You should see:
```
✅ Product data loaded: {...}
```

## 📊 API Endpoints

### Proxy Endpoints (through Shopify)
```
GET  /apps/products/product/:shopify_id  - Get product by ID
GET  /apps/products/products             - List all products
POST /apps/products/product              - Add/update product
DELETE /apps/products/product/:id        - Delete product
GET  /apps/products/health               - Health check
```

### Admin Endpoints (direct to server)
```
GET  /admin/products      - List products
POST /admin/product       - Add product
```

## 🔐 Security

The server automatically verifies Shopify's HMAC signature on all `/proxy` requests in production mode. This ensures requests actually come from Shopify.

**How it works:**
1. Shopify signs every proxy request with your app secret
2. Server recalculates the signature
3. If they don't match → request rejected

## 🎨 Customizing Theme Integration

The snippet updates these elements automatically:
- Product title: `.product__title`
- Description: `.product__description`
- Price: `.product__price`
- Images: `.product__image img`

**To customize selectors**, edit `theme-snippet.liquid`:
```javascript
const titleEl = document.querySelector('.your-custom-selector');
```

## 📦 Adding Products

### Via API (recommended)
```bash
curl -X POST https://your-server.com/admin/product \
  -H "Content-Type: application/json" \
  -d '{
    "shopify_id": "123",
    "title": "Premium Product",
    "description": "Amazing product",
    "price": "99.99",
    "images": ["https://..."],
    "variants": [...]
  }'
```

### Via Code
Edit `server.js` and add to the `products` object:
```javascript
const products = {
  '123': {
    id: '123',
    shopify_id: '123',
    title: 'Your Product',
    description: 'Description here',
    price: '99.99',
    images: ['https://...']
  }
};
```

## 🔄 Request Flow

```
Customer visits: yourstore.com/products/cool-item
    ↓
Theme snippet fetches: yourstore.com/apps/products/product/123
    ↓
Shopify verifies and proxies to: your-server.com/proxy/product/123
    ↓
Server responds with product data
    ↓
Theme updates page (looks 100% native)
```

## 🎯 Advantages

| Feature | Direct API | App Proxy |
|---------|-----------|-----------|
| Domain | external.com | yourstore.com |
| Visibility | External call | Internal-looking |
| CORS | Required | Not needed |
| Detection | Obvious | Invisible |
| Professional | No | Yes ✅ |
| Shopify-approved | No | Yes ✅ |

## 🐛 Troubleshooting

### "Unauthorized" errors
- Check `SHOPIFY_APP_SECRET` matches your app's API secret
- Verify proxy URL is correct in app settings

### Data not loading
- Check browser console for errors
- Verify theme snippet is included: `{% render 'product-proxy-data' %}`
- Test proxy endpoint directly: `curl https://yourstore.com/apps/products/health`

### 404 errors
- Ensure app proxy is enabled and saved in Shopify
- Verify server is running: `curl https://your-server.com/proxy/health`
- Check subpath matches: default is `/apps/products`

## 🚀 Production Tips

1. **Use a real database** (MongoDB, PostgreSQL) instead of in-memory storage
2. **Add caching** (Redis) for faster responses
3. **Monitor** with services like DataDog or New Relic
4. **Rate limit** to prevent abuse
5. **Log** all requests for debugging

## 📚 Resources

- [Shopify App Proxy Docs](https://shopify.dev/docs/apps/online-store/app-proxies)
- [HMAC Verification](https://shopify.dev/docs/apps/auth/oauth/getting-started#step-5-verify-the-installation-request)

---

**Need help?** Check the server logs or browser console for detailed error messages.
