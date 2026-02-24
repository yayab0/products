const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'products.json');

// Middleware
app.use(express.json());
app.use(cors());

// ---------- Persistence ----------
function defaultProducts() {
  return {
    '123': {
      id: '123',
      shopify_id: '123',
      title: 'Premium Product',
      description: 'High-quality product with exclusive features',
      price: '99.99',
      category: 'General',
      images: ['https://via.placeholder.com/800'],
      variants: [
        { id: 'v1', title: 'Small', price: '99.99', available: true },
        { id: 'v2', title: 'Large', price: '129.99', available: true }
      ]
    }
  };
}

function loadProducts() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    console.error('❌ Failed to load products.json:', err.message);
  }
  return defaultProducts();
}

function saveProducts() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Failed to save products.json:', err.message);
  }
}

// Persistent product database
const products = loadProducts();

// ===== SHOPIFY APP PROXY VERIFICATION =====
function verifyShopifyProxy(req) {
  const { signature, ...params } = req.query;
  if (!signature) return false;

  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('');

  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_APP_SECRET || 'your-app-secret-here')
    .update(queryString)
    .digest('hex');

  return hash === signature;
}

// ===== PROXY MIDDLEWARE =====
app.use('/proxy', (req, res, next) => {
  const isWrite = req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT';
  if (process.env.NODE_ENV === 'production' && isWrite && !verifyShopifyProxy(req)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid signature' });
  }
  next();
});

// ===== PROXY ENDPOINTS =====
app.get('/proxy/product/:shopify_id', (req, res) => {
  const product = Object.values(products).find(
    p => p.shopify_id === req.params.shopify_id
  );

  if (product) {
    return res.json(product);
  } else {
    return res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/proxy/products', (req, res) => {
  const list = Object.values(products);
  res.json({
    products: list,
    count: list.length
  });
});

app.post('/proxy/product', (req, res) => {
  const { shopify_id, title, description, price, images, variants, category } = req.body;

  if (!shopify_id) {
    return res.status(400).json({ error: 'shopify_id required' });
  }

  products[shopify_id] = {
    id: shopify_id,
    shopify_id,
    title,
    description,
    price,
    category: category || '',
    images: images || [],
    variants: variants || [],
    updated_at: new Date().toISOString()
  };

  saveProducts();
  res.json({ success: true, product: products[shopify_id] });
});

app.delete('/proxy/product/:shopify_id', (req, res) => {
  if (products[req.params.shopify_id]) {
    delete products[req.params.shopify_id];
    saveProducts();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/proxy/health', (req, res) => {
  res.json({
    status: 'ok',
    products: Object.keys(products).length,
    timestamp: new Date().toISOString()
  });
});

// ===== ADMIN ENDPOINTS =====
app.get('/admin/products', (req, res) => {
  res.json({ products: Object.values(products) });
});

app.post('/admin/product', (req, res) => {
  const { shopify_id, title, description, price, images, variants, category } = req.body;

  if (!shopify_id) {
    return res.status(400).json({ error: 'shopify_id required' });
  }

  products[shopify_id] = {
    id: shopify_id,
    shopify_id,
    title,
    description,
    price,
    category: category || '',
    images: images || [],
    variants: variants || [],
    updated_at: new Date().toISOString()
  };

  saveProducts();
  res.json({ success: true, product: products[shopify_id] });
});

// ===== GOOGLE SHEETS SYNC =====
app.post('/admin/sync-sheet', async (req, res) => {
  const { sheet_url } = req.body;
  const url = sheet_url || process.env.GOOGLE_SHEET_CSV_URL;

  if (!url) {
    return res.status(400).json({ error: 'sheet_url required in body or set GOOGLE_SHEET_CSV_URL env var' });
  }

  await syncSheet(url);
  res.json({ success: true, products_count: Object.keys(products).length });
});

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// CSV parser with multiline quoted field support
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuote && next === '"') {
        field += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && next === '\n') i++;
      row.push(field);
      field = '';
      if (row.some(cell => cell.length > 0)) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function syncSheet(url) {
  try {
    const csvText = await fetchURL(url);
    const rows = parseCSV(csvText);
    if (rows.length < 2) return;

    const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
    let count = 0;

    rows.slice(1).forEach((r) => {
      const get = (col) => {
        const idx = headers.indexOf(col);
        return idx >= 0 ? String(r[idx] || '').trim() : '';
      };

      const shopify_id = get('shopify_id');
      if (!shopify_id) return;

      const imagesRaw = get('images');
      const images = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      let variants = [];
      const variantsRaw = get('variants');
      if (variantsRaw) {
        try { variants = JSON.parse(variantsRaw); } catch (_) {}
      }

      products[shopify_id] = {
        id: shopify_id,
        shopify_id,
        title: get('title'),
        description: get('description'),
        price: get('price'),
        category: get('category'),
        images,
        variants,
        synced_at: new Date().toISOString()
      };
      count++;
    });

    saveProducts();
    console.log(`✅ Sheet sync: ${count} products updated at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error('❌ Sheet sync failed:', err.message);
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify App Proxy Server',
    endpoints: {
      proxy: '/proxy/*',
      admin: '/admin/*',
      health: '/proxy/health'
    },
    products_count: Object.keys(products).length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Products loaded: ${Object.keys(products).length}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Persistence file: ${DB_PATH}`);

  // ensure file exists on first boot
  saveProducts();

  const SHEET_URL = process.env.GOOGLE_SHEET_CSV_URL;
  if (SHEET_URL) {
    console.log('📊 Google Sheet auto-sync enabled');
    syncSheet(SHEET_URL);
    setInterval(() => syncSheet(SHEET_URL), 5 * 60 * 1000);
  } else {
    console.log('⚠️ No GOOGLE_SHEET_CSV_URL set — auto-sync disabled');
  }
});
