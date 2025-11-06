from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load your pre-trained ML model
model = joblib.load("borrow_match_model.pkl")

@app.route('/')
def home():
    return {"message": "ML Match API running — supports borrower and lender ranking!"}

@app.route("/search", methods=["POST"])
def search():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data received"}), 400
        print("🧾 Received:", data)
        mode = data.get("mode", "borrower")
        borrower = data.get("borrower", {})
        lender = data.get("lender", {})
        item = data.get("item", {})
        candidates = data.get("candidates", [])

        if not candidates:
            return jsonify({"error": "No candidates provided"}), 400

        ranked = []

        for candidate in candidates:
            if mode == "borrower":
                X = np.array([[
                    borrower.get("trust", 50),
                    candidate.get("trust", 50),
                    item.get("available", 1),   # ✅ Added this
                    item.get("value", 3),
                    candidate.get("distance", 5)
                ]])
            else:
                X = np.array([[
                    candidate.get("trust", 50),
                    lender.get("trust", 50),
                    item.get("available", 1),   # ✅ Added this
                    item.get("value", 3),
                    candidate.get("distance", 5)
                ]])

            prob = model.predict_proba(X)[0][1]
            ranked.append({
                "id": candidate.get("id"),
                "trust": candidate.get("trust"),
                "distance": candidate.get("distance"),
                "match_prob": round(float(prob), 3)
            })

        ranked.sort(key=lambda x: x["match_prob"], reverse=True)
        return jsonify(ranked[:5])

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)