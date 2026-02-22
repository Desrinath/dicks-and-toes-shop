import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

url = f"{SUPABASE_URL}/storage/v1/object/product-images/test.txt"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "text/plain"
}
resp = requests.post(url, headers=headers, data=b"test")
print("UPLOAD:", resp.status_code, resp.text)

# Also test database insert
url_db = f"{SUPABASE_URL}/rest/v1/products"
headers_db = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}
resp_db = requests.post(url_db, headers=headers_db, json={"id": "test_123", "name": "test", "price": 0})
print("DB INSERT:", resp_db.status_code, resp_db.text)
