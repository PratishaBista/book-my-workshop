from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HF_API_TOKEN")

if not HF_TOKEN:
    print("Warning: HF_API_TOKEN not found in .env")

class EnhanceRequest(BaseModel):
    text: str

@app.post("/enhance")
async def enhance_text(request: EnhanceRequest):
    if not request.text or len(request.text.strip()) < 5:
         raise HTTPException(status_code=400, detail="Text is too short to enhance.")

    try:
        client = InferenceClient(
            model="meta-llama/Llama-3.1-8B-Instruct",
            token=HF_TOKEN
        )

        messages = [
            {
                "role": "system",
                "content": """You are a professional writing editor for workshop listings.
Rules:
1. Fix grammar, spelling, and error.
2. Improve sentence flow and readability.
3. Keep tone warm and professional.
4. If text is under 10 words, expand slightly.
5. NO emojis.
6. Return ONLY the improved text."""
            },
            {
                "role": "user",
                "content": f'Original Text: "{request.text}"'
            }
        ]

        response = client.chat_completion(
            messages,
            max_tokens=600,
            temperature=0.7,
            stream=False
        )
        
        enhanced_text = response.choices[0].message.content.strip()
        enhanced_text = enhanced_text.replace('"', '').strip()
        
        return {"enhanced_text": enhanced_text}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
