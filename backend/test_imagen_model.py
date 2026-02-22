import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

try:
    if hasattr(genai, "ImageGenerationModel"):
        model = genai.ImageGenerationModel("imagen-3.0-generate-001")
        result = model.generate_images(
            prompt="A beautiful red cat",
            number_of_images=1,
            aspect_ratio="1:1"
        )
        print("imagen-3.0 result:", result)
    else:
        print("ImageGenerationModel not found in genai namespace")
except Exception as e:
    print("imagen-3.0 error:", e)

try:
    if hasattr(genai, "ImageGenerationModel"):
        model = genai.ImageGenerationModel("imagen-3.0-generate-002")
        result = model.generate_images(
            prompt="A beautiful red cat",
            number_of_images=1,
            aspect_ratio="1:1"
        )
        print("imagen-3.0-002 result:", result)
except Exception as e:
    print("imagen-3.0-002 error:", e)
