import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()


def get_hf_token():
    token = os.getenv("HF_API_TOKEN")
    if not token:
        print("Error: HF_API_TOKEN not found in .env file.")
        return None
    return token


def enhance_text(text, api_token):
    client = InferenceClient(model="meta-llama/Llama-3.1-8B-Instruct", token=api_token)

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
6. Return ONLY the improved text.""",
        },
        {"role": "user", "content": f'Original Text: "{text}"'},
    ]

    try:
        response = client.chat_completion(
            messages, max_tokens=500, temperature=0.7, stream=False
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error calling API: {str(e)}"


if __name__ == "__main__":
    token = get_hf_token()

    if token:
        print("--- AI Microservice Test (via InferenceClient) ---\n")

        sample_input_1 = (
            "we gonna make pottery it will be fun bring clothes that can get dirty"
        )
        print(f"Input 1: {sample_input_1}")
        print("Enhancing...")
        result_1 = enhance_text(sample_input_1, token)
        print(f"Output 1:\n{result_1}\n")

        print("-" * 30 + "\n")

        sample_input_2 = "sourdough bread making. beginner level. lunch included."
        print(f"Input 2: {sample_input_2}")
        print("Enhancing...")
        result_2 = enhance_text(sample_input_2, token)
        print(f"Output 2:\n{result_2}\n")
