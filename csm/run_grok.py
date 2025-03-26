import os
from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    XAI_API_KEY = "xai-yq6nrubsbHkhRKB9jVDVQQXaBzq4RRwOYVPqdasgcVl2P9Y4gsUsxl0lCvh9rqcIAPZaS4g1k1BdlQLo"
client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")

completion = client.chat.completions.create(
    model = "grok-2-latest",
    messages=[
        {"role": "system", "content": "You are an English tutor for 5 year old Korean kid. You ask questions to the kid."},
        {"role": "user", "content": "Hello teacher. How are you today?"},
    ]
)

print(completion.choices)