import httpx
from datetime import datetime
import json

url = "http://localhost:8001/api/admin/products"

data = {
    "name": "Test Product",
    "price": "999",
    "category": "shirts",
    "description": "Test",
    "color": "Black",
    "video_url": "",
    "condition": "Good",
    "coupon_code": "",
    "discount_amount": "0",
    "sizes": json.dumps(["L", "XL"]),
    "measurements": json.dumps({}),
    "header_image": "https://i.ibb.co/example.jpg",
    "images": json.dumps(["https://i.ibb.co/example.jpg"])
}

headers = {
    "Authorization": "Bearer d&t@adminakdh" 
}

# The frontend uses FormData, so we send as multipart/form-data
with httpx.Client() as client:
    response = client.post(url, data=data, headers=headers)
    print("STATUS", response.status_code)
    try:
        print("JSON", response.json())
    except:
        print("TEXT", response.text)
