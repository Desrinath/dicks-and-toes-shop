import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

try:
    result = genai.generate_image(
        prompt="A beautiful red cat",
        model="models/imagen-3.0-generate-001"
    )
    print("imagen-3.0 result:", result)
except Exception as e:
    print("imagen-3.0 error:", e)

try:
    result = genai.generate_image(
        prompt="A beautiful red cat",
        model="models/imagen-4.0-generate-001"
    )
    print("imagen-4.0 result:", result)
except Exception as e:
    print("imagen-4.0 error:", e)
