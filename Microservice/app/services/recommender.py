import os
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings

class RecommenderService:
    """Service to handle workshop recommendations using Custom TF-IDF similarity."""
    
    def __init__(self):
        """Initialize and load the custom model."""
        self.model_dir = "models/custom_recommender"
        self.vectorizer = None
        self.tfidf_matrix = None
        self.workshops_df = None
        self.model_loaded = False
        self._load_model()

    def _load_model(self):
        """Load the custom trained model artifacts."""
        try:
            vectorizer_path = os.path.join(self.model_dir, "vectorizer.pkl")
            matrix_path = os.path.join(self.model_dir, "tfidf_matrix.pkl")
            df_path = os.path.join(self.model_dir, "workshops_df.pkl")

            if os.path.exists(vectorizer_path) and os.path.exists(matrix_path):
                self.vectorizer = joblib.load(vectorizer_path)
                self.tfidf_matrix = joblib.load(matrix_path)
                self.workshops_df = joblib.load(df_path)
                self.model_loaded = True
                print(f"Custom TF-IDF Recommender model loaded from: {self.model_dir}")
            else:
                print(f"Custom model artifacts not found at {self.model_dir}. Running fallback or wait for training.")
        except Exception as e:
            print(f"Failed to load custom recommender model: {e}")

    def rank_for_user(self, user_interests, candidates):
        """
        Ranks candidate workshops based on User-specific interests.
        
        Args:
            user_interests (str): A combined string of category names the user picked (e.g. "Pottery Cooking Art")
            candidates (list): List of dicts containing {'id': int, 'text': str} (Upcoming workshops)
            
        Returns:
            list: List of candidate IDs ranked by similarity score.
        """
        if not self.model_loaded or not candidates:
            # Fallback: No ML available, return as is
            return [{"id": c['id'], "score": 0.0} for c in candidates]

        try:
            # 1. Convert user interests into a Vector
            user_vec = self.vectorizer.transform([user_interests])

            # 2. Convert current candidates into Vectors
            candidate_texts = [c['text'] for c in candidates]
            candidate_ids = [c['id'] for c in candidates]
            candidate_vecs = self.vectorizer.transform(candidate_texts)

            # 3. Calculate Cosine Similarity (User vs candidates)
            cosine_scores = cosine_similarity(user_vec, candidate_vecs).flatten()

            # 4. Map scores back to IDs
            ranked_results = []
            for i in range(len(candidate_ids)):
                ranked_results.append({
                    "id": candidate_ids[i],
                    "score": float(cosine_scores[i])
                })

            # 5. Sort by score descending (highest match first)
            ranked_results = sorted(ranked_results, key=lambda x: x['score'], reverse=True)
            return ranked_results

        except Exception as e:
            print(f"Error during ranking: {e}")
            return [{"id": c['id'], "score": 0.0} for c in candidates]

# Singleton instance
recommender = RecommenderService()
