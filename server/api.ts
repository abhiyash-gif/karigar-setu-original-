import { Router } from 'express';
import { db } from './db.js';
import { INITIAL_PRODUCTS, INITIAL_BUYER_ENQUIRIES } from '../src/data/demoProducts.js';

export const apiRouter = Router();

const CURRENT_KARIGAR = 'karigar_1';

export function seedDemoData() {
  const prodCount = db.prepare('SELECT count(*) as count FROM products').get() as any;
  if (prodCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, karigar_id, name, hindi_name, category, material, craft_type, colour,
        dimensions, weight, production_time, region, handmade, gi_tagged,
        short_description, description, hindi_description, story, hindi_story,
        artisan_note, price, price_range_min, price_range_max,
        pricing_material_cost, pricing_labour_hours, pricing_hourly_rate,
        pricing_other_cost, pricing_margin, pricing_confidence, pricing_rationale,
        tags, status, views, enquiries, image, enhanced_image, before_after_comparison
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    INITIAL_PRODUCTS.forEach(p => {
      insertProduct.run(
        p.id, CURRENT_KARIGAR, p.name, p.hindiName || '', p.category, p.material, p.craftType, p.colour,
        p.dimensions, p.weight, p.productionTime, p.region, p.handmade ? 1 : 0, p.giTagged ? 1 : 0,
        p.shortDescription, p.description, p.hindiDescription || '', p.story, p.hindiStory || '',
        p.artisanNote || '', p.price, p.priceRange.min, p.priceRange.max,
        p.pricingBreakdown.materialCost, p.pricingBreakdown.labourHours, p.pricingBreakdown.hourlyRate,
        p.pricingBreakdown.otherCost, p.pricingBreakdown.recommendedMargin, p.pricingConfidence, p.pricingRationale,
        JSON.stringify(p.tags), p.status, p.views, p.enquiries, p.image, p.enhancedImage || '', p.beforeAfterComparison ? 1 : 0
      );
    });

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, buyer_id, karigar_id, product_id, product_name, quantity, total, status,
        buyer_name, buyer_type, buyer_location, message, payment_status, delivery_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    INITIAL_BUYER_ENQUIRIES.forEach(e => {
      insertOrder.run(
        e.id, 'buyer_1', CURRENT_KARIGAR, e.productId, e.productName, e.quantityRequested,
        e.offeredPricePerUnit ? e.offeredPricePerUnit * e.quantityRequested : 0,
        e.status, e.buyerName, e.buyerType, e.buyerLocation, e.message,
        'Pending', 'Retail Address'
      );
    });
  }
}

// AUTH
apiRouter.post('/auth/register', (req, res) => res.json({ success: true }));
apiRouter.post('/auth/login', (req, res) => res.json({ success: true }));
apiRouter.post('/auth/logout', (req, res) => res.json({ success: true }));
apiRouter.get('/auth/me', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(CURRENT_KARIGAR);
  res.json({ success: true, user });
});

// PRODUCTS
apiRouter.get('/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE karigar_id = ? AND status != ?').all(CURRENT_KARIGAR, 'Draft');
  products.forEach((p: any) => p.tags = p.tags ? JSON.parse(p.tags) : []);
  res.json(products);
});

apiRouter.get('/products/drafts', (req, res) => {
  const drafts = db.prepare('SELECT * FROM products WHERE karigar_id = ? AND status = ?').all(CURRENT_KARIGAR, 'Draft');
  drafts.forEach((d: any) => d.tags = d.tags ? JSON.parse(d.tags) : []);
  res.json(drafts);
});

apiRouter.get('/products/drafts/current', (req, res) => {
  const draft = db.prepare('SELECT * FROM products WHERE id = ? AND karigar_id = ?').get('current_draft', CURRENT_KARIGAR) as any;
  if (draft) {
    draft.tags = draft.tags ? JSON.parse(draft.tags) : [];
  }
  res.json(draft || { empty: true });
});

apiRouter.put('/products/drafts/current', (req, res) => {
  const p = req.body;
  const id = 'current_draft';
  
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  
  const stmt = db.prepare(`
    INSERT INTO products (
      id, karigar_id, name, hindi_name, category, material, craft_type, colour,
      dimensions, weight, production_time, region, handmade, gi_tagged,
      short_description, description, hindi_description, story, hindi_story,
      artisan_note, price, price_range_min, price_range_max,
      pricing_material_cost, pricing_labour_hours, pricing_hourly_rate,
      pricing_other_cost, pricing_margin, pricing_confidence, pricing_rationale,
      tags, status, image, enhanced_image
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  try {
    stmt.run(
      id, CURRENT_KARIGAR, p.name || 'Untitled Draft', p.hindiName || '', p.category || '', p.material || '',
      p.craftType || '', p.colour || '', p.dimensions || '', p.weight || '',
      p.productionTime || '', p.region || '', p.handmade ? 1 : 0, p.giTagged ? 1 : 0,
      p.shortDescription || '', p.description || '', p.hindiDescription || '', p.story || '', p.hindiStory || '',
      p.artisanNote || '', p.price || 0, p.priceRange?.min || 0, p.priceRange?.max || 0,
      p.pricingBreakdown?.materialCost || 0, p.pricingBreakdown?.labourHours || 0, p.pricingBreakdown?.hourlyRate || 0,
      p.pricingBreakdown?.otherCost || 0, p.pricingBreakdown?.recommendedMargin || 0, p.pricingConfidence || 'Medium', p.pricingRationale || '',
      JSON.stringify(p.tags || []), 'Draft', p.image || '', p.enhancedImage || ''
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


apiRouter.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (product) product.tags = product.tags ? JSON.parse(product.tags) : [];
  res.json(product || { error: 'Not found' });
});

apiRouter.post('/products', (req, res) => {
  const p = req.body;
  const id = 'prod_' + Date.now();
  
  const stmt = db.prepare(`
    INSERT INTO products (
      id, karigar_id, name, hindi_name, category, material, craft_type, colour,
      dimensions, weight, production_time, region, handmade, gi_tagged,
      short_description, description, hindi_description, story, hindi_story,
      artisan_note, price, price_range_min, price_range_max,
      pricing_material_cost, pricing_labour_hours, pricing_hourly_rate,
      pricing_other_cost, pricing_margin, pricing_confidence, pricing_rationale,
      tags, status, views, enquiries, image, enhanced_image, before_after_comparison
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  try {
    stmt.run(
      id, CURRENT_KARIGAR, p.name || 'Untitled', p.hindiName || '', p.category || '', p.material || '',
      p.craftType || '', p.colour || '', p.dimensions || '', p.weight || '',
      p.productionTime || '', p.region || '', p.handmade ? 1 : 0, p.giTagged ? 1 : 0,
      p.shortDescription || '', p.description || '', p.hindiDescription || '', p.story || '', p.hindiStory || '',
      p.artisanNote || '', p.price || 0, p.priceRange?.min || 0, p.priceRange?.max || 0,
      p.pricingBreakdown?.materialCost || 0, p.pricingBreakdown?.labourHours || 0, p.pricingBreakdown?.hourlyRate || 0,
      p.pricingBreakdown?.otherCost || 0, p.pricingBreakdown?.recommendedMargin || 0, p.pricingConfidence || 'Medium', p.pricingRationale || '',
      JSON.stringify(p.tags || []), p.status || 'Published', 0, 0, p.image || '', p.enhancedImage || '', p.beforeAfterComparison ? 1 : 0
    );
    // if published from draft, delete current_draft
    db.prepare('DELETE FROM products WHERE id = ?').run('current_draft');
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/products/drafts', (req, res) => {
  const p = req.body;
  const id = 'draft_' + Date.now();
  const stmt = db.prepare(`
    INSERT INTO products (
      id, karigar_id, name, status, image, category, material, price, tags, description, short_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(
      id, CURRENT_KARIGAR, p.name || 'Untitled Draft', 'Draft', p.image || '', p.category || '',
      p.material || '', p.price || 0, JSON.stringify(p.tags || []), p.description || '', p.shortDescription || ''
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/products/:id', (req, res) => res.json({ success: true }));

apiRouter.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ? AND karigar_id = ?').run(req.params.id, CURRENT_KARIGAR);
  res.json({ success: true });
});

apiRouter.delete('/products/drafts/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ? AND karigar_id = ?').run(req.params.id, CURRENT_KARIGAR);
  res.json({ success: true });
});

apiRouter.post('/products/:id/publish', (req, res) => {
  db.prepare('UPDATE products SET status = ? WHERE id = ?').run('Published', req.params.id);
  res.json({ success: true });
});

apiRouter.post('/products/:id/images', (req, res) => res.json({ success: true }));

// ORDERS
apiRouter.get('/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE karigar_id = ?').all(CURRENT_KARIGAR);
  res.json(orders);
});

apiRouter.post('/orders', (req, res) => {
  const o = req.body;
  const id = 'ord_' + Date.now();
  db.prepare(`
    INSERT INTO orders (
      id, buyer_id, karigar_id, product_id, product_name, quantity, total, status,
      buyer_name, buyer_type, buyer_location, message, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, 'buyer_1', CURRENT_KARIGAR, o.productId, o.productName, o.quantity || 1, o.total || 0, 'Pending',
    o.buyerName, o.buyerType, o.buyerLocation, o.message, new Date().toISOString()
  );
  res.json({ success: true, id });
});

apiRouter.put('/orders/:id/status', (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

// SELL DIRECT
apiRouter.get('/store/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE status = ?').all('Published');
  products.forEach((p: any) => p.tags = p.tags ? JSON.parse(p.tags) : []);
  res.json(products);
});

apiRouter.get('/store/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(req.params.id, 'Published') as any;
  if (product) product.tags = product.tags ? JSON.parse(product.tags) : [];
  res.json(product || { error: 'Not found' });
});

// ANALYTICS
apiRouter.get('/analytics/karigar', (req, res) => {
  const totalOrders = db.prepare('SELECT count(*) as count FROM orders WHERE karigar_id = ?').get(CURRENT_KARIGAR) as any;
  const totalRevenue = db.prepare('SELECT sum(total) as revenue FROM orders WHERE karigar_id = ? AND status = ?').get(CURRENT_KARIGAR, 'Accepted') as any;
  res.json({
    orders: totalOrders.count,
    revenue: totalRevenue.revenue || 0
  });
});
