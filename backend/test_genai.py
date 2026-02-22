import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(override=True)
client = genai.Client()

prompt = "A simple white coffee mug on a wooden table, highly detailed."

import time
success = False
while not success:
    try:
        print("Calling generate_content...")
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents="Generate a picture of a blue square.",
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                media_resolution="high"
            )
        )
        success = True
    except Exception as e:
        print(f"Error: {e}. Retrying in 2 seconds...")
        time.sleep(2)

print("\n--- RESPONSE DEBUG ---")
try:
    for part in response.candidates[0].content.parts:
        print(f"Part type: {type(part)}")
        if hasattr(part, 'model_dump'):
            d = part.model_dump()
            print(f"Keys: {list(d.keys())}")
            for k, v in d.items():
                if v is not None:
                    if isinstance(v, dict):
                        print(f"  {k} -> dict with keys {list(v.keys())}")
                    else:
                        print(f"  {k} -> {type(v)} (len: {len(str(v))})")
        else:
            print(f"Dict: {list(part.__dict__.keys())}")
except Exception as e:
    print(e)
print("Done.")
