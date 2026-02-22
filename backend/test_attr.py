import google.generativeai as genai

with open("imagen_output.txt", "w") as f:
    f.write("Has ImageGenerationModel: " + str(hasattr(genai, "ImageGenerationModel")))
