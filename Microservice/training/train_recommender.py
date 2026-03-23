import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1. Configuration
DATA_PATH = "data/workshops_data.csv"
MODEL_DIR = "models/custom_recommender"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_model():
    print("Starting Custom ML Model Training (TF-IDF)...")
    
    # 2. Loading real data from CSV
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data file not found at {DATA_PATH}. Run export_data.py first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    if df.empty:
        print("Warning: Data file is empty. Nothing to train on.")
        return

    print(f"Loaded {len(df)} workshops for training.")

    # 3. Vectorization
    # We remove 'stop words' (the, a, is) to keep only the meaningful technical terms
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(df['text'].fillna(''))

    # 4. Save the artifacts
    joblib.dump(vectorizer, f"{MODEL_DIR}/vectorizer.pkl")
    joblib.dump(tfidf_matrix, f"{MODEL_DIR}/tfidf_matrix.pkl")
    joblib.dump(df, f"{MODEL_DIR}/workshops_df.pkl")

    print(f"Custom Model trained and saved to {MODEL_DIR}")
    print(f"Features learned: {len(vectorizer.get_feature_names_out())}")

if __name__ == "__main__":
    train_model()
