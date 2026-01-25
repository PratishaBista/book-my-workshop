"""
Integration test for the Text Enhancer.
Requires a valid HF_API_TOKEN in the .env file.
"""
from app.services.enhancer import enhancer

def test_enhancement():
    print("\n--- Testing Text Enhancer Service ---")
    
    sample = "we gonna make pottery it will be fun bring clothes that can get dirty"
    print(f"Original: {sample}")
    print("Enhancing...")
    
    result = enhancer.enhance(sample)
    print(f"Enhanced:\n{result}\n")
    print("-" * 20)

if __name__ == "__main__":
    if enhancer.client:
        test_enhancement()
    else:
        print("Enhancer client not initialized (check your HF_API_TOKEN).")
