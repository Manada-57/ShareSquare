from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Load trained ML model
MODEL_PATH = "borrow_match_model.pkl"
model = joblib.load(MODEL_PATH)

@app.route("/")
def home():
    return jsonify({"message": "✅ ML Match API is running on Flask (port 5000)"})

@app.route("/search", methods=["POST"])
def search():
    try:
        data = request.get_json()

        mode = data.get("mode", "borrower")  # either "borrower" or "lender"
        borrower = data.get("borrower", {})
        lender = data.get("lender", {})
        item = data.get("item", {})
        candidates = data.get("candidates", [])

        if not candidates:
            return jsonify({"error": "No candidates provided"}), 400

        ranked = []

        for candidate in candidates:
            # Build feature vector depending on mode
            if mode == "borrower":
                features = np.array([[ 
                    borrower.get("trust", 50),
                    candidate.get("trust", 50),
                    item.get("available", 1),
                    item.get("value", 1),
                    candidate.get("distance", 5)
                ]])
            else:
                features = np.array([[ 
                    candidate.get("trust", 50),
                    lender.get("trust", 50),
                    item.get("available", 1),
                    item.get("value", 1),
                    candidate.get("distance", 5)
                ]])

            # Predict match probability
            prob = model.predict_proba(features)[0][1]

            ranked.append({
                "id": candidate.get("id"),
                "trust": candidate.get("trust"),
                "distance": candidate.get("distance"),
                "match_prob": round(float(prob), 3)
            })

        # Sort by probability descending
        ranked.sort(key=lambda x: x["match_prob"], reverse=True)

        return jsonify(ranked[:5])  # return top 5 matches

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
