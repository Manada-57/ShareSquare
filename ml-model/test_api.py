import requests
import json

url = "http://127.0.0.1:5000/search"

# borrower → find best lenders
borrower_case = {
    "mode": "borrower",
    "borrower": {"trust": 70},
    "item": {"available": 1, "value": 3},
    "candidates": [
        {"id": 1, "trust": 60, "distance": 5},
        {"id": 2, "trust": 80, "distance": 2},
        {"id": 3, "trust": 55, "distance": 8},
        {"id": 4, "trust": 90, "distance": 1},
        {"id": 5, "trust": 65, "distance": 3},
    ]
}

# lender → find best borrowers
lender_case = {
    "mode": "lender",
    "lender": {"trust": 85},
    "item": {"available": 1, "value": 3},
    "candidates": [
        {"id": 101, "trust": 60, "distance": 2},
        {"id": 102, "trust": 75, "distance": 5},
        {"id": 103, "trust": 55, "distance": 1},
        {"id": 104, "trust": 90, "distance": 3},
    ]
}

print("\n✅ Borrower-side results:")
print(json.dumps(requests.post(url, json=borrower_case).json(), indent=4))

print("\n✅ Lender-side results:")
print(json.dumps(requests.post(url, json=lender_case).json(), indent=4))
