# Fix Duplicate Product Schema Issue

## Problem
Google sees **3 Product schemas**:
1. **Shopify's default schema** (wrong data: name="10028641550633", price="0.00", OutOfStock)
2. **Organization schema** (correct, keep this)
3. **Our server schema** (correct, but added via JavaScript so Google may not see it)

## Root Cause
- Shopify's Horizon theme automatically generates a Product schema with Shopify store data
- Our JavaScript removes it, but **Google crawls the initial HTML before JavaScript runs**
- Result: Google sees Shopify's wrong data

## Solution Options

### Option 1: Disable Shopify's Product Schema (RECOMMENDED)
1. Go to Shopify Admin > Online Store > Themes
2. Click "Customize" on your Horizon theme
3. Go to Theme Settings > Search Engine Optimization (or similar)
4. Look for option like:
   - "Enable Product Schema" → **Turn OFF**
   - "Product structured data" → **Disable**
   - "Rich results" → **Disable for products**
5. Save theme

### Option 2: Edit Theme Code to Remove Schema Generation
If theme settings don't have the option:

1. Go to Shopify Admin > Online Store > Themes > Actions > Edit Code
2. Search all files for: `application/ld+json` or `schema.org/Product`
3. Find the file generating the Product schema (likely in `sections/` or `snippets/`)
4. Comment out or delete the schema generation code
5. Look for code like:
   ```liquid
   <script type="application/ld+json">
   {
     "@context": "http://schema.org/",
     "@type": "Product",
     ...
   }
   </script>
   ```
6. Wrap it in a comment:
   ```liquid
   {% comment %}
   <script type="application/ld+json">
   ...
   </script>
   {% endcomment %}
   ```

### Option 3: Server-Side Schema Replacement (Current Approach)
Keep using `product-schema-snippet.liquid` but understand:
- JavaScript runs AFTER Google crawls
- Google might still see Shopify's schema first
- Works for users but may not work for Google's crawler

## Testing After Fix
1. After making changes, wait 5-10 minutes
2. Test with: https://search.google.com/test/rich-results
3. Enter product URL: https://moversus.myshopify.com/products/ls-fofo
4. Should see only **1 Product schema** (from our server)
5. Check that it shows correct data (not "10028641550633")

## Current Status
- ✅ Server feed has correct data
- ✅ Visible content shows server data (via product-proxy-data snippet)
- ❌ Schema shows Shopify data (needs Option 1 or 2 above)
