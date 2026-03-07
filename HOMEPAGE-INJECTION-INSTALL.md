# Homepage Products Injection - Installation Guide

## 🎯 Goal
Replace product IDs and placeholder data on your homepage with real product data from the server.

---

## 📋 Before & After

**BEFORE (Current):**
- Titles: "10026814996777" (Product IDs)
- Prices: "£0.00" (Wrong)
- Images: Gray placeholder boxes

**AFTER (With Snippet):**
- Titles: "AS-Motor 800 FreeRider – Modell 2025"
- Prices: "$8999"
- Images: Real product photos

---

## 🚀 Installation Steps

### Step 1: Add Snippet to Shopify

1. Go to **Shopify Admin**: https://moversus.myshopify.com/admin
2. Click **Online Store** (left sidebar)
3. Click **Themes**
4. Click **Actions** → **Edit code**
5. In the left sidebar, find **Snippets** folder
6. Click **Add a new snippet**
7. Name it: `homepage-products-injection`
8. Click **Create snippet**

### Step 2: Paste the Code

1. Copy the code from: `homepage-products-injection.liquid` (in this repo)
2. Paste it into the snippet editor
3. Click **Save** (top right)

### Step 3: Add to Theme Layout

1. In the **Layout** folder (left sidebar), click `theme.liquid`
2. Scroll to the bottom and find the closing `</body>` tag
3. **BEFORE** the `</body>` tag, add this line:

```liquid
{% render 'homepage-products-injection' %}
```

**Example:**
```liquid
  {% render 'product-proxy-data' %}
  {% render 'product-schema-snippet' %}
  {% render 'homepage-products-injection' %}  ← ADD THIS LINE
</body>
</html>
```

4. Click **Save**

---

## ✅ Testing

### Step 1: Visit Your Homepage
Go to: https://moversus.myshopify.com/

### Step 2: Open Browser Console
- Press **F12** (or Right-click → Inspect)
- Click **Console** tab

### Step 3: Check for Success Messages
You should see:
```
🏠 Homepage products injection starting...
Found product cards using selector: .product-card
✅ Loaded 5 products from server
💉 Injecting data for: AS-Motor 800 FreeRider – Modell 2025
  ✓ Updated title: AS-Motor 800 FreeRider...
  ✓ Updated price: $8999
  ✓ Updated image
💉 Injecting data for: Toro Titan ZXM5475...
... etc
```

### Step 4: Visual Confirmation
- Product cards will briefly flash with **green border** (2 seconds)
- Titles change from IDs to real names
- Prices change to real values
- Images appear

---

## 🔧 Code Location

**GitHub:**
- https://github.com/yayab0/products/blob/main/homepage-products-injection.liquid

**Shopify:**
- `snippets/homepage-products-injection.liquid`
- `layout/theme.liquid` (renders the snippet)

---

## 🐛 Troubleshooting

### Issue: Console says "Not a product listing page"
**Fix:** The snippet couldn't find product cards. Check if your homepage has a different structure.

### Issue: No products loaded
**Fix:** 
1. Check server is running: https://products-7t0s.onrender.com/health
2. Check products exist: https://products-7t0s.onrender.com/admin/products

### Issue: Some products update, others don't
**Fix:** Product ID mismatch. Check the console to see which IDs were found vs expected.

### Issue: Images don't show
**Fix:** Check if image URLs are valid in your server data.

---

## 📊 How It Works

1. **Page Loads** → Snippet runs
2. **Fetch Products** → Gets all products from server API
3. **Find Cards** → Locates product cards on page (tries 8 different selectors)
4. **Match IDs** → Matches Shopify product ID in card to server product
5. **Update Content** → Replaces title, price, image with server data
6. **Cache** → Stores data for 60 seconds (faster navigation)

---

## 🎨 Visual Features

- ✅ Green border flash on successful injection (debugging aid)
- ✅ Smooth transition animation
- ✅ Console logging for monitoring
- ✅ Works with any theme layout

---

## ⚡ Performance

- **First load**: ~500ms (fetches from server)
- **Cached loads**: Instant (uses sessionStorage)
- **Cache duration**: 60 seconds
- **No page reload needed**: Works via JavaScript

---

## 🔄 Next Steps

After installing, you can also add the **featured products snippet** for larger product showcases:

1. Create snippet: `featured-products-injection`
2. Paste code from `featured-products-injection.liquid`
3. Add to theme.liquid: `{% render 'featured-products-injection' %}`

---

## ✨ Expected Result

Your homepage will show:
- ✅ **AS-Motor 800 FreeRider – Modell 2025** (not 10026814996777)
- ✅ **$8999** (not £0.00)
- ✅ **Real product images** (not gray boxes)
- ✅ **Correct product links** (using handles: /products/jj, /products/s, etc.)

All data comes from your server, not Shopify!

---

*Installation time: ~5 minutes*
