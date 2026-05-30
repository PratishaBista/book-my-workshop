"""Manual check: python -m tests.test_enhancer (from Microservice folder)"""
from app.services.enhancer import enhancer


def test_enhancement():
    sample = "we teach pottery for beginers. come learn make cup."
    print("\n--- Text enhancer ---")
    print(f"Providers: {[p[0] for p in enhancer._providers]}")
    outcome = enhancer.enhance(sample)
    print(f"Provider: {outcome.provider}")
    print(f"Error: {outcome.error}")
    print(f"Enhanced:\n{outcome.text}\n")


if __name__ == "__main__":
    test_enhancement()
