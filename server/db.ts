import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'karigar_setu.db');
export const db = new Database(dbPath);

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      preferred_language TEXT DEFAULT 'en',
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      karigar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      hindi_name TEXT,
      category TEXT,
      material TEXT,
      craft_type TEXT,
      colour TEXT,
      dimensions TEXT,
      weight TEXT,
      production_time TEXT,
      region TEXT,
      handmade BOOLEAN,
      gi_tagged BOOLEAN,
      short_description TEXT,
      description TEXT,
      hindi_description TEXT,
      story TEXT,
      hindi_story TEXT,
      artisan_note TEXT,
      price REAL NOT NULL,
      price_range_min REAL,
      price_range_max REAL,
      pricing_material_cost REAL,
      pricing_labour_hours REAL,
      pricing_hourly_rate REAL,
      pricing_other_cost REAL,
      pricing_margin REAL,
      pricing_confidence TEXT,
      pricing_rationale TEXT,
      tags TEXT,
      status TEXT,
      views INTEGER DEFAULT 0,
      enquiries INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 0,
      image TEXT,
      enhanced_image TEXT,
      before_after_comparison BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(karigar_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT,
      karigar_id TEXT,
      product_id TEXT,
      product_name TEXT,
      quantity INTEGER,
      total REAL,
      status TEXT,
      buyer_name TEXT,
      buyer_type TEXT,
      buyer_location TEXT,
      message TEXT,
      payment_status TEXT,
      delivery_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      karigar_id TEXT,
      product_id TEXT,
      event_type TEXT,
      revenue REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const checkUser = db.prepare('SELECT count(*) as count FROM users WHERE id = ?').get('karigar_1') as any;
  if (checkUser.count === 0) {
    db.prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)').run('karigar_1', 'Demo Karigar', 'Karigar');
    db.prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)').run('buyer_1', 'Demo Buyer', 'Buyer');
    db.prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)').run('admin_1', 'Admin', 'Admin');
  }
}
