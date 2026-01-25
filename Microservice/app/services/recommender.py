"""
Workshop Recommendation Service
Uses the fine-tuned Siamese-BERT model to rank workshops by semantic similarity.
"""
import os
import torch
from sentence_transformers import SentenceTransformer, util
from app.config import settings

class RecommenderService:
    """Service to handle workshop recommendations using vector similarity."""
    
    def __init__(self):
        """Initialize and load the model."""
        self.model_path = "models/workshop_recommender"
        self.model = None
        self.model_loaded = False
        self._load_model()

    def _load_model(self):
        """Load the fine-tuned model from disk."""
        if os.path.exists(self.model_path):
            try:
                # Use CPU for inference to save resources
                self.model = SentenceTransformer(self.model_path, device='cpu')
                self.model_loaded = True
                print(f"✓ Recommender model loaded from: {self.model_path}")
            except Exception as e:
                print(f"❌ Failed to load recommender model: {e}")
        else:
            print(f"⚠️ Recommender model not found at {self.model_path}. Run training/train_recommender.py first.")

    def rank_workshops(self, source_text, candidates):
        """
        Ranks a list of candidate workshops against a source workshop.
        
        Args:
            source_text (str): Combined text of the clicked workshop (Title + Tagline + Desc)
            candidates (list): List of dicts containing {'id': int, 'text': str}
            
        Returns:
            list: List of candidate IDs ranked by similarity score.
        """
        if not self.model_loaded:
            print("⚠️ Recommender model not loaded. Returning unranked list.")
            return [c['id'] for c in candidates]

        if not candidates:
            return []

        try:
            # 1. Extract texts
            candidate_texts = [c['text'] for c in candidates]
            candidate_ids = [c['id'] for c in candidates]

            # 2. Encode to vectors
            source_vec = self.model.encode(source_text, convert_to_tensor=True)
            candidate_vecs = self.model.encode(candidate_texts, convert_to_tensor=True)

            # 3. Calculate Cosine Similarity
            cosine_scores = util.cos_sim(source_vec, candidate_vecs)[0]

            # 4. Map scores back to IDs
            ranked_results = []
            for i in range(len(candidate_ids)):
                ranked_results.append({
                    "id": candidate_ids[i],
                    "score": float(cosine_scores[i])
                })

            # 5. Sort by score descending
            ranked_results = sorted(ranked_results, key=lambda x: x['score'], reverse=True)

            print(f"📊 Ranked {len(candidates)} workshops for similarity.")
            return ranked_results

        except Exception as e:
            print(f"❌ Error during ranking: {e}")
            return [{"id": c['id'], "score": 0.0} for c in candidates]

# Singleton instance
recommender = RecommenderService()
