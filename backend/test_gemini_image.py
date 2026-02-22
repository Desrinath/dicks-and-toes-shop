import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash-image")
try:
    response = model.generate_content("Generate an image of a red cat.")
    print("Response text:", getattr(response, 'text', 'No text'))
    if hasattr(response, 'candidates'):
        for part in response.candidates[0].content.parts:
            print(part)
except Exception as e:
    print("Error:", e)
