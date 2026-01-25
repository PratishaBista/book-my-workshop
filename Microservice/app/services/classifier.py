"""
ML Classifier Service
Handles loading and inference for the category classification model.
"""
import os
import joblib
import numpy as np
from typing import Optional, Tuple
from app.config import settings


class CategoryClassifier:
    """Workshop category classification service."""
    
    def __init__(self):
        """Initialize the classifier and load the model."""
        self.model = None
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the trained model from disk."""
        model_path = settings.CATEGORY_CLASSIFIER_PATH
        
        # Fallback to legacy path if new structure doesn't exist yet
        if not os.path.exists(model_path):
            model_path = 'workshop_classifier.pkl'
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.model_loaded = True
                print(f"Category classifier loaded from: {model_path}")
            except Exception as e:
                print(f"Failed to load model: {e}")
                self.model_loaded = False
        else:
            print(f"Model not found at: {model_path}")
            print("Run training script first: python training/train_classifier.py")
    
    def predict(self, title: str, description: str) -> Tuple[str, float, bool, str]:
        """
        Predict workshop category from title and description.
        
        Args:
            title: Workshop title
            description: Workshop description
            
        Returns:
            Tuple of (suggested_category, confidence_score, is_confident, original_prediction)
            
        Raises:
            RuntimeError: If model is not loaded
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Cannot perform inference.")
        
        # Combine text features
        full_text = f"{title}. {description}"
        
        try:
            # Get prediction
            prediction = self.model.predict([full_text])[0]
            
            # Calculate confidence using decision function
            # (distance to separating hyperplane for LinearSVC)
            scores = self.model.decision_function([full_text])[0]
            max_score = float(np.max(scores))
            
            # Apply confidence threshold
            is_confident = max_score > settings.CONFIDENCE_THRESHOLD
            
            # Determine final category
            suggested_category = prediction if is_confident else "Uncategorized"
            
            # Log for monitoring
            print(f"Prediction: '{prediction}' | Score: {max_score:.3f} | Confident: {is_confident}")
            
            return suggested_category, max_score, is_confident, prediction
            
        except Exception as e:
            print(f"Prediction error: {e}")
            raise RuntimeError(f"Inference failed: {str(e)}")


# Singleton instance
classifier = CategoryClassifier()
