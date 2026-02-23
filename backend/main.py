import os
import uuid
import json
import time
import httpx
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "thrift2026")
WHATSAPP_NUMBER = os.getenv("WHATSAPP_NUMBER", "919999999999")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

app = FastAPI(title="DICKS & TOES API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# ──────────────────────────────────────────
# SIMPLE IN-MEMORY TTL CACHE
# ──────────────────────────────────────────

_CACHE_TTL = 60  # seconds

class _Cache:
    def __init__(self):
        self._store: dict = {}

    def get(self, key: str):
        entry = self._store.get(key)
        if entry and (time.monotonic() - entry["ts"]) < _CACHE_TTL:
            return entry["value"]
        return None

    def set(self, key: str, value):
        self._store[key] = {"value": value, "ts": time.monotonic()}

    def delete(self, key: str):
        self._store.pop(key, None)

    def clear(self):
        self._store.clear()

cache = _Cache()

# ──────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }


def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return True


# ──────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────

@app.post("/api/auth/login")
def login(body: dict):
    password = body.get("password", "")
    if password == ADMIN_PASSWORD:
        return {"token": ADMIN_PASSWORD, "success": True}
    raise HTTPException(status_code=401, detail="Wrong password")


# ──────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────

@app.get("/api/config")
def get_config():
    return {"whatsappNumber": WHATSAPP_NUMBER}


# ──────────────────────────────────────────
# PRODUCTS — ADMIN
# ──────────────────────────────────────────

@app.post("/api/admin/products")
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form("shirts"),
    description: str = Form(""),
    color: str = Form(""),
    sizes: str = Form("[]"),
    measurements: str = Form("{}"),
    video_url: str = Form(""),
    condition: str = Form("Good"),
    coupon_code: str = Form(""),
    discount_amount: float = Form(0.0),
    header_image: str = Form(""),
    images: str = Form("[]"),
    _admin: bool = Depends(verify_admin),
):
    product_id = str(uuid.uuid4())

    image_list = json.loads(images) if images else []
    if header_image and header_image not in image_list:
        image_list.insert(0, header_image)

    doc_data = {
        "id": product_id,
        "name": name,
        "price": price,
        "category": category,
        "description": description,
        "header_image": header_image,
        "images": image_list,
        "video_url": video_url,
        "measurements": json.loads(measurements) if measurements else {},
        "color": color,
        "sizes": json.loads(sizes) if sizes else [],
        "condition": condition,
        "coupon_code": coupon_code,
        "discount_amount": discount_amount,
        "created_at": datetime.now().isoformat()
    }

    url = f"{SUPABASE_URL}/rest/v1/products"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, headers=get_supabase_headers(), json=doc_data)

    if resp.status_code not in [200, 201]:
        raise HTTPException(status_code=500, detail=resp.text)

    # Invalidate product list cache so new product shows immediately
    cache.clear()

    return resp.json()[0] if resp.json() else doc_data


@app.put("/api/admin/products/{product_id}")
async def update_product(
    product_id: str,
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form("shirts"),
    description: str = Form(""),
    color: str = Form(""),
    sizes: str = Form("[]"),
    measurements: str = Form("{}"),
    video_url: str = Form(""),
    condition: str = Form("Good"),
    coupon_code: str = Form(""),
    discount_amount: float = Form(0.0),
    header_image: str = Form(""),
    images: str = Form("[]"),
    _admin: bool = Depends(verify_admin),
):
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    async with httpx.AsyncClient(timeout=15) as client:
        check = await client.get(url, headers=get_supabase_headers())
        if check.status_code != 200 or not check.json():
            raise HTTPException(status_code=404, detail="Product not found")

        image_list = json.loads(images) if images else []
        if header_image and header_image not in image_list:
            image_list.insert(0, header_image)

        update_data = {
            "name": name,
            "price": price,
            "category": category,
            "description": description,
            "header_image": header_image,
            "images": image_list,
            "video_url": video_url,
            "measurements": json.loads(measurements) if measurements else {},
            "color": color,
            "sizes": json.loads(sizes) if sizes else [],
            "condition": condition,
            "coupon_code": coupon_code,
            "discount_amount": discount_amount,
        }

        resp = await client.patch(url, headers=get_supabase_headers(), json=update_data)

    if resp.status_code not in [200, 204]:
        raise HTTPException(status_code=500, detail=resp.text)

    # Invalidate cache
    cache.clear()

    return resp.json()[0] if resp.json() else update_data


@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str, _admin: bool = Depends(verify_admin)):
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    async with httpx.AsyncClient(timeout=15) as client:
        check = await client.get(url, headers=get_supabase_headers())
        if check.status_code != 200 or not check.json():
            raise HTTPException(status_code=404, detail="Product not found")
        await client.delete(url, headers=get_supabase_headers())

    # Invalidate cache
    cache.clear()

    return {"success": True, "id": product_id}


# ──────────────────────────────────────────
# PRODUCTS — PUBLIC
# ──────────────────────────────────────────

@app.get("/api/products")
async def list_products(category: Optional[str] = None):
    cache_key = f"products:{category or 'all'}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=*"
        if category and category != "all":
            url += f"&category=eq.{category}"
        url += "&order=created_at.desc"

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, headers=get_supabase_headers())

        if resp.status_code == 200:
            data = resp.json()
            cache.set(cache_key, data)
            return data
        return []
    except Exception as e:
        print(e)
        return []


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    cache_key = f"product:{product_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=get_supabase_headers())

    if resp.status_code != 200 or not resp.json():
        raise HTTPException(status_code=404, detail="Product not found")

    data = resp.json()[0]
    cache.set(cache_key, data)
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
