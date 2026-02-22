import requests
import json
import base64

API_URL = "http://localhost:8001/api/virtual-try-on"

# Create dummy images
with open("dummy_user.jpg", "wb") as f:
    f.write(b"dummy image data")

# We need a valid product ID. Let's fetch one first.
products_res = requests.get("http://localhost:8001/api/products")
products = products_res.json()

if products:
    p_id = products[0]["id"]
    
    with open("dummy_user.jpg", "rb") as f:
        files = {
            "user_photo": ("dummy_user.jpg", f, "image/jpeg")
        }
        data = {
            "product_id": p_id
        }
        print(f"Sending try-on request for product {p_id}...")
        res = requests.post(API_URL, files=files, data=data)
        print("Status Code:", res.status_code)
        try:
            print("Response JSON:\n", json.dumps(res.json(), indent=2))
        except:
            print("Response Text:\n", res.text)
else:
    print("No products found to test with.")
