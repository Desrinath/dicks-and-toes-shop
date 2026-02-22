import os
import uuid
import json
import requests
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

from database import init_db

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

def get_supabase_headers(is_upload=False):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    if not is_upload:
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation"
    return headers


def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return True


async def save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    
    upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{filename}"
    headers = get_supabase_headers(is_upload=True)
    headers["Content-Type"] = file.content_type
    
    resp = requests.post(upload_url, headers=headers, data=content)
    if resp.status_code not in [200, 201]:
        print(f"Failed to upload to Supabase: {resp.text}")
        raise HTTPException(status_code=500, detail="Image upload failed")
        
    return f"{SUPABASE_URL}/storage/v1/object/public/product-images/{filename}"


def delete_upload(url: str):
    if not url or "supabase" not in url:
        return
    try:
        parts = url.split("product-images/")
        if len(parts) > 1:
            filename = parts[1].split('?')[0]
            delete_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{filename}"
            requests.delete(delete_url, headers=get_supabase_headers())
    except Exception as e:
        print(f"Failed to delete {url} from storage: {e}")


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
    header_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    _admin: bool = Depends(verify_admin),
):
    product_id = str(uuid.uuid4())

    header_url = ""
    if header_image and header_image.filename:
        header_url = await save_upload(header_image)

    image_urls = []
    if images:
        for img in images:
            if img and img.filename:
                url = await save_upload(img)
                image_urls.append(url)

    if header_url and header_url not in image_urls:
        image_urls.insert(0, header_url)

    doc_data = {
        "id": product_id,
        "name": name,
        "price": price,
        "category": category,
        "description": description,
        "header_image": header_url,
        "images": image_urls,
        "video_url": video_url,
        "measurements": json.loads(measurements) if isinstance(measurements, str) else measurements,
        "color": color,
        "sizes": json.loads(sizes) if isinstance(sizes, str) else sizes,
        "condition": condition,
        "coupon_code": coupon_code,
        "discount_amount": discount_amount,
        "created_at": datetime.now().isoformat()
    }

    url = f"{SUPABASE_URL}/rest/v1/products"
    resp = requests.post(url, headers=get_supabase_headers(), json=doc_data)
    
    if resp.status_code not in [200, 201]:
        raise HTTPException(status_code=500, detail=resp.text)
        
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
    header_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    _admin: bool = Depends(verify_admin),
):
    # Get existing
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    resp = requests.get(url, headers=get_supabase_headers())
    if resp.status_code != 200 or not resp.json():
        raise HTTPException(status_code=404, detail="Product not found")

    existing_data = resp.json()[0]
    header_url = existing_data.get("header_image", "")
    image_urls = existing_data.get("images", [])

    if header_image and header_image.filename:
        header_url = await save_upload(header_image)

    if images:
        new_urls = []
        for img in images:
            if img and img.filename:
                url = await save_upload(img)
                new_urls.append(url)
        if new_urls:
            image_urls = new_urls
            if header_url and header_url not in image_urls:
                image_urls.insert(0, header_url)

    update_data = {
        "name": name,
        "price": price,
        "category": category,
        "description": description,
        "header_image": header_url,
        "images": image_urls,
        "video_url": video_url,
        "measurements": json.loads(measurements) if isinstance(measurements, str) else measurements,
        "color": color,
        "sizes": json.loads(sizes) if isinstance(sizes, str) else sizes,
        "condition": condition,
        "coupon_code": coupon_code,
        "discount_amount": discount_amount,
    }

    resp = requests.patch(url, headers=get_supabase_headers(), json=update_data)
    if resp.status_code not in [200, 204]:
        raise HTTPException(status_code=500, detail=resp.text)
        
    return resp.json()[0] if resp.json() else update_data


@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: str, _admin: bool = Depends(verify_admin)):
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    resp = requests.get(url, headers=get_supabase_headers())
    if resp.status_code != 200 or not resp.json():
        raise HTTPException(status_code=404, detail="Product not found")

    product = resp.json()[0]

    # Delete related images from storage
    if product.get("header_image"):
        delete_upload(product["header_image"])
    for img_url in product.get("images", []):
        if img_url != product.get("header_image"):
            delete_upload(img_url)

    requests.delete(url, headers=get_supabase_headers())
    return {"success": True, "id": product_id}


# ──────────────────────────────────────────
# PRODUCTS — PUBLIC
# ──────────────────────────────────────────

@app.get("/api/products")
def list_products(category: Optional[str] = None):
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=*"
        if category and category != "all":
            url += f"&category=eq.{category}"
        url += "&order=created_at.desc"
        
        resp = requests.get(url, headers=get_supabase_headers())
        if resp.status_code == 200:
            return resp.json()
        return []
    except Exception as e:
        print(e)
        return []


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{product_id}"
    resp = requests.get(url, headers=get_supabase_headers())
    
    if resp.status_code != 200 or not resp.json():
        raise HTTPException(status_code=404, detail="Product not found")
        
    return resp.json()[0]


if __name__ == "__main__":
    import uvicorn
    # Make sure we don't block startup on Windows with nested loops
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
