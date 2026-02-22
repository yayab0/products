const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory product database (replace with real DB in production)
const products = {
  '123': {
    id: '123',
    shopify_id: '123',
    title: 'Premium Product',
    description: 'High-quality product with exclusive features',
    price: '99.99',
    images: ['https://via.placeholder.com/800'],
    variants: [
      { id: 'v1', title: 'Small', price: '99.99', available: true },
      { id: 'v2', title: 'Large', price: '129.99', available: true }
    ]
  }
};

// ===== SHOPIFY APP PROXY VERIFICATION =====
function verifyShopifyProxy(req) {
  const { signature, ...params } = req.query;
  
  if (!signature) return false;
  
  // Build sorted query string (Shopify's signing method)
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('');
  
  // Calculate HMAC with your app's secret
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_APP_SECRET || 'your-app-secret-here')
    .update(queryString)
    .digest('hex');
  
  return hash === signature;
}

// ===== PROXY MIDDLEWARE =====
app.use('/proxy', (req, res, next) => {
  // GET requests are read-only product data — safe without signature
  // Only verify signature for write operations (POST/DELETE)
  const isWrite = req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT';
  if (process.env.NODE_ENV === 'production' && isWrite && !verifyShopifyProxy(req)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid signature' });
  }
  next();
});

// ===== PROXY ENDPOINTS =====

// Get single product by Shopify ID
app.get('/proxy/product/:shopify_id', (req, res) => {
  const product = Object.values(products).find(
    p => p.shopify_id === req.params.shopify_id
  );
  
  if (product) {
    console.log('✅ Product found:', product.id);
    res.json(product);
  } else {
    console.log('❌ Product not found:', req.params.shopify_id);
    res.status(404).json({ error: 'Product not found' });
  }
});

// List all products
app.get('/proxy/products', (req, res) => {
  console.log('✅ Listing all products:', Object.keys(products).length);
  res.json({ 
    products: Object.values(products),
    count: Object.values(products).length
  });
});

// Add or update product
app.post('/proxy/product', (req, res) => {
  const { shopify_id, title, description, price, images, variants } = req.body;
  
  if (!shopify_id) {
    return res.status(400).json({ error: 'shopify_id required' });
  }
  
  products[shopify_id] = {
    id: shopify_id,
    shopify_id,
    title,
    description,
    price,
    images: images || [],
    variants: variants || [],
    updated_at: new Date().toISOString()
  };
  
  console.log('✅ Product saved:', shopify_id);
  res.json({ success: true, product: products[shopify_id] });
});

// Delete product
app.delete('/proxy/product/:shopify_id', (req, res) => {
  if (products[req.params.shopify_id]) {
    delete products[req.params.shopify_id];
    console.log('✅ Product deleted:', req.params.shopify_id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Health check
app.get('/proxy/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    products: Object.keys(products).length,
    timestamp: new Date().toISOString()
  });
});

// ===== ADMIN ENDPOINTS (for managing products) =====

// Admin: List products (no signature required)
app.get('/admin/products', (req, res) => {
  res.json({ products: Object.values(products) });
});

// Admin: Add product
app.post('/admin/product', (req, res) => {
  const { shopify_id, title, description, price, images, variants } = req.body;
  
  if (!shopify_id) {
    return res.status(400).json({ error: 'shopify_id required' });
  }
  
  products[shopify_id] = {
    id: shopify_id,
    shopify_id,
    title,
    description,
    price,
    images: images || [],
    variants: variants || [],
    created_at: new Date().toISOString()
  };
  
  res.json({ success: true, product: products[shopify_id] });
});

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
});
