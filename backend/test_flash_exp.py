import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    result = client.models.generate_content(
        model='gemini-2.0-flash-exp-image-generation',
        contents='A beautiful red cat',
    )
    for index, generated_image in enumerate(result.candidates[0].content.parts):
        try:
            if generated_image.inline_data:
                print(f"Got image data! {len(generated_image.inline_data.data)} bytes")
        except AttributeError:
            pass
    print("Success:", result.text)
except Exception as e:
    print("Error:", e)
