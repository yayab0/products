# How to Disable Shopify's Product Schema

## Current Problem
Your product page shows 2 schemas:
1. ✅ **Organization** schema (correct - keep this)
2. ❌ **Product** schema (wrong data):
   - Name: "10028641550633" (should be "Efco Tuareg 92 EVO")
   - Price: "0.00" (should be "10999")
   - Availability: "OutOfStock" (should be "InStock")
   - @id: "/products/ls-fofo#product"

This is Shopify's default schema with store data. We need to disable it.

---

## Step-by-Step Guide

### Step 1: Access Theme Code Editor
1. Go to **Shopify Admin**: https://moversus.myshopify.com/admin
2. Click **Online Store** (left sidebar)
3. Click **Themes**
4. Find your **Horizon** theme
5. Click **Actions** → **Edit code**

### Step 2: Search for Product Schema
In the code editor:
1. Use the **search box** (top right)
2. Search for: `#product`
3. OR search for: `application/ld+json`
4. OR search for: `schema.org/Product`

### Step 3: Likely Locations
The Product schema is usually in one of these files:

**Option A: In a snippet file**
- Look in `snippets/` folder
- Common names:
  - `product-schema.liquid`
  - `product-json-ld.liquid` 
  - `structured-data.liquid`
  - `seo-schema.liquid`

**Option B: In the main product template**
- `sections/main-product.liquid`
- `sections/product-template.liquid`
- `templates/product.liquid`

**Option C: In theme.liquid**
- `layout/theme.liquid`
- Look for Product schema near the `</head>` tag

### Step 4: Identify the Code
Look for code like this:
```liquid
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@id": "{{ canonical_url }}#product",
  "@type": "Product",
  "name": "{{ product.title | escape }}",
  "offers": {
    "@type": "Offer",
    "price": "{{ product.price | money_without_currency }}",
    ...
  }
}
</script>
```

### Step 5: Disable the Schema
Once you find it, you have 2 options:

**Option A: Comment it out** (Recommended - easy to undo)
```liquid
{% comment %}
<script type="application/ld+json">
{
  "@context": "http://schema.org/",
  "@id": "{{ canonical_url }}#product",
  "@type": "Product",
  ...
}
</script>
{% endcomment %}
```

**Option B: Add a condition to skip it**
```liquid
{% unless template contains 'product' %}
  <script type="application/ld+json">
  ...
  </script>
{% endunless %}
```

### Step 6: Save and Test
1. Click **Save** in the code editor
2. Wait 2-3 minutes for changes to propagate
3. Test the product page: https://moversus.myshopify.com/products/ls-fofo
4. Check browser console - should see:
   - "🗑️ Removed 1 Shopify Product schema(s)"
   - "✅ Server Product schema injected"

### Step 7: Verify with Google
Test with Google Rich Results:
https://search.google.com/test/rich-results

Enter: `https://moversus.myshopify.com/products/ls-fofo`

**Expected result:**
- ✅ 1 Product schema detected (from our server)
- ✅ Name: "Efco Tuareg 92 EVO" (not "10028641550633")
- ✅ Price: "10999" (not "0.00")
- ✅ Availability: "InStock" (not "OutOfStock")

---

## Alternative: If You Can't Find It

If you can't find the Product schema code:

### Contact Shopify Support
1. Go to Shopify Admin → Help
2. Ask: "How do I disable the automatic Product structured data (JSON-LD schema) in the Horizon theme?"
3. They can point you to the exact file

### OR: Use Theme Settings
Some themes have a setting to disable schema:
1. Go to **Themes** → **Customize**
2. Click **Theme settings** (bottom left)
3. Look for:
   - "SEO" section
   - "Structured data" or "Rich results"
   - Toggle to disable Product schema

---

## Next Steps After Disabling

Once Shopify's Product schema is disabled:
1. ✅ Our `product-schema-snippet.liquid` will inject the server schema
2. ✅ Google will see only 1 Product schema (with correct data)
3. ✅ Submit feed to Google Merchant Center
4. ✅ GMC will validate by comparing feed with page schema

---

## Need Help?
If you can't find the schema code, share:
1. Screenshot of your theme files list (from Edit code)
2. Search results for "#product" or "application/ld+json"
3. I'll help you locate it!
