import pandas as pd
import random
import os

# Define Clusters for supervised similarity training
CLUSTERS = {
    "Sweets & Baking": [
        "Sourdough Bread Making", "Classic Croissant Masterclass", "Macaron Artistry", 
        "Double Chocolate Brownies", "Japanese Souffle Pancakes", "Artisan Donut Glazing",
        "New York Cheesecake", "Belgian Waffle Making", "Cupcake Decoration", 
        "Strawberry Shortcake Basics", "Cinnamon Roll Sunday", "Chocolate Truffle Workshops"
    ],
    "Traditional Nepali Crafts": [
        "Thimi Pottery Wheel", "Mithila Painting Studio", "Dhaka Weaving Workshop",
        "Newari Wood Carving", "Metal Hammering (Copper)", "Handmade Lokta Paper",
        "Brass Carving Basics", "Traditional Mask Painting"
    ],
    "Wellness & Mind": [
        "Himalayan Yoga Flow", "Tibetan Singing Bowl Healing", "Vipassana Meditation",
        "Sound Bath Experience", "Himalayan Herbal Tea Science", "Forest Bathing (Shivapuri)",
        "Aromatherapy Blending"
    ],
    "Visual Arts": [
        "Watercolor Landscapes", "Oil Painting Portraits", "Acrylic Pour Art",
        "Charcoal Life Drawing", "Pencil Sketching Kathmandu", "Devanagari Calligraphy"
    ]
}

# Cross-category similarity weights
# Baking is highly similar to other Baking (1.0)
# Baking is somewhat similar to Cooking (0.6) 
# Craft is similar to Art (0.5)

def generate_text_for_workshop(workshop_name):
    templates = [
        "Master the art of {name}. A hands-on creative session in Kathmandu.",
        "Discover {name} with our expert instructors. Perfect for beginners.",
        "Immersive {name} experience. Learn traditional techniques and modern styles.",
        "Join our {name} workshop. All materials provided for a fun afternoon."
    ]
    return random.choice(templates).format(name=workshop_name)

def generate_similarity_dataset(num_pairs=5000):
    all_workshops = []
    for cluster_name, workshops in CLUSTERS.items():
        for w in workshops:
            all_workshops.append({
                "name": w,
                "cluster": cluster_name,
                "text": generate_text_for_workshop(w)
            })
    
    data = []
    
    # Generate Positive Pairs (Same Cluster)
    for _ in range(num_pairs // 2):
        cluster = random.choice(list(CLUSTERS.keys()))
        w1, w2 = random.sample(CLUSTERS[cluster], 2)
        
        t1 = generate_text_for_workshop(w1)
        t2 = generate_text_for_workshop(w2)
        
        data.append({
            "text_a": f"{w1}. {t1}",
            "text_b": f"{w2}. {t2}",
            "label": 1.0  # Highly similar
        })
        
    # Generate Negative Pairs (Different Clusters)
    for _ in range(num_pairs // 2):
        c1, c2 = random.sample(list(CLUSTERS.keys()), 2)
        w1 = random.choice(CLUSTERS[c1])
        w2 = random.choice(CLUSTERS[c2])
        
        t1 = generate_text_for_workshop(w1)
        t2 = generate_text_for_workshop(w2)
        
        # Exception: Some overlaps like Wellness and Art might be soft-negatives, but for now 0.0
        data.append({
            "text_a": f"{w1}. {t1}",
            "text_b": f"{w2}. {t2}",
            "label": 0.0  # Dissimilar
        })
    
    random.shuffle(data)
    return pd.DataFrame(data)

if __name__ == "__main__":
    os.makedirs("data/raw", exist_ok=True)
    df = generate_similarity_dataset(6000)
    save_path = "data/raw/similarity_training_data.csv"
    df.to_csv(save_path, index=False)
    print(f"Generated {len(df)} pairs for supervised similarity training at {save_path}")
    print(df.head())
