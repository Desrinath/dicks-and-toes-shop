import requests
import os

API_URL = "http://localhost:8001/api/admin/products"
TOKEN = "d&t@adminakdh"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

data = {
    "name": "Vintage Denim Jacket",
    "price": "2500",
    "category": "jackets",
    "description": "Authentic 90s vintage denim jacket. Handpicked and verified for quality. Perfect condition with natural fade.",
    "color": "Blue",
    "sizes": '["M", "L"]',
}

try:
    with open("dummy_user.jpg", "wb") as f:
        f.write(b"dummy image data")
except:
    pass

with open("dummy_user.jpg", "rb") as f:
    files = {
        "images": ("dummy_user.jpg", f, "image/jpeg"),
        "header_image": ("dummy_user.jpg", f, "image/jpeg")
    }
    
    res = requests.post(API_URL, headers=headers, data=data, files=files)
    print(res.status_code)
    print(res.text)
