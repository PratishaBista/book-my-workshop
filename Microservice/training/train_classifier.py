import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib
import os

def train():
    data_path = "data/raw/workshop_training_data.csv"
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Please run training/data_generator.py first.")
        return

    df = pd.read_csv(data_path)
    X = df['text']
    y = df['category']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # TfidfVectorizer: Converts text to math vectors
    # LinearSVC: A powerful classifier for high-dimensional text data
    model = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
        ('clf', LinearSVC(C=1.0))
    ])

    print("Starting training...")
    model.fit(X_train, y_train)
    print("Training complete.")

    predictions = model.predict(X_test)
    print("\nModel Evaluation:")
    print(classification_report(y_test, predictions))

    save_path = 'models/category_classifier/model.pkl'
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(model, save_path)
    print(f"\nModel saved as '{save_path}'")

if __name__ == "__main__":
    train()
