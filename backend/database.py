import sqlite3
import json
import uuid
from datetime import datetime

DB_PATH = "products.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT DEFAULT 'shirts',
            description TEXT,
            header_image TEXT,
            images TEXT DEFAULT '[]',
            video_url TEXT DEFAULT '',
            measurements TEXT DEFAULT '{}',
            color TEXT DEFAULT '',
            sizes TEXT DEFAULT '[]',
            created_at TEXT
        )
    """)
    conn.commit()

    # Seed sample data if empty
    count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        seed_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Vintage Oversized Flannel",
                "price": 899,
                "category": "shirts",
                "description": "A classic 90s oversized flannel in deep red plaid. Made from heavyweight cotton, this piece is perfect for layering. Pre-loved with zero visible wear — just endless street cred.",
                "header_image": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
                    "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80",
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"chest": "48 in", "length": "30 in", "shoulder": "20 in", "sleeve": "26 in"}),
                "color": "Red Plaid",
                "sizes": json.dumps(["M", "L", "XL"]),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Y2K Graphic Tee — Flames",
                "price": 599,
                "category": "shirts",
                "description": "Straight from the early 2000s, this fire graphic tee features bold flame prints front and back. Made from 100% pre-shrunk cotton. One of a kind piece.",
                "header_image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"chest": "42 in", "length": "28 in", "shoulder": "18 in", "sleeve": "8 in"}),
                "color": "Black / Flame",
                "sizes": json.dumps(["S", "M", "L"]),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Washed Denim Jacket — Distressed",
                "price": 1499,
                "category": "jackets",
                "description": "Heavy acid-washed denim jacket with intentional distressing at the cuffs and collar. A wardrobe essential that gets better with age. Light inner lining, perfect for transitional weather.",
                "header_image": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
                    "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"chest": "44 in", "length": "27 in", "shoulder": "19 in", "sleeve": "25 in"}),
                "color": "Ice Blue",
                "sizes": json.dumps(["M", "L"]),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Vintage Cargo Pants — Olive",
                "price": 1199,
                "category": "pants",
                "description": "Military-grade olive cargo pants with 6 functional pockets. Heavyweight canvas fabric with a relaxed fit. Elastic waistband at back. These are built to last.",
                "header_image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"waist": "34 in", "length": "42 in", "thigh": "26 in", "hem": "18 in"}),
                "color": "Olive Green",
                "sizes": json.dumps(["M", "L", "XL"]),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Band Tee — Vintage Rock",
                "price": 749,
                "category": "shirts",
                "description": "Authentic vintage band tee from the 90s rock era. Super soft from years of wear. Screen-printed graphic with some natural fading that adds character. No holes, no stains.",
                "header_image": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
                    "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"chest": "40 in", "length": "27 in", "shoulder": "17 in", "sleeve": "7 in"}),
                "color": "Faded Black",
                "sizes": json.dumps(["S", "M"]),
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Retro Windbreaker — Neon",
                "price": 1299,
                "category": "jackets",
                "description": "80s-inspired neon windbreaker with full zip and mesh lining. Lightweight enough for summer evenings, bold enough to stop traffic. Color-blocked design in neon yellow and black.",
                "header_image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
                    "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
                ]),
                "video_url": "",
                "measurements": json.dumps({"chest": "46 in", "length": "28 in", "shoulder": "20 in", "sleeve": "26 in"}),
                "color": "Neon Yellow / Black",
                "sizes": json.dumps(["S", "M", "L", "XL"]),
                "created_at": datetime.now().isoformat()
            },
        ]
        for p in seed_products:
            conn.execute("""
                INSERT INTO products (id, name, price, category, description, header_image, images,
                    video_url, measurements, color, sizes, created_at)
                VALUES (:id, :name, :price, :category, :description, :header_image, :images,
                    :video_url, :measurements, :color, :sizes, :created_at)
            """, p)
        conn.commit()
    conn.close()


def row_to_dict(row):
    d = dict(row)
    for field in ["images", "measurements", "sizes"]:
        try:
            d[field] = json.loads(d[field]) if d[field] else ([] if field != "measurements" else {})
        except Exception:
            d[field] = [] if field != "measurements" else {}
    return d
