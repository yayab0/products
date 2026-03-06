# Complete Google Merchant Center Setup Guide
## Override Shopify Product Data with Server Data

This guide documents the complete process to inject custom product data from an external server into Shopify product pages, making Google see your server data instead of Shopify's store data.

---

## 🎯 Goal
Replace Shopify product data (title, price, description, images, schema) with data from an external server for Google Merchant Center submission.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Server (Render)                                            │
│  └─ Products Database (products.json)                       │
│     └─ 5 Lawn Mowers with real data                         │
│                                                              │
│         ↓ (App Proxy)                                       │
│                                                              │
│  Shopify Store                                              │
│  └─ Product Pages (Horizon Theme)                           │
│     ├─ product-proxy-data.liquid (visible content)          │
│     └─ product-schema-snippet.liquid (Schema.org)           │
│                                                              │
│         ↓ (Crawls)                                          │
│                                                              │
│  Google Merchant Center                                     │
│  └─ Sees server data (not Shopify data)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Part 1: Server Setup (Node.js/Express)

### 1.1 Create Server Structure

```bash
# Initialize project
mkdir products-server
cd products-server
npm init -y

# Install dependencies
npm install express cors
```

### 1.2 Create server.js

**File: `server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage + file persistence
let products = [];
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Load products from file on startup
function loadProducts() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      products = JSON.parse(data);
      console.log(`✅ Loaded ${products.length} products from file`);
    }
  } catch (error) {
    console.error('❌ Error loading products:', error);
  }
}

// Save products to file
function saveProducts() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Saved ${products.length} products to file`);
  } catch (error) {
    console.error('❌ Error saving products:', error);
  }
}

// Load products on startup
loadProducts();

// Routes

// 1. Get product by Shopify ID
app.get('/proxy/product/:shopify_id', (req, res) => {
  const { shopify_id } = req.params;
  const product = products.find(p => String(p.shopify_id) === shopify_id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// 2. Duplicate route for compatibility
app.get('/product/:shopify_id', (req, res) => {
  const { shopify_id } = req.params;
  const product = products.find(p => String(p.shopify_id) === shopify_id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// 3. Admin endpoint - Create/Update product
app.post('/admin/product', (req, res) => {
  const { 
    shopify_id, 
    title, 
    description, 
    price, 
    images,
    handle  // Product handle for Shopify URLs
  } = req.body;
  
  if (!shopify_id) {
    return res.status(400).json({ error: 'shopify_id is required' });
  }
  
  const existingIndex = products.findIndex(p => String(p.shopify_id) === String(shopify_id));
  
  const productData = {
    id: existingIndex >= 0 ? products[existingIndex].id : crypto.randomUUID(),
    shopify_id: String(shopify_id),
    title: title || '',
    description: description || '',
    price: price || 0,
    images: images || [],
    handle: handle || '',
    updated_at: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    products[existingIndex] = productData;
  } else {
    products.push(productData);
  }
  
  saveProducts();
  
  res.json({ 
    success: true, 
    product: productData,
    message: existingIndex >= 0 ? 'Product updated' : 'Product created'
  });
});

// 4. List all products
app.get('/admin/products', (req, res) => {
  res.json({ 
    count: products.length,
    products: products 
  });
});

// 5. Google Shopping Feed
app.get('/feed/google-shopping.xml', (req, res) => {
  const { domain } = req.query;
  
  if (!domain) {
    return res.status(400).send('Missing domain parameter');
  }
  
  const baseUrl = `https://${domain}`;
  
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Product Feed</title>
    <link>${baseUrl}</link>
    <description>Product feed for Google Merchant Center</description>
`;
  
  products.forEach(p => {
    const handle = p.handle || slugify(p.title || '');
    const productUrl = `${baseUrl}/products/${handle}`;
    const imageUrl = (p.images && p.images.length > 0) ? p.images[0] : '';
    
    xml += `    <item>
      <g:id>${p.shopify_id || p.id}</g:id>
      <g:title><![CDATA[${p.title || 'Product'}]]></g:title>
      <g:description><![CDATA[${p.description || ''}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${p.price || 0} USD</g:price>
      <g:brand>Your Brand</g:brand>
    </item>
`;
  });
  
  xml += `  </channel>
</rss>`;
  
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    products: products.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Products loaded: ${products.length}`);
});
```

### 1.3 Deploy to Render

1. Create GitHub repository and push code
2. Go to https://render.com
3. Create **New Web Service**
4. Connect GitHub repository
5. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Deploy

**Server URL**: `https://products-7t0s.onrender.com`

---

## 🔌 Part 2: Shopify App Proxy Setup

### 2.1 Configure App Proxy in Shopify

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name: "Product Data Proxy"
4. Go to **Configuration** → **App Proxy**
5. Configure:
   - **Subpath prefix**: `apps`
   - **Subpath**: `products`
   - **Proxy URL**: `https://products-7t0s.onrender.com/proxy`
6. Save

**Result**: `https://moversus.myshopify.com/apps/products/*` → `https://products-7t0s.onrender.com/proxy/*`

---

## 📝 Part 3: Product Data Loading

### 3.1 Create Product Loading Script

**File: `load-all-products.js`**

```javascript
const https = require('https');

const SERVER_URL = 'https://products-7t0s.onrender.com';

const products = [
  {
    shopify_id: '10026814996777',
    handle: 'jj',
    title: 'AS-Motor 800 FreeRider',
    price: 8999,
    description: 'Professional riding lawn mower with 800cc engine...',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ]
  },
  {
    shopify_id: '10028654493993',
    handle: 's',
    title: 'Toro Titan ZXM5475',
    price: 12999,
    description: 'Heavy-duty zero-turn mower...',
    images: ['https://example.com/toro.jpg']
  },
  // ... add all 5 products
];

function uploadProduct(product) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(product);
    
    const options = {
      hostname: SERVER_URL.replace('https://', ''),
      path: '/admin/product',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Uploaded: ${product.title}`);
          resolve();
        } else {
          reject(`Failed: ${product.title}`);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function loadAll() {
  console.log(`📦 Loading ${products.length} products...`);
  
  for (const product of products) {
    await uploadProduct(product);
  }
  
  console.log('✅ All products loaded!');
}

loadAll();
```

Run:
```bash
node load-all-products.js
```

---

## 🎨 Part 4: Shopify Theme Snippets

### 4.1 Visible Content Injection Snippet

**File: `product-proxy-data.liquid`** (in Shopify theme snippets)

```liquid
{% comment %}
  Injects server product data into Shopify product pages
  - Fetches data from server via App Proxy
  - Updates title, price, description, images
  - Uses session caching (30s TTL)
  - Creates image carousel
{% endcomment %}

{% if template contains 'product' %}
<script>
(function() {
  const PRODUCT_ID = '{{ product.id }}';
  const PROXY_PATH = '/apps/products';
  const SHOP_DOMAIN = '{{ shop.domain }}';
  const CACHE_KEY = `product_${PRODUCT_ID}`;
  const CACHE_TTL = 30000; // 30 seconds
  
  if (!PRODUCT_ID) return;
  
  // Check session cache
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log('📦 Using cached product data');
        applyData(data);
        return;
      }
    } catch (e) {}
  }
  
  // Fetch from server
  const REQUEST_URL = `https://${SHOP_DOMAIN}${PROXY_PATH}/product/${PRODUCT_ID}`;
  
  fetch(REQUEST_URL)
    .then(res => res.ok ? res.json() : Promise.reject('Failed'))
    .then(data => {
      // Cache the data
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
      
      console.log('✅ Server data loaded:', data);
      applyData(data);
    })
    .catch(err => console.error('❌ Failed to load product:', err));
  
  function applyData(data) {
    // Update title
    const titleEl = document.querySelector('h1.product-title, .product__title, h1[itemprop="name"]');
    if (titleEl && data.title) {
      titleEl.textContent = data.title;
    }
    
    // Update price
    const priceEl = document.querySelector('.price, .product-price, [itemprop="price"]');
    if (priceEl && data.price) {
      priceEl.textContent = `$${data.price}`;
    }
    
    // Update description
    const descEl = document.querySelector('.product-description, .product__description, [itemprop="description"]');
    if (descEl && data.description) {
      descEl.innerHTML = formatDescription(data.description);
    }
    
    // Update images
    if (data.images && data.images.length > 0) {
      updateThemeImages(data.images);
      renderInjectedCarousel(data.images);
    }
  }
  
  function formatDescription(desc) {
    const lines = desc.split('\n').filter(l => l.trim());
    let html = '';
    
    lines.forEach(line => {
      line = line.trim();
      if (line.match(/^[A-Z][^:]{3,30}:$/)) {
        html += `<h3>${line}</h3>`;
      } else if (line.startsWith('•') || line.startsWith('-')) {
        html += `<li>${line.substring(1).trim()}</li>`;
      } else {
        html += `<p>${line}</p>`;
      }
    });
    
    return html;
  }
  
  function updateThemeImages(images) {
    const mainImage = document.querySelector('.product-image img, .product__media img');
    if (mainImage && images[0]) {
      mainImage.src = images[0];
      mainImage.srcset = '';
    }
  }
  
  function renderInjectedCarousel(images) {
    let container = document.querySelector('#injected-carousel');
    if (!container) {
      container = document.createElement('div');
      container.id = 'injected-carousel';
      const target = document.querySelector('.product-gallery, .product-media') || document.querySelector('.product-main');
      if (target) target.prepend(container);
    }
    
    let currentIndex = 0;
    
    container.innerHTML = `
      <style>
        #injected-carousel { position: relative; max-width: 600px; margin: 20px auto; }
        #injected-carousel img { width: 100%; height: auto; display: block; }
        #injected-carousel button { position: absolute; top: 50%; transform: translateY(-50%); 
          background: rgba(0,0,0,0.5); color: white; border: none; padding: 10px 15px; 
          cursor: pointer; font-size: 20px; }
        #injected-carousel .prev { left: 10px; }
        #injected-carousel .next { right: 10px; }
      </style>
      <img src="${images[0]}" alt="Product" />
      ${images.length > 1 ? `
        <button class="prev">‹</button>
        <button class="next">›</button>
      ` : ''}
    `;
    
    if (images.length > 1) {
      const img = container.querySelector('img');
      container.querySelector('.prev').onclick = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        img.src = images[currentIndex];
      };
      container.querySelector('.next').onclick = () => {
        currentIndex = (currentIndex + 1) % images.length;
        img.src = images[currentIndex];
      };
    }
  }
})();
</script>
{% endif %}
```

### 4.2 Schema.org Injection Snippet

**File: `product-schema-snippet.liquid`** (in Shopify theme snippets)

```liquid
{% comment %}
  Product Schema.org JSON-LD Override
  Removes Shopify's default Product schema and replaces with server data
{% endcomment %}

{% if template contains 'product' %}
<script>
// STEP 1: Remove Shopify's Product schema immediately
(function() {
  const allSchemas = document.querySelectorAll('script[type="application/ld+json"]');
  let removedCount = 0;
  
  allSchemas.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Product' || 
          (data['@id'] && data['@id'].includes('#product')) ||
          (data['@graph'] && data['@graph'].some(item => item['@type'] === 'Product'))) {
        script.remove();
        removedCount++;
      }
    } catch (e) {}
  });
  
  if (removedCount > 0) {
    console.log(`🗑️ Removed ${removedCount} Shopify Product schema(s)`);
  }
})();

// STEP 2: Inject server Product schema
(function() {
  const PRODUCT_ID = '{{ product.id }}';
  const PROXY_PATH = '/apps/products';
  const SHOP_DOMAIN = '{{ shop.domain }}';
  
  if (!PRODUCT_ID) return;
  
  fetch(`https://${SHOP_DOMAIN}${PROXY_PATH}/product/${PRODUCT_ID}`)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.title || "Product",
        "description": data.description ? data.description.substring(0, 5000) : "",
        "sku": String(data.shopify_id || data.id),
        "brand": {
          "@type": "Brand",
          "name": "{{ shop.name }}"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "USD",
          "price": String(data.price || "0"),
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "{{ shop.name }}"
          }
        }
      };
      
      if (data.images && data.images.length > 0) {
        schema.image = data.images;
      }
      
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'server-product-schema';
      schemaScript.setAttribute('data-source', 'server');
      schemaScript.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(schemaScript);
      
      console.log('✅ Server Product schema injected:', schema);
    })
    .catch(err => console.error('❌ Schema injection failed:', err));
})();
</script>
{% endif %}
```

### 4.3 Install Snippets in Theme

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. In `Snippets` folder:
   - Create `product-proxy-data.liquid` (paste content above)
   - Create `product-schema-snippet.liquid` (paste content above)
4. Open `layout/theme.liquid`
5. Add before `</head>`:
```liquid
{% render 'product-proxy-data' %}
{% render 'product-schema-snippet' %}
```
6. Save

---

## 🚫 Part 5: Disable Shopify's Default Product Schema

### 5.1 Find and Comment Out Shopify Schema

1. In theme code editor, search for: `structured_data`
2. Find files containing:
```liquid
<script type="application/ld+json">
  {{ section.settings.product | structured_data }}
</script>
```

Common locations:
- `sections/featured-product.liquid`
- `sections/featured-product-information.liquid`
- `sections/main-product.liquid`

3. Comment out EACH instance:
```liquid
{% comment %}
<script type="application/ld+json">
  {{ section.settings.product | structured_data }}
</script>
{% endcomment %}
```

4. **DO NOT** comment out Organization schema:
```liquid
<!-- KEEP THIS -->
<script type="application/ld+json">
  {
    "@type": "Organization",
    ...
  }
</script>
```

5. Save all files

---

## ✅ Part 6: Testing & Verification

### 6.1 Test Product Page

1. Visit: `https://moversus.myshopify.com/products/ls-fofo`
2. Open browser console (F12)
3. Check for:
   - ✅ `📦 Using cached product data` or `✅ Server data loaded`
   - ✅ `🗑️ Removed 1 Shopify Product schema(s)`
   - ✅ `✅ Server Product schema injected`
4. Verify visible content shows server data (not Shopify data)

### 6.2 Test Feed

Visit: `https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com`

Verify:
- ✅ Shows 5 products
- ✅ Correct titles (not product IDs)
- ✅ Correct prices (not 0.00)
- ✅ Correct product URLs with handles (jj, s, ls-fofo, etc.)

### 6.3 Test with Google Rich Results

1. Go to: https://search.google.com/test/rich-results
2. Enter: `https://moversus.myshopify.com/products/ls-fofo`
3. Check results:
   - ✅ **1 Product schema detected** (not 2 or 3)
   - ✅ Name: "Efco Tuareg 92 EVO" (not "10028641550633")
   - ✅ Price: "10999" (not "0.00")
   - ✅ Availability: "InStock" (not "OutOfStock")

---

## 🎯 Part 7: Google Merchant Center Submission

### 7.1 Submit Feed

1. Go to: https://merchants.google.com
2. Click **Products** → **Feeds**
3. Click **Add feed**
4. Settings:
   - **Country**: United States
   - **Language**: English
   - **Feed name**: "Product Feed"
   - **Input method**: "Scheduled fetch"
   - **File URL**: `https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com`
   - **Frequency**: Daily
5. Submit

### 7.2 Verify Products

Google will:
1. Fetch your feed
2. Crawl each product URL
3. Compare feed data with page content
4. Validate Schema.org data matches feed

**Expected result**: All products approved (server data matches across feed, page content, and schema)

---

## 🔄 Maintenance & Updates

### Update Product Data

**Option 1: Via Script**
```bash
node load-all-products.js
```

**Option 2: Via API**
```bash
curl -X POST https://products-7t0s.onrender.com/admin/product \
  -H "Content-Type: application/json" \
  -d '{
    "shopify_id": "10028641550633",
    "handle": "ls-fofo",
    "title": "Updated Title",
    "price": 11999,
    "description": "Updated description",
    "images": ["https://example.com/new-image.jpg"]
  }'
```

### Clear Cache
Session cache clears automatically after 30 seconds, or:
```javascript
sessionStorage.clear();
```

---

## 📊 Key URLs Reference

| Resource | URL |
|----------|-----|
| Server Health | https://products-7t0s.onrender.com/health |
| Product List | https://products-7t0s.onrender.com/admin/products |
| Single Product | https://products-7t0s.onrender.com/proxy/product/10028641550633 |
| Google Feed | https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com |
| Product Page | https://moversus.myshopify.com/products/ls-fofo |
| Rich Results Test | https://search.google.com/test/rich-results |

---

## 🎯 Success Criteria

✅ Server deployed and running (Render)  
✅ App Proxy configured (Shopify)  
✅ 5 products loaded with handles  
✅ Snippets installed (theme.liquid)  
✅ Shopify schema disabled  
✅ Visible content shows server data  
✅ Schema.org shows server data  
✅ Feed shows correct product URLs  
✅ Google Rich Results shows 1 valid Product schema  
✅ Feed submitted to Google Merchant Center  

---

## 🐛 Troubleshooting

### Issue: "Product not found"
- Check product ID matches exactly
- Verify products loaded: `curl https://products-7t0s.onrender.com/admin/products`

### Issue: Duplicate Product schemas
- Search theme for `structured_data` and comment out all instances
- Keep only Organization schema

### Issue: Wrong data showing
- Clear session cache: `sessionStorage.clear()`
- Check console for errors
- Verify App Proxy configuration

### Issue: Feed shows wrong URLs
- Update product handles in database
- Re-run `load-all-products.js`

---

## 📝 Summary

This setup successfully overrides Shopify's product data with custom server data by:

1. **Server**: Stores real product data (Node.js/Express on Render)
2. **App Proxy**: Routes requests from Shopify to server
3. **Visible Content**: JavaScript fetches and injects data into page DOM
4. **Schema.org**: JavaScript removes Shopify schema, injects server schema
5. **Feed**: XML feed with correct product data for GMC
6. **Result**: Google sees server data everywhere (page, schema, feed)

**Total time to replicate**: ~2-3 hours

---

*Last updated: March 6, 2026*
