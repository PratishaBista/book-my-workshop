"""
Text enhancement for workshop descriptions.
Tries multiple providers (configurable) — HF Llama alone often fails without a gated-model token.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

import httpx

from app.config import settings

SYSTEM_PROMPT = (
    "You are a plain-language editor for workshop listings.\n"
    "Rules:\n"
    "1. Fix grammar, spelling, and punctuation.\n"
    "2. Expand the text into a LONGER, clear description (about 80–150 words) using only "
    "what the host already implied — who it is for, what they will do, and practical takeaways.\n"
    "3. Use short paragraphs or 3–5 complete sentences. Be informative, not promotional.\n"
    "4. NO poetic, artsy, or salesy language (avoid: journey, discover, unique, immersive, "
    "transformative, unleash, vibrant, masterpiece, magical, etc.).\n"
    "5. NO emojis and NO invented facts (prices, dates, certificates) unless stated in the original.\n"
    "6. Return ONLY the improved text, no labels or quotes."
)


@dataclass
class EnhanceOutcome:
    text: str
    provider: Optional[str] = None
    error: Optional[str] = None

    @property
    def ok(self) -> bool:
        return self.provider is not None and not self.error


class TextEnhancer:
    """Polish workshop description text using the first available LLM backend."""

    def __init__(self) -> None:
        self._providers: list[tuple[str, Callable[[str], str]]] = []
        self._register_providers()
        if self._providers:
            names = ", ".join(p[0] for p in self._providers)
            print(f"Text enhancer providers available: {names}")
        else:
            print(
                "Text enhancer: no provider configured. Set Ollama, GROQ_API_KEY, "
                "OPENAI_API_KEY, or HF_API_TOKEN — see Microservice/.env.example"
            )

    def _register_providers(self) -> None:
        mode = (settings.ENHANCEMENT_PROVIDER or "auto").lower().strip()

        def add(name: str, fn: Callable[[str], str]) -> None:
            self._providers.append((name, fn))

        if mode in ("auto", "ollama"):
            add("ollama", self._enhance_ollama)
        if mode in ("auto", "groq") and settings.GROQ_API_KEY:
            add("groq", self._enhance_groq)
        if mode in ("auto", "openai") and settings.OPENAI_API_KEY:
            add("openai", self._enhance_openai)
        if mode in ("auto", "huggingface") and settings.HF_API_TOKEN:
            add("huggingface", self._enhance_huggingface)

        if mode == "ollama":
            self._providers = [("ollama", self._enhance_ollama)]
        elif mode == "groq" and settings.GROQ_API_KEY:
            self._providers = [("groq", self._enhance_groq)]
        elif mode == "openai" and settings.OPENAI_API_KEY:
            self._providers = [("openai", self._enhance_openai)]
        elif mode == "huggingface" and settings.HF_API_TOKEN:
            self._providers = [("huggingface", self._enhance_huggingface)]

    def enhance(self, text: str) -> EnhanceOutcome:
        cleaned = (text or "").strip()
        if not cleaned:
            return EnhanceOutcome(text=text, error="Text is empty.")

        if not self._providers:
            return EnhanceOutcome(
                text=text,
                error=(
                    "No enhancement provider available. Options: "
                    "(1) Install Ollama and run `ollama pull llama3.2` "
                    "(2) Set GROQ_API_KEY (free at console.groq.com) "
                    "(3) Set OPENAI_API_KEY "
                    "(4) Set HF_API_TOKEN for Hugging Face"
                ),
            )

        errors: list[str] = []
        for name, fn in self._providers:
            try:
                result = fn(cleaned).strip()
                if result and result != cleaned:
                    return EnhanceOutcome(text=result, provider=name)
                if result == cleaned:
                    errors.append(f"{name}: model returned unchanged text")
                else:
                    errors.append(f"{name}: empty response")
            except Exception as e:
                errors.append(f"{name}: {e}")
                print(f"Enhancement error ({name}): {e}")

        return EnhanceOutcome(
            text=text,
            error="; ".join(errors) if errors else "Enhancement failed.",
        )

    def _chat_openai_compatible(
        self,
        text: str,
        *,
        base_url: str,
        api_key: str,
        model: str,
    ) -> str:
        url = f"{base_url.rstrip('/')}/chat/completions"
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f'Expand into a longer, plain workshop description:\n\n"{text}"'},
            ],
            "max_tokens": 450,
            "temperature": 0.35,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()
        return _strip_wrapping_quotes(content)

    def _enhance_ollama(self, text: str) -> str:
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f'Expand into a longer, plain workshop description:\n\n"{text}"'},
            ],
            "stream": False,
            "options": {"temperature": 0.35, "num_predict": 450},
        }
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
        content = data["message"]["content"].strip()
        return _strip_wrapping_quotes(content)

    def _enhance_groq(self, text: str) -> str:
        return self._chat_openai_compatible(
            text,
            base_url=settings.GROQ_BASE_URL,
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
        )

    def _enhance_openai(self, text: str) -> str:
        return self._chat_openai_compatible(
            text,
            base_url=settings.OPENAI_BASE_URL,
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
        )

    def _enhance_huggingface(self, text: str) -> str:
        from huggingface_hub import InferenceClient

        client = InferenceClient(model=settings.HF_ENHANCE_MODEL, token=settings.HF_API_TOKEN)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f'Original Text: "{text}"'},
        ]
        response = client.chat_completion(
            messages, max_tokens=450, temperature=0.35, stream=False
        )
        content = response.choices[0].message.content.strip()
        return _strip_wrapping_quotes(content)


def _strip_wrapping_quotes(s: str) -> str:
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        return s[1:-1]
    return s


enhancer = TextEnhancer()
