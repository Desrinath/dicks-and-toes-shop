import os
import json
import uuid
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_headers():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase credentials not found in environment variables.")
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def init_db():
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("WARNING: Missing Supabase credentials. Seed skipped.")
            return

        # Check if table has data via REST
        endpoint = f"{SUPABASE_URL}/rest/v1/products?select=id&limit=1"
        response = requests.get(endpoint, headers=get_headers())
        
        if response.status_code == 200 and len(response.json()) == 0:
            print("Seeding Supabase with default products via REST API...")
            seed_products = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Vintage Oversized Flannel",
                    "price": 899,
                    "category": "shirts",
                    "description": "A classic 90s oversized flannel in deep red plaid. Made from heavyweight cotton, this piece is perfect for layering. Pre-loved with zero visible wear — just endless street cred.",
                    "header_image": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
                    "images": [
                        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
                        "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80",
                        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
                    ],
                    "video_url": "",
                    "measurements": {"chest": "48 in", "length": "30 in", "shoulder": "20 in", "sleeve": "26 in"},
                    "color": "Red Plaid",
                    "sizes": ["M", "L", "XL"],
                    "condition": "Good",
                    "coupon_code": "",
                    "discount_amount": 0,
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Y2K Graphic Tee — Flames",
                    "price": 599,
                    "category": "shirts",
                    "description": "Straight from the early 2000s, this fire graphic tee features bold flame prints front and back. Made from 100% pre-shrunk cotton. One of a kind piece.",
                    "header_image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                    "images": [
                        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
                        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
                    ],
                    "video_url": "",
                    "measurements": {"chest": "42 in", "length": "28 in", "shoulder": "18 in", "sleeve": "8 in"},
                    "color": "Black / Flame",
                    "sizes": ["S", "M", "L"],
                    "condition": "Good",
                    "coupon_code": "",
                    "discount_amount": 0,
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Washed Denim Jacket — Distressed",
                    "price": 1499,
                    "category": "jackets",
                    "description": "Heavy acid-washed denim jacket with intentional distressing at the cuffs and collar. A wardrobe essential that gets better with age. Light inner lining, perfect for transitional weather.",
                    "header_image": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
                    "images": [
                        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
                        "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
                    ],
                    "video_url": "",
                    "measurements": {"chest": "44 in", "length": "27 in", "shoulder": "19 in", "sleeve": "25 in"},
                    "color": "Ice Blue",
                    "sizes": ["M", "L"],
                    "condition": "Good",
                    "coupon_code": "",
                    "discount_amount": 0,
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Vintage Cargo Pants — Olive",
                    "price": 1199,
                    "category": "pants",
                    "description": "Military-grade olive cargo pants with 6 functional pockets. Heavyweight canvas fabric with a relaxed fit. Elastic waistband at back. These are built to last.",
                    "header_image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
                    "images": [
                        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
                        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
                    ],
                    "video_url": "",
                    "measurements": {"waist": "34 in", "length": "42 in", "thigh": "26 in", "hem": "18 in"},
                    "color": "Olive Green",
                    "sizes": ["M", "L", "XL"],
                    "condition": "Good",
                    "coupon_code": "",
                    "discount_amount": 0,
                    "created_at": datetime.now().isoformat()
                },
            ]
            
            insert_resp = requests.post(
                f"{SUPABASE_URL}/rest/v1/products", 
                headers=get_headers(), 
                json=seed_products
            )
            
            if insert_resp.status_code in [200, 201]:
                print("Successfully seeded.")
            else:
                print(f"Failed to seed: {insert_resp.text}")
            
    except Exception as e:
        print(f"Warning: Could not initialize Supabase database (Ignore this error if the table hasn't been created yet): {e}")
