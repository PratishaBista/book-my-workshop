import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class IntegrityEngine:
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def check_consistency(self, registration_text: str, document_text: str, website_text: str = None) -> dict:
        """
        Calculates a Trust Score based on NLP similarity between different data sources.
        """
        try:
            # 1. Clean and normalize text
            reg_clean = self._preprocess(registration_text)
            doc_clean = self._preprocess(document_text)
            
            # 2. Vectorize and Calculate Similarity (Registration vs Documents)
            tfidf = self.vectorizer.fit_transform([reg_clean, doc_clean])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            
            # 3. Handle Website Analysis (if provided)
            web_score = 0.0
            if website_text and len(website_text) > 5:
                web_clean = self._preprocess(website_text)
                # Re-fit for all 3
                tfidf_all = self.vectorizer.fit_transform([reg_clean, doc_clean, web_clean])
                web_sim = cosine_similarity(tfidf_all[0:1], tfidf_all[2:3])[0][0]
                web_score = web_sim
            
            # 4. Final Scoring Logic
            # Base logic: 70% Identity Match (Docs) + 30% Digital Footprint (Website)
            overall_score = (sim * 0.7) + (web_score * 0.3) if website_text else sim
            
            # Convert to 0-100 scale
            overall_score = float(max(min(overall_score * 100, 100), 0))
            
            # (Simulation of named entity recognition)
            if self._has_exact_name_match(registration_text, document_text):
                overall_score = min(overall_score + 15, 100)

            return {
                "overallScore": overall_score,
                "summary": self._generate_summary(overall_score),
                "checks": [
                    {
                        "name": "Identity Consistency",
                        "score": float(sim),
                        "message": "Information provided matches document metadata.",
                        "passed": sim > 0.4
                    },
                    {
                        "name": "Digital Footprint",
                        "score": float(web_score),
                        "message": "Digital presence aligns with claimed expertise." if web_score > 0.3 else "Digital footprint is limited or unverified.",
                        "passed": web_score > 0.3
                    }
                ]
            }
        except Exception as e:
            print(f"Integrity Engine Error: {e}")
            return {"overallScore": 50.0, "summary": "Manual Review Required (AI Engine Error)", "checks": []}

    def _preprocess(self, text: str) -> str:
        if not text: return ""
        return re.sub(r'[^\w\s]', '', text.lower())

    def _has_exact_name_match(self, reg: str, doc: str) -> bool:
        # Extract capitalized words and check intersection
        reg_words = set(re.findall(r'\b[A-Z][a-z]+\b', reg))
        doc_words = set(re.findall(r'\b[A-Z][a-z]+\b', doc))
        return len(reg_words.intersection(doc_words)) >= 2

    def _generate_summary(self, score: float) -> str:
        if score > 85: return "High Integrity: Information is highly consistent across all sources."
        if score > 60: return "Medium Integrity: Information appears consistent, but some details are unverified."
        return "Manual Investigation Required: Significant inconsistencies detected between registration and documents."

# Singleton
integrity_engine = IntegrityEngine()
