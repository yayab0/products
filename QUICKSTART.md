# 🚀 Quick Start Guide - Google Merchant Center

## ✅ What's Ready

Your complete system is **LIVE** and operational:

### 1. Server & Feed ✅
- **Server**: https://products-7t0s.onrender.com
- **Feed URL**: https://products-7t0s.onrender.com/feed/google-shopping.xml
- **Status**: 6 products loaded and validated
- **Domain**: moversus.myshopify.com

### 2. Shopify Stealth Injection ✅
- **File**: `shopify-stealth-injection.liquid`
- **Purpose**: Dynamically inject product data into Shopify pages
- **Status**: Ready to install (see installation below)

---

## 📝 Next Steps (Do These Now)

### Step 1: Install Shopify Snippet (15 minutes)

1. **Open Shopify Admin**: https://moversus.myshopify.com/admin
2. **Navigate**: Online Store → Themes → Actions → Edit code
3. **Create Snippet**:
   - Click "Snippets" folder
   - Click "Add a new snippet"
   - Name: `product-data-injection`
   - Copy entire content from `shopify-stealth-injection.liquid`
   - Click Save

4. **Include in Theme**:
   - Open `Layout/theme.liquid`
   - Find `</body>` tag (near bottom)
   - Add **before** `</body>`:
     ```liquid
     {% render 'product-data-injection' %}
     ```
   - Click Save

5. **Test**:
   - Visit: https://moversus.myshopify.com/products/husqvarna-p-524x-efi-ride-on-mower
   - Right-click → Inspect → Console
   - Should see no errors
   - Description should load from server

---

### Step 2: Submit to Google Merchant Center (10 minutes)

1. **Go to**: https://merchants.google.com/
2. **Sign in** with Google account
3. **Add Feed**:
   - Click Products → Feeds
   - Click + button
   - Country: United States
   - Language: English
   - Click Continue

4. **Configure Feed**:
   - Name: `MoversUS Products`
   - Input: Scheduled fetch
   - URL: `https://products-7t0s.onrender.com/feed/google-shopping.xml`
   - Frequency: Daily
   - Time: 3:00 AM (or any time)
   - Click Create Feed

5. **Wait**: Google fetches immediately, check status in 2-3 minutes

---

### Step 3: Test with Google Tools (5 minutes)

Test any product URL with these tools:

**Rich Results Test**:
```
https://search.google.com/test/rich-results
```
Enter: https://moversus.myshopify.com/products/husqvarna-p-524x-efi-ride-on-mower

**Mobile-Friendly Test**:
```
https://search.google.com/test/mobile-friendly
```
Enter same URL

**Expected**: Product schema detected, mobile-friendly ✅

---

## 🎯 Timeline

| Day | Activity |
|-----|----------|
| **Today** | Install snippet + submit feed |
| **Day 1-2** | Google fetches & validates feed |
| **Day 2-3** | Google crawls product pages |
| **Day 3-7** | Review & approval |
| **Day 7+** | Products live in Google Shopping! |

---

## 📊 Your Feed URLs

**Main Feed** (use this for Google):
```
https://products-7t0s.onrender.com/feed/google-shopping.xml
```

**With Domain Parameter** (for testing):
```
https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com
```

**Product Count**:
```
https://products-7t0s.onrender.com/admin/products
```

---

## ✅ Current Products in Feed

1. **Premium Product** (123)
2. **Husqvarna P 524X EFI Ride-On Mower** (10028650365225) - $10,100
3. **AS-Motor 800 FreeRider – Modell 2025** (10026814996777) - $5,660.96
4. **Toro Titan ZXM5475 Professional Grade Zero Turn Riding Mower** (10028654493993) - $4,602.30
5. **Cub Cadet Z5 152 Zero-Turn Ride-On Mower – Ex Demo** (10028648825129) - $8,798.00
6. **Efco Tuareg 92 EVO – Modell 2025** (10028641550633) - $5,950.96

All products have:
- ✅ Title
- ✅ Description
- ✅ Price
- ✅ Images
- ✅ Category
- ✅ Valid product URLs

---

## 🆘 Quick Troubleshooting

**Feed not loading?**
```bash
curl https://products-7t0s.onrender.com/feed/google-shopping.xml
```

**Snippet not working?**
- Check browser Console for errors
- Verify snippet is in theme.liquid
- Check proxy URL format

**Google rejects feed?**
- Most likely needs GTIN/MPN for branded products
- We can add these fields if needed

---

## 📚 Full Documentation

See `GOOGLE_MERCHANT_SETUP.md` for complete details and advanced configuration.

---

**Ready to go? Start with Step 1 above! 🚀**
