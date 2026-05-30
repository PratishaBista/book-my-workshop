"""
Review profanity detection: LSTM model + explicit swear-word fallback.
Negative reviews without profanity should score low and pass.
"""
import os
import pickle
import re
from typing import Tuple

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

from app.config import settings

_PROFANITY_PATTERN = re.compile(
    r"\b("
    r"fuck(?:ing|ed|er|s)?|motherfuck(?:er|ing)|shit(?:ty|s)?|bullshit|"
    r"bitch(?:es)?|bastard|asshole|arsehole|cunt|dick(?:head|s)?|cock|pussy|"
    r"whore|slut|wanker|bollocks|nigg(?:er|a)|fagg?(?:ot)?|retard"
    r")\b",
    re.IGNORECASE,
)


def _lexicon_hit(text: str) -> Tuple[bool, float]:
    match = _PROFANITY_PATTERN.search(text or "")
    if match:
        return True, 0.95
    return False, 0.0


class ReviewSentimentAnalyzer:
    """Loads review sentiment artifacts and runs inference on comment text."""

    def __init__(self) -> None:
        self.model = None
        self.tokenizer = None
        self.max_len = 16
        self.model_loaded = False
        self._load_model()

    def _load_model(self) -> None:
        model_dir = settings.REVIEW_SENTIMENT_DIR
        keras_path = os.path.join(model_dir, "word2vec_lstm.keras")
        tokenizer_path = os.path.join(model_dir, "tokenizer.pkl")
        max_len_path = os.path.join(model_dir, "max_len.pkl")

        if not os.path.exists(keras_path):
            print(f"Review sentiment model not found at: {keras_path}")
            return

        try:
            self.model = load_model(keras_path)
            with open(tokenizer_path, "rb") as f:
                self.tokenizer = pickle.load(f)
            with open(max_len_path, "rb") as f:
                self.max_len = int(pickle.load(f))
            self.model_loaded = True
            print(f"Review sentiment model loaded from: {keras_path}")
        except Exception as e:
            print(f"Failed to load review sentiment model: {e}")
            self.model_loaded = False

    def analyze(self, text: str) -> Tuple[bool, float]:
        """
        Returns (is_offensive, offensive_score).
        Flagged if ML score >= threshold OR explicit profanity lexicon matches.
        """
        cleaned = (text or "").strip()
        if not cleaned:
            return False, 0.0

        lexicon_flagged, lexicon_score = _lexicon_hit(cleaned)

        if not self.model_loaded or self.model is None or self.tokenizer is None:
            if lexicon_flagged:
                return True, lexicon_score
            raise RuntimeError("Review sentiment model not loaded.")

        sequences = self.tokenizer.texts_to_sequences([cleaned])
        padded = pad_sequences(sequences, maxlen=self.max_len)
        ml_score = float(self.model.predict(padded, verbose=0)[0][0])
        ml_flagged = ml_score >= settings.OFFENSIVE_THRESHOLD

        is_offensive = lexicon_flagged or ml_flagged
        offensive_score = max(lexicon_score, ml_score)
        return is_offensive, offensive_score


sentiment_analyzer = ReviewSentimentAnalyzer()
