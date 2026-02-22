import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

with open("imagen_models.txt", "w") as f:
    for m in genai.list_models():
        if "generate" in m.name.lower() or "image" in m.name.lower() or "imagen" in m.name.lower():
            f.write(f"{m.name} {m.supported_generation_methods}\n")
