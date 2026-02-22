-- Run this in the Supabase SQL Editor to create your products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT DEFAULT 'shirts',
    description TEXT,
    header_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT DEFAULT '',
    measurements JSONB DEFAULT '{}'::jsonb,
    color TEXT DEFAULT '',
    sizes JSONB DEFAULT '[]'::jsonb,
    condition TEXT DEFAULT 'Good',
    coupon_code TEXT DEFAULT '',
    discount_amount REAL DEFAULT 0,
    created_at TEXT
);
