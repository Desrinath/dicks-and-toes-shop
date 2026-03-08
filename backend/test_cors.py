import httpx

url = "https://dicks-and-toes-shop-api.onrender.com/api/admin/products"
headers = {
    "Origin": "https://dicks-and-toes-shop.vercel.app",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "authorization, content-type"
}

resp = httpx.options(url, headers=headers)
print("STATUS:", resp.status_code)
for k, v in resp.headers.items():
    print(f"{k}: {v}")
