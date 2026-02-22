import requests
import json
import os

API_URL = "http://localhost:8001/api/virtual-try-on"
IMAGE_PATH = os.path.join("uploads", "0126216c7c7e4191bf05fb7349b7a74a.jpg")

# Fetch product ID
products_res = requests.get("http://localhost:8001/api/products")
products = products_res.json()

if products and os.path.exists(IMAGE_PATH):
    p_id = products[0]["id"]
    
    with open(IMAGE_PATH, "rb") as f:
        files = {
            "user_photo": (os.path.basename(IMAGE_PATH), f, "image/jpeg")
        }
        data = {
            "product_id": p_id
        }
        print(f"Sending try-on request for product {p_id} using {IMAGE_PATH}...")
        res = requests.post(API_URL, files=files, data=data)
        print("Status Code:", res.status_code)
        try:
            print("Response JSON:\n", json.dumps(res.json(), indent=2))
        except:
            print("Response Text:\n", res.text)
else:
    print("Missing products or test image.")
