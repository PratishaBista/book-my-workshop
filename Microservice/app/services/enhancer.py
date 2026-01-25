"""
Text Enhancement Service
Uses Hugging Face Inference API (Llama 3.1) to improve workshop descriptions.
"""
import os
from huggingface_hub import InferenceClient
from app.config import settings

class TextEnhancer:
    """Service to polish and expand workshop descriptions using AI."""
    
    def __init__(self):
        """Initialize the Hugging Face client."""
        self.api_token = settings.HF_API_TOKEN
        self.model_id = "meta-llama/Llama-3.1-8B-Instruct"
        self.client = None
        
        if self.api_token:
            try:
                self.client = InferenceClient(model=self.model_id, token=self.api_token)
                print(f"✓ Text enhancer initialized with model: {self.model_id}")
            except Exception as e:
                print(f"Failed to initialize HF client: {e}")
        else:
            print("HF_API_TOKEN not found. Text enhancement will be unavailable.")

    def enhance(self, text: str) -> str:
        """
        Polish the provided text for grammar, flow, and professionalism.
        
        Args:
            text: Original description text
            
        Returns:
            Enhanced version of the text
        """
        if not self.client:
            return text  # Fallback to original if not initialized
            
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a professional writing editor for workshop listings.\n"
                    "Rules:\n"
                    "1. Fix grammar, spelling, and issues.\n"
                    "2. Improve sentence flow and readability.\n"
                    "3. Keep tone warm and professional.\n"
                    "4. If text is under 10 words, expand slightly to be more descriptive.\n"
                    "5. NO emojis.\n"
                    "6. Return ONLY the improved text, no chatter."
                ),
            },
            {"role": "user", "content": f'Original Text: "{text}"'},
        ]

        try:
            response = self.client.chat_completion(
                messages, 
                max_tokens=500, 
                temperature=0.7, 
                stream=False
            )
            enhanced = response.choices[0].message.content.strip()
            # Remove quotes if the AI wrapped the response in them
            if enhanced.startswith('"') and enhanced.endswith('"'):
                enhanced = enhanced[1:-1]
            return enhanced
        except Exception as e:
            print(f"Enhancement error: {e}")
            return text  # Return original if error occurs


# Singleton instance
enhancer = TextEnhancer()
