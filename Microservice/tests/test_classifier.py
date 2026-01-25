"""
Integration test for the Category Classifier.
Requires the model to be trained and present in the models/ folder.
"""
from app.services.classifier import classifier

def test_prediction():
    print("\n--- Testing Classifier Service ---")
    
    samples = [
        ("Momo Making Masterclass", "Join us to learn how to make traditional Nepali momos from scratch."),
        ("Yoga Flow in the Hills", "Early morning yoga session with panoramic views of the Himalayas.")
    ]
    
    for title, desc in samples:
        try:
            suggested, score, confident, raw = classifier.predict(title, desc)
            print(f"Input: {title}")
            print(f"Result: {suggested} (Score: {score:.2f}, Confident: {confident})")
            print("-" * 20)
        except Exception as e:
            print(f"Test failed: {e}")

if __name__ == "__main__":
    if classifier.model_loaded:
        test_prediction()
    else:
        print("Model not loaded. Skip test.")
