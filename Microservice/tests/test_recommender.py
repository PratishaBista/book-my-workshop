from sentence_transformers import SentenceTransformer, util
import os

def test_inference():
    model_path = "models/workshop_recommender"
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Please run training/train_recommender.py first.")
        return

    model = SentenceTransformer(model_path)
    print("Model loaded successfully.")

    workshop_db = [
        "Sourdough Secrets: Traditional Fermentation",
        "Classic Croissant Masterclass",
        "Macaron Artistry: French Shells & Ganache",
        "Thimi Pottery Wheel: Clay Shaping",
        "Himalayan Yoga Flow: Sunrise Session",
        "Double Chocolate Brownie Bash",
        "Newari Wood Carving: Floral Patterns",
        "Belgian Waffle Making & Toppings",
        "Oil Painting Portraits in Thamel",
        "Vibing with Singing Bowls: Healing Session",
        "Donut Glazing & Rainbow Toppings",
        "Italian Pasta Night (Savory)"
    ]

    source_workshop = "Baking Cookies and Cupcakes"
    print(f"\nSOURCE WORKSHOP: '{source_workshop}'")

    source_vec = model.encode(source_workshop)
    db_vecs = model.encode(workshop_db)

    scores = util.cos_sim(source_vec, db_vecs)[0]

    results = []
    for i in range(len(workshop_db)):
        results.append({ "name": workshop_db[i], "score": float(scores[i]) })

    results = sorted(results, key=lambda x: x['score'], reverse=True)

    print("TOP 5 RECOMMENDATIONS (Content-Based):")
    for i, res in enumerate(results[:5]):
        print(f"{i+1}. {res['name']} (Similarity: {res['score']:.4f})")

if __name__ == "__main__":
    test_inference()
