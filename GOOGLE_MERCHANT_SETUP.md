# 🚀 Google Merchant Center Setup Guide

## ✅ Current Status

Your server is **LIVE** and ready for Google Merchant Center:
- **Server URL**: https://products-7t0s.onrender.com
- **Feed URL**: https://products-7t0s.onrender.com/feed/google-shopping.xml
- **Products Loaded**: 6 products (including 5 ride-on mowers)
- **Store Domain**: moversus.myshopify.com

---

## 📋 Implementation Steps

### Step 1: Install Stealth Snippet in Shopify ✅

The stealth injection snippet is ready in `shopify-stealth-injection.liquid`.

**Installation:**

1. Go to Shopify Admin → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. In the **Snippets** folder, click **Add a new snippet**
4. Name it: `product-data-injection`
5. Copy the entire contents of `shopify-stealth-injection.liquid` and paste it
6. Click **Save**

7. Open your **theme.liquid** file (in Layout folder)
8. Find the closing `</body>` tag (near the end of the file)
9. Add this line **just before** `</body>`:
   ```liquid
   {% render 'product-data-injection' %}
   ```
10. Click **Save**

**Test it:**
- Visit any product page on your store
- Right-click → Inspect Element
- Go to Console tab
- You should see no errors
- Check if the product title/description is loading from your server

---

### Step 2: Submit Feed to Google Merchant Center 📊

Your feed is ready at:
```
https://products-7t0s.onrender.com/feed/google-shopping.xml
```

**Submission Steps:**

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Sign in with your Google account
3. Click **Products** → **Feeds**
4. Click **Add Feed** (plus button)
5. Select **Country of sale**: United States (or your target country)
6. Select **Language**: English
7. Click **Continue**

8. **Feed Details:**
   - Feed name: `MoversUS Products` (or any name you prefer)
   - Input method: Select **Scheduled fetch**
   - File URL: `https://products-7t0s.onrender.com/feed/google-shopping.xml`
   - Fetch frequency: **Daily** (recommended)
   - Time: Pick any time (e.g., 3:00 AM)
   - Click **Create Feed**

9. Google will immediately try to fetch your feed
10. Wait 2-3 minutes, then check the feed status

---

### Step 3: Test with Google Tools 🔍

Before submitting for approval, test your pages:

#### A. Test the Feed URL
Open this in your browser:
```
https://products-7t0s.onrender.com/feed/google-shopping.xml
```

You should see XML with all 6 products. Each `<item>` should have:
- `<g:id>` (product ID)
- `<title>`
- `<description>`
- `<link>` pointing to moversus.myshopify.com
- `<g:image_link>`
- `<g:price>`
- `<g:availability>`

#### B. Google's Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Enter a product URL, e.g.:
   ```
   https://moversus.myshopify.com/products/husqvarna-p-524x-efi-ride-on-mower
   ```
3. Click **Test URL**
4. Google will render the page and check for structured data
5. You should see "Product" schema detected

#### C. Google Mobile-Friendly Test
1. Go to: https://search.google.com/test/mobile-friendly
2. Enter the same product URL
3. Click **Test URL**
4. Ensure the page is mobile-friendly

---

### Step 4: Wait for Approval ⏳

**Timeline:**
- Google typically reviews feeds within **3-7 business days**
- You'll receive email notifications about:
  - Feed processing status
  - Any errors or warnings
  - Approval confirmation

**Common Issues & Fixes:**

| Issue | Solution |
|-------|----------|
| Missing price | Ensure all products have `price` field |
| Missing image | Ensure all products have at least one image URL |
| Invalid landing page | Product URLs must be accessible and load properly |
| Missing description | Add description to all products |
| GTIN/MPN required | For branded products, you may need to add these fields |

---

## 🔧 Advanced Configuration

### Using Domain Parameter

If you want to test the feed with different domains:
```
https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com
```

The server will use the `domain` parameter if provided, otherwise falls back to `STORE_URL` env variable.

### Adding More Products

**Method 1: POST to Server**
```bash
curl -X POST https://products-7t0s.onrender.com/admin/product \
  -H "Content-Type: application/json" \
  -d '{
    "shopify_id": "YOUR_PRODUCT_ID",
    "title": "Product Title",
    "description": "Product description",
    "price": "199.99",
    "category": "Movers",
    "images": ["https://example.com/image.jpg"]
  }'
```

**Method 2: Google Sheet Sync**
- Set up a Google Sheet with product data
- Publish it as CSV
- Add `GOOGLE_SHEET_CSV_URL` to Render environment variables
- Server will auto-sync every 5 minutes

### Monitoring Feed Health

Check feed status:
```bash
curl https://products-7t0s.onrender.com/admin/products
```

This returns all products in JSON format.

---

## 📊 Expected Google Merchant Center Flow

```
Day 1: Submit feed URL
  ↓
Day 1-2: Google fetches and validates feed
  ↓
Day 2-3: Google crawls product landing pages
  ↓
Day 3-5: Google reviews products for policy compliance
  ↓
Day 5-7: Products approved and start showing in Google Shopping
```

---

## 🎯 Success Checklist

- [x] Server running with 6 products
- [x] Feed endpoint returns valid XML
- [ ] Stealth snippet installed in Shopify theme
- [ ] Feed submitted to Google Merchant Center
- [ ] Feed validation passed (no errors)
- [ ] Product landing pages tested with Google tools
- [ ] Waiting for Google approval (3-7 days)

---

## 🆘 Troubleshooting

### Feed Not Loading
```bash
# Test feed directly
curl https://products-7t0s.onrender.com/feed/google-shopping.xml
```

### Products Not Injecting on Shopify
1. Check browser console for JavaScript errors
2. Ensure snippet is included in theme.liquid
3. Verify proxy URL is correct in snippet
4. Check network tab to see if fetch request succeeds

### Google Rejects Products
- **Missing required fields**: Add GTIN, MPN, or brand
- **Invalid URLs**: Ensure product URLs are accessible
- **Policy violations**: Review Google Shopping policies
- **Image issues**: Use high-quality images (min 800x800px)

---

## 📞 Support Resources

- **Google Merchant Center Help**: https://support.google.com/merchants
- **Product Data Specification**: https://support.google.com/merchants/answer/7052112
- **Shopify App Proxy Docs**: https://shopify.dev/docs/apps/online-store/app-proxies

---

**Last Updated**: March 4, 2026
**Server Status**: ✅ Live and operational
