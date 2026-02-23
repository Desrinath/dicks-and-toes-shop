import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

url = f"{SUPABASE_URL}/storage/v1/bucket"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

resp = requests.get(url, headers=headers)
print("STATUS:", resp.status_code)
try:
    buckets = resp.json()
    print("BUCKETS FOUND:")
    for b in buckets:
        print(f" - {b.get('name')}")
except Exception as e:
    print(resp.text)
