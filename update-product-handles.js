#!/usr/bin/env node
/**
 * Update product handles to match actual Shopify URLs
 */

const SERVER_URL = 'https://products-7t0s.onrender.com';

// Map of product IDs to their correct Shopify handles
const PRODUCT_HANDLES = {
  '10026814996777': 'jj',           // AS-Motor 800 FreeRider
  '10028654493993': 's',            // Toro Titan ZXM5475
  '10028641550633': 'ls-fofo',      // Efco Tuareg 92 EVO
  '10028650365225': 'package-1',    // Husqvarna P 524X EFI
  '10028648825129': 'lols',         // Cub Cadet Z5 152
};

async function updateProductHandles() {
  const https = require('https');
  
  // Fetch current products
  const response = await fetch(`${SERVER_URL}/proxy/products`);
  const data = await response.json();
  
  console.log(`\n📦 Found ${data.products.length} products\n`);
  
  for (const product of data.products) {
    const handle = PRODUCT_HANDLES[product.shopify_id];
    
    if (!handle) {
      console.log(`⚠️  No handle mapping for product ${product.shopify_id}: "${product.title}"`);
      console.log(`   Current URL: https://moversus.myshopify.com/products/${slugify(product.title)}`);
      console.log(`   You need to find the correct Shopify handle\n`);
      continue;
    }
    
    // Update product with handle
    const updateData = {
      ...product,
      handle: handle
    };
    
    const updateResponse = await fetch(`${SERVER_URL}/admin/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      console.log(`✅ Updated ${product.shopify_id}: ${product.title}`);
      console.log(`   URL: https://moversus.myshopify.com/products/${handle}\n`);
    } else {
      console.log(`❌ Failed to update ${product.shopify_id}`);
    }
  }
  
  console.log('\n✅ Done!\n');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

updateProductHandles().catch(console.error);
