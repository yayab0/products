#!/usr/bin/env node
/**
 * Load all 5 mower products into the server
 */

const SERVER_URL = 'https://products-7t0s.onrender.com';

const PRODUCTS = [
  {
    shopify_id: '10026814996777',
    handle: 'jj',
    title: 'AS-Motor 800 FreeRider – Modell 2025',
    price: '5660.96',
    category: 'Movers',
    description: `The AS‑Motor 800 FreeRider is a high-performance ride-on mower built to tackle demanding terrain, large parcels of grass, and challenging mowing conditions with ease. Designed for users who require both power and agility—think expansive estates, steep slopes, rough grass and larger garden areas—this 2025 model emphasizes durability, operator comfort, and efficient mowing.

At its heart, the machine features a powerful single-cylinder petrol engine with a displacement of 344 cm³ and rated output of approximately 7.6 kW (10.3 hp) under standard conditions, and a maximum engine output of around 9.7 kW (13 hp) under heavy load. This engine combined with a hydrostatic variable transmission gives the FreeRider the ability to mow wide swathes of grass and keep steady pace even on uneven terrain.

The cutting deck of the 800 FreeRider is 80 cm wide, offering sizeable coverage in each pass and helping reduce total mowing time. The deck incorporates a closed mulching-style design with cross-blades, which allows for both rear discharge and mulching of grass clippings depending on your preference or lawn condition. Mowing height is centrally adjustable in 4 positions from approx 35 mm up to around 85 mm, enabling you to vary your lawn's finish—from a shorter manicured cut to a longer, more natural look.

Key Features
Single-cylinder petrol engine, 344 cm³ displacement, rated ~7.6 kW (10.3 hp), max output ~9.7 kW (13 hp)
Wide 80 cm cutting deck with cross-blade/mulch capability
Cutting height adjustment: centrally from ~35 mm to ~85 mm (4 positions)
Hydrostatic infinite transmission (forward up to ~8 km/h, reverse up to ~6 km/h)
Switchable differential lock for improved traction on slopes or uneven ground
Low-centre-of-gravity design, narrow width for its class (approx 87 cm)
Length-adjustable seat for operator comfort over extended use
Tank capacity about 15 litres to support longer mowing sessions`,
    images: [
      'https://seakundi.com/wp-content/uploads/2025/11/1-21-1.jpg',
      'https://seakundi.com/wp-content/uploads/2025/11/2-23-1.webp',
      'https://seakundi.com/wp-content/uploads/2025/11/3-15-1.webp'
    ]
  },
  {
    shopify_id: '10028654493993',
    handle: 's',
    title: 'Toro Titan ZXM5475 Professional Grade Zero Turn Riding Mower',
    price: '4602.30',
    category: 'Movers',
    description: `Product Overview
The Toro Titan ZXM5475 Professional Grade Zero Turn Riding Mower is a high-performance mowing machine engineered for commercial landscapers, large-property owners, and demanding mowing tasks. Designed by Toro, the Titan ZXM5475 combines professional-grade durability, powerful cutting performance, and precise zero-turn manoeuvrability to deliver exceptional productivity and finish quality.

Key Features
Professional-grade zero-turn riding mower for commercial use
Heavy-duty cutting deck engineered for durability and precision
Powerful engine delivering consistent performance under load
Tight turn radius enabled by zero-turn steering system
Adjustable cutting height for customised lawn finishes
High-capacity fuel system for extended operation
Comfortable operator seating and intuitive controls`,
    images: [
      'https://seakundi.com/wp-content/uploads/2026/02/Titan_ZXM5475-3.png',
      'https://seakundi.com/wp-content/uploads/2026/02/Titan_ZXM5475-2.png',
      'https://seakundi.com/wp-content/uploads/2026/02/Titan_ZXM5475_06bd14e6-0fd8-4a2a-97b5-6d91e6368a1f.png'
    ]
  },
  {
    shopify_id: '10028641550633',
    handle: 'ls-fofo',
    title: 'Efco Tuareg 92 EVO – Modell 2025',
    price: '5950.96',
    category: 'Movers',
    description: `The Efco Tuareg 92 EVO (Model 2025) is a robust, professional-grade garden tractor designed for demanding mowing tasks on large areas, rough terrain, or steep slopes. Built for efficiencies, comfort, and durability, this machine is ideal if you require serious performance for big lawns, estates, or rugged outdoor spaces.

Powered by a large displacement V-Twin petrol engine (ranging in different regions typically from around 570 cm³ up to 708 cm³ depending on specification) the Tuareg 92 EVO delivers substantial power for cutting wide swathes of turf, handling thick grass and maintaining speed even under load.

Key Features
High-capacity V-Twin petrol engine (approx. 570–708 cm³ depending on region) for full-sized mowing demands
Wide 92 cm cutting deck for efficient large-area coverage
Adjustable cutting height (typically around 50–120 mm in six positions) for flexible lawn finishes
Hydrostatic transmission with self-locking differential for traction and control on slopes and uneven ground
Compact turning radius (around 65 cm) for better manoeuvring around obstacles`,
    images: [
      'https://seakundi.com/wp-content/uploads/2025/11/efco-Tuareg-92-EVO-BS-Vanguard-hochgrasmaeher-403-68129001_01.png',
      'https://seakundi.com/wp-content/uploads/2025/11/Efco-Tuareg-92-EMAK-24KH-Hochgrasmaeher_4.jpg',
      'https://seakundi.com/wp-content/uploads/2025/11/Efco-Tuareg-92-EMAK-24KH-Hochgrasmaeher_5.jpg',
      'https://seakundi.com/wp-content/uploads/2025/11/Efco-Tuareg-92-EMAK-24KH-Hochgrasmaeher_3.jpg',
      'https://seakundi.com/wp-content/uploads/2025/11/Efco-Tuareg-92-EVO_3.jpg'
    ]
  },
  {
    shopify_id: '10028650365225',
    handle: 'package-1',
    title: 'Husqvarna P 524X EFI Ride-On Mower',
    price: '10100',
    category: 'Movers',
    description: `Product Overview
The Husqvarna P 524X EFI Ride-On Mower is a high-performance, commercial-grade front mower designed for professional grounds maintenance and demanding large-area mowing. Engineered by Husqvarna, this model combines advanced engine technology, exceptional manoeuvrability, and rugged construction to deliver outstanding productivity and reliability.

Key Features
Commercial-grade ride-on mower for intensive professional use
EFI petrol engine for efficient fuel consumption and reliable starting
Front-mounted cutting deck for maximum visibility and precision
Articulated steering system for tight turns and excellent manoeuvrability
Robust chassis designed for long-term heavy-duty operation
Adjustable cutting height for versatile grass management`,
    images: [
      'https://seakundi.com/wp-content/uploads/2026/02/pp-435189.png',
      'https://seakundi.com/wp-content/uploads/2026/02/qc-547684.png',
      'https://seakundi.com/wp-content/uploads/2026/02/xs-767260.png',
      'https://seakundi.com/wp-content/uploads/2026/02/wd-787295.png',
      'https://seakundi.com/wp-content/uploads/2026/02/ee-079573.jpg'
    ]
  },
  {
    shopify_id: '10028648825129',
    handle: 'lols',
    title: 'Cub Cadet Z5 152 Zero-Turn Ride-On Mower – Ex Demo',
    price: '8798.00',
    category: 'Movers',
    description: `Product Overview
The Cub Cadet Z5 152 Zero-Turn Ride-On Mower – Ex Demo is a premium, high-performance lawn care machine designed for large residential properties and professional-grade mowing applications. Built by Cub Cadet, this zero-turn mower combines advanced cutting technology, exceptional manoeuvrability, and operator comfort to deliver outstanding mowing efficiency and finish quality.

Key Features
Zero-turn steering for precise control and tight turning radius
Wide 152 cm cutting deck for fast coverage of large areas
High-performance engine designed for demanding mowing tasks
Robust frame and chassis for durability and stability
Adjustable cutting height for customised lawn finishes
Ergonomic operator seat for comfort during extended use`,
    images: [
      'https://seakundi.com/wp-content/uploads/2026/02/cub-cadet-z5-152.png'
    ]
  }
];

async function loadAllProducts() {
  console.log(`\n🚀 Loading ${PRODUCTS.length} products to server...\n`);
  
  for (const product of PRODUCTS) {
    try {
      const response = await fetch(`${SERVER_URL}/admin/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          variants: [],
          updated_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log(`✅ Loaded: ${product.title}`);
        console.log(`   URL: https://moversus.myshopify.com/products/${product.handle}\n`);
      } else {
        console.log(`❌ Failed: ${product.title}`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${product.title}:`, error.message);
    }
  }
  
  console.log('\n✅ All products loaded!\n');
  console.log('Feed URL: https://products-7t0s.onrender.com/feed/google-shopping.xml?domain=moversus.myshopify.com\n');
}

loadAllProducts().catch(console.error);
