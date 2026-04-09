import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class IntegrityEngine:
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def check_consistency(self, registration_text: str, document_text: str, website_text: str = None) -> dict:
        """
        Sophisticated Trust Scoring: Cross-references Identity, Entity, and Digital presence.
        """
        try:
            # 1. Identity Match: Does the Person's Name appear in the Documents?
            # doc_text usually contains: "FullName FileName_ID.jpg FileName_PAN.jpg"
            # reg_text contains: "FullName"
            
            # Split reg_text to find the name (it's often at the start)
            name_match_score = self._calculate_identity_score(registration_text, document_text)
            
            # 2. Entity Alignment: Does the Business Name/Description match the Documents?
            entity_score = self._calculate_entity_score(registration_text, document_text)
            
            # 3. Digital Footprint: Website Domain Similarity
            web_score = 0.0
            if website_text and len(website_text) > 5:
                # Check for business name keywords in domain
                web_score = self._calculate_web_score(registration_text, website_text)
            
            # 4. Final Weighted Scoring
            # Identity is paramount (50%), Entity Match (30%), Digital Presence (20%)
            weighted_score = (name_match_score * 0.5) + (entity_score * 0.3) + (web_score * 0.2)
            
            # If identity match is perfect (100%), boost the overall score
            if name_match_score > 0.9:
                weighted_score = max(weighted_score, 85.0) # High trust if person is verified

            final_percentage = float(max(min(weighted_score, 100), 0))

            return {
                "overallScore": final_percentage,
                "summary": self._generate_summary(final_percentage),
                "checks": [
                    {
                        "name": "Identity Verification",
                        "score": float(name_match_score / 100),
                        "message": "Personal name verified against document metadata." if name_match_score > 70 else "Personal name mismatch in documents.",
                        "passed": name_match_score > 70
                    },
                    {
                        "name": "Entity Integrity",
                        "score": float(entity_score / 100),
                        "message": "Business name aligns with registration details." if entity_score > 40 else "Business details are unverified.",
                        "passed": entity_score > 40
                    },
                    {
                        "name": "Digital Footprint",
                        "score": float(web_score / 100),
                        "message": "Verified digital presence detected." if web_score > 50 else "Limited digital footprint.",
                        "passed": web_score > 50
                    }
                ]
            }
        except Exception as e:
            print(f"Integrity Engine Error: {e}")
            return {"overallScore": 50.0, "summary": "Manual Review Required (AI System Bypass)", "checks": []}

    def _calculate_identity_score(self, reg: str, doc: str) -> float:
        # Extract names (looking for Title Case pairs)
        reg_names = re.findall(r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b', reg)
        doc_normalized = doc.lower().replace('_', ' ').replace('-', ' ')
        
        max_id_score = 0.0
        for name in reg_names:
            name_parts = name.lower().split()
            # If all parts of the name appear in the doc text
            if all(part in doc_normalized for part in name_parts):
                max_id_score = 100.0
                break
            # Partial match
            match_count = sum(1 for part in name_parts if part in doc_normalized)
            if match_count > 0:
                max_id_score = max(max_id_score, (match_count / len(name_parts)) * 80)
                
        return max_id_score

    def _calculate_entity_score(self, reg: str, doc: str) -> float:
        # Cosine similarity on the whole text
        reg_clean = re.sub(r'[^\w\s]', '', reg.lower())
        doc_clean = re.sub(r'[^\w\s]', '', doc.lower().replace('_', ' '))
        
        try:
            tfidf = self.vectorizer.fit_transform([reg_clean, doc_clean])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(sim * 100)
        except:
            return 0.0

    def _calculate_web_score(self, reg: str, url: str) -> float:
        # Extract domain keywords
        domain = re.sub(r'https?://(www\.)?', '', url.lower()).split('.')[0]
        reg_keywords = re.findall(r'\b\w{4,}\b', reg.lower()) # words 4+ chars
        
        if any(kw in domain for kw in reg_keywords):
            return 100.0
        return 20.0 # Base score for having a URL

    def _generate_summary(self, score: float) -> str:
        if score > 85: return "High-Quality Match: Host identity and business details are highly consistent."
        if score > 50: return "Medium Trust: Identity is verified but business details require manual review."
        return "Manual Investigation Required: Significant data inconsistencies detected."

# Singleton
integrity_engine = IntegrityEngine()
