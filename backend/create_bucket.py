import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Create the bucket
resp = requests.post(
    f"{SUPABASE_URL}/storage/v1/bucket",
    headers=headers,
    json={"id": "product-image", "name": "product-image", "public": True}
)
print("CREATE BUCKET:", resp.status_code, resp.text)

# Verify
resp2 = requests.get(f"{SUPABASE_URL}/storage/v1/bucket", headers=headers)
print("BUCKETS AFTER:", [b['name'] for b in resp2.json()] if isinstance(resp2.json(), list) else resp2.text)
