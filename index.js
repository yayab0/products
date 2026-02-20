const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory product database
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

// Verify Shopify signature
function verifyShopifyProxy(req) {
  const { signature, ...params } = req.query;
  
  if (!signature) return false;
  
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('');
  
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_APP_SECRET || 'dev-secret')
    .update(queryString)
    .digest('hex');
  
  return hash === signature;
}

// Proxy middleware
app.use('/proxy', (req, res, next) => {
  console.log('📥 Proxy request:', req.path);
  
  // Skip verification for health check
  if (req.path === '/health') {
    return next();
  }
  
  // Skip verification in dev mode or if no secret set
  if (process.env.SHOPIFY_APP_SECRET && !verifyShopifyProxy(req)) {
    console.log('❌ Invalid signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});

// PROXY ENDPOINTS
app.get('/proxy/product/:shopify_id', (req, res) => {
  const product = Object.values(products).find(
    p => p.shopify_id === req.params.shopify_id
  );
  
  if (product) {
    console.log('✅ Product found:', product.id);
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/proxy/products', (req, res) => {
  res.json({ 
    products: Object.values(products),
    count: Object.values(products).length
  });
});

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
  
  res.json({ success: true, product: products[shopify_id] });
});

app.delete('/proxy/product/:shopify_id', (req, res) => {
  if (products[req.params.shopify_id]) {
    delete products[req.params.shopify_id];
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

// ADMIN ENDPOINTS
app.get('/admin/products', (req, res) => {
  res.json({ products: Object.values(products) });
});

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

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Shopify App Proxy Server - Running on Replit',
    endpoints: {
      proxy: '/proxy/*',
      admin: '/admin/*',
      health: '/proxy/health'
    },
    products_count: Object.keys(products).length,
    replit_url: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'Not on Replit'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Products loaded: ${Object.keys(products).length}`);
  if (process.env.REPL_SLUG) {
    console.log(`🔗 Replit URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
});
