import pandas as pd
import random

CATEGORIES = [
    "Culinary Arts",
    "Traditional Crafts",
    "Visual Arts",
    "Wellness & Mind",
    "Digital & Tech",
    "Lifestyle & Garden",
    "Performing Arts"
]

TEMPLATES = [
    "Learn the art of {skill}. Join our expert-led session to master {detail}.",
    "Discover the secrets of {skill}. This interactive workshop covers {detail} and more.",
    "Master {skill} in this intensive masterclass. We focus on {detail} for all levels.",
    "Unleash your creativity with {skill}. A dedicated space for {detail}.",
    "An immersive experience in {skill}. Perfect for those interested in {detail}.",
    "Practical {skill} workshop. Hands-on learning focused on {detail}.",
    "Traditional {skill} session. Connect with the roots of {detail}."
]

DATA_MAP = {
    "Culinary Arts": [
        ("Momo Making", "traditional Nepali dumplings with spicy achar"),
        ("Newari Samay Baji", "preparing the iconic Newari feast from scratch"),
        ("Sourdough Bread", "fermentation techniques and scoring for perfect crust"),
        ("Sushi Rolling", "perfecting sushi rice and fresh fish preparation"),
        ("Italian Pasta Crafting", "making fresh fettuccine and authentic sauces"),
        ("THAI Curry Secrets", "crushing fresh paste and balancing coconut flavors"),
        ("Nepali Tea Tasting", "exploring high-altitude tea varieties from Ilam"),
        ("French Pastry", "the delicate science of macarons and croissants"),
        ("Cocktail Mixology", "balanced drink design and advanced garnishing"),
        ("Bara & Choila Prep", "smoking meat and lentils in the traditional way")
    ],
    "Traditional Crafts": [
        ("Mithila Painting", "the ancient Madhubani art styles from Janakpur"),
        ("Dhaka Weaving", "intricate patterns of Nepal's traditional handloom"),
        ("Thimi Pottery", "shaping clay on the traditional wheel in Bhaktapur"),
        ("Wood Carving", "classic Newari windows and floral patterns"),
        ("Knitting & Crochet", "modern patterns using sustainable Himalayan wool"),
        ("Leather Crafting", "hand-stitching wallets and durable accessories"),
        ("Copper Smithing", "hammering techniques for traditional vessels"),
        ("Jewelry Making", "silver smithing and stone setting basics"),
        ("Macrame Decor", "creative knots for wall hangings and plant holders"),
        ("Pashmina Embroidery", "delicate needlework on fine cashmere wool")
    ],
    "Visual Arts": [
        ("Thanka Painting", "sacred geometry and gold leaf application"),
        ("Fluid Acrylic Pouring", "creating abstract cells and color gradients"),
        ("Watercolour Landscapes", "mastering wash techniques and light layers"),
        ("Portrait Sketching", "anatomy, shading, and capturing human emotion"),
        ("Digital Illustration", "procreate techniques for modern artists"),
        ("Graffiti & Street Art", "spray can control and mural design"),
        ("Oil Painting Basics", "layering, blending, and texture development"),
        ("Calligraphy", "elegant script strokes and ink management"),
        ("Photography Masterclass", "light, composition, and manual camera control"),
        ("Block Printing", "hand-carving blocks for textile design")
    ],
    "Wellness & Mind": [
        ("Vipassana Meditation", "mindfulness and breath awareness techniques"),
        ("Himalayan Yoga Flow", "connecting movement with high-altitude energy"),
        ("Sound Healing", "using Tibetan singing bowls for relaxation"),
        ("Forest Bathing", "reconnecting with nature in the hills of Shivapuri"),
        ("Reiki Level 1", "energy healing and self-treatment basics"),
        ("Aromatherapy Essentials", "blending oils for sleep and focus"),
        ("Journaling for Clarity", "structured prompts to reduce anxiety"),
        ("Pranayama Breathwork", "ancient techniques for nervous system calm"),
        ("Tai Chi Basics", "gentle flowing movements for balance"),
        ("Ayurvedic Nutrition", "eating for your unique body constitution")
    ],
    "Digital & Tech": [
        ("Python for Beginners", "writing your first scripts and automation"),
        ("UX Design Principles", "building user-centric mobile application prototypes"),
        ("AI Prompt Engineering", "optimizing output from large language models"),
        ("Excel for Analysts", "vlookup, pivot tables, and data visualization"),
        ("No-Code App Building", "creating tools with Bubble and Webflow"),
        ("Cybersecurity Basics", "protecting personal data and network security"),
        ("React Fundamentals", "building modern web interfaces with components"),
        ("Game Dev with Unity", "creating 2D platformers from scratch"),
        ("Social Media Strategy", "growth algorithms and content planning"),
        ("Cloud Computing", "deploying applications on AWS and Azure")
    ],
    "Lifestyle & Garden": [
        ("Terrace Farming", "growing organic vegetables in urban spaces"),
        ("Sustainable Fashion", "upcycling old clothes into modern pieces"),
        ("Candle Crafting", "using soy wax and organic scents"),
        ("Bonsai Tree Care", "pruning and shaping miniature trees"),
        ("Home Composting", "turning kitchen waste into rich black gold"),
        ("Indoor Plant Styling", "matching plants to your home's lighting"),
        ("Zero Waste Living", "practical steps to reduce household plastic"),
        ("Organic Soap Making", "cold-process soap using natural herbs"),
        ("Beekeeping Basics", "maintaining hives and harvesting honey"),
        ("Coffee Roasting", "from green bean to the perfect cup")
    ],
    "Performing Arts": [
        ("Madal Playing", "mastering the heartbeat of Nepali folk music"),
        ("Salsa Dancing", "rhythm, footwork, and partner coordination"),
        ("Sarangi Lessons", "vocal-like bowing on the traditional fiddle"),
        ("Classic Theater", "improv techniques and stage presence"),
        ("Vocal Training", "expanding range and breath control"),
        ("Hip Hop Foundations", "groove, bounce, and basic choreography"),
        ("Acoustic Guitar", "fingerpicking and open chord progressions"),
        ("Stand-up Comedy", "joke structure, setup, and delivery"),
        ("Traditional Lakhey Dance", "masked dance movements and mythology"),
        ("Djembe Drumming", "African rhythms and hand techniques")
    ]
}

def generate_dataset(num_samples=1500):
    dataset = []
    
    samples_per_category = num_samples // len(CATEGORIES)
    
    for category in CATEGORIES:
        skills_data = DATA_MAP[category]
        for _ in range(samples_per_category):
            skill, detail = random.choice(skills_data)
            template = random.choice(TEMPLATES)
            
            title_styles = [
                f"{skill} Workshop",
                f"Mastering {skill}",
                f"{skill}: Beginner to Pro",
                f"The Art of {skill}",
                f"{skill} Experience",
                f"Introduction to {skill}",
                f"Traditional {skill} Class"
            ]
            title = random.choice(title_styles)
            
            description = template.format(skill=skill, detail=detail)
            
            text = f"{title}. {description}"
            
            dataset.append({
                "text": text,
                "category": category
            })
            
    return pd.DataFrame(dataset)

if __name__ == "__main__":
    df = generate_dataset(2100) 
    save_path = "data/raw/workshop_training_data.csv"
    import os
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    df.to_csv(save_path, index=False)
    print(f"Dataset generated with {len(df)} samples at {save_path}.")
    print(df.head())
