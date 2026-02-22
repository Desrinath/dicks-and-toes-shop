import os
import uuid
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

from database import init_db, get_db, row_to_dict
import google.generativeai as genai

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "thrift2026")
WHATSAPP_NUMBER = os.getenv("WHATSAPP_NUMBER", "919999999999")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI(title="DICKS & TOES API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

security = HTTPBearer(auto_error=False)


@app.on_event("startup")
def startup_event():
    init_db()


def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return True


async def save_upload(file: UploadFile) -> str:
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)
    return f"/uploads/{filename}"


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
    header_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    _admin: bool = Depends(verify_admin),
):
    product_id = str(uuid.uuid4())

    # Header image
    header_url = ""
    if header_image and header_image.filename:
        header_url = await save_upload(header_image)

    # Detail images
    image_urls = []
    if images:
        for img in images:
            if img and img.filename:
                url = await save_upload(img)
                image_urls.append(url)

    if header_url and header_url not in image_urls:
        image_urls.insert(0, header_url)

    conn = get_db()
    conn.execute("""
        INSERT INTO products (id, name, price, category, description, header_image,
            images, video_url, measurements, color, sizes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        product_id, name, price, category, description, header_url,
        json.dumps(image_urls), video_url, measurements, color, sizes,
        datetime.now().isoformat()
    ))
    conn.commit()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    return row_to_dict(row)


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
    header_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    _admin: bool = Depends(verify_admin),
):
    conn = get_db()
    existing = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    existing_dict = row_to_dict(existing)
    header_url = existing_dict["header_image"]
    image_urls = existing_dict["images"]

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

    conn.execute("""
        UPDATE products SET name=?, price=?, category=?, description=?, header_image=?,
            images=?, video_url=?, measurements=?, color=?, sizes=?
        WHERE id=?
    """, (
        name, price, category, description, header_url,
        json.dumps(image_urls), video_url, measurements, color, sizes,
        product_id
    ))
    conn.commit()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    return row_to_dict(row)


@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: str, _admin: bool = Depends(verify_admin)):
    conn = get_db()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    product = row_to_dict(row)

    # Delete uploaded files
    for img_url in product.get("images", []):
        if img_url.startswith("/uploads/"):
            file_path = Path(img_url.lstrip("/"))
            if file_path.exists():
                file_path.unlink()

    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"success": True, "id": product_id}


# ──────────────────────────────────────────
# PRODUCTS — PUBLIC
# ──────────────────────────────────────────

@app.get("/api/products")
def list_products(category: Optional[str] = None):
    conn = get_db()
    if category and category != "all":
        rows = conn.execute(
            "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC",
            (category,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM products ORDER BY created_at DESC"
        ).fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return row_to_dict(row)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
