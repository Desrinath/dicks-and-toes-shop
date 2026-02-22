import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

try:
    client = genai.Client(api_key=GOOGLE_API_KEY)
    result = client.models.generate_images(
        model='imagen-3.0-generate-001',
        prompt='A beautiful red cat',
        config=dict(
            number_of_images=1,
            output_mime_type="image/jpeg",
        )
    )
    for index, generated_image in enumerate(result.generated_images):
        with open(f"cat_{index}.jpeg", "wb") as f:
            f.write(generated_image.image.image_bytes)
        print(f"Saved cat_{index}.jpeg")
except Exception as e:
    print("Error:", e)
