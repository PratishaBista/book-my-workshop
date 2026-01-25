import pandas as pd
from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
from torch.utils.data import DataLoader
import os

def train():
    data_path = "data/raw/similarity_training_data.csv"
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} pairs for training.")

    model_name = "all-MiniLM-L6-v2"
    model = SentenceTransformer(model_name)
    print(f"Initialized base model: {model_name}")

    train_examples = []
    for _, row in df.iterrows():
        train_examples.append(InputExample(texts=[str(row['text_a']), str(row['text_b'])], label=float(row['label'])))

    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
    train_loss = losses.CosineSimilarityLoss(model)

    print("Starting fine-tuning (Supervised Similarity)...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=1,
        warmup_steps=100,
        output_path="models/workshop_recommender"
    )
    print("Training complete. Model saved to 'models/workshop_recommender'")

if __name__ == "__main__":
    train()
