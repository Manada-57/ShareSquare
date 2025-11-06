# train_model.py
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# Features: [borrower_trust, lender_trust, item_available, item_value, distance]
X = np.array([
    [50, 50, 1, 1, 5],
    [55, 60, 1, 2, 4],
    [60, 65, 1, 3, 3],
    [65, 70, 1, 3, 3],
    [70, 70, 1, 3, 2],
    [75, 75, 1, 4, 2],
    [80, 80, 1, 3, 2],
    [85, 85, 1, 4, 1],
    [90, 90, 1, 5, 1],
    [95, 95, 1, 5, 1],
    [50, 60, 1, 1, 6],
    [55, 65, 1, 2, 5],
    [60, 70, 1, 2, 4],
    [65, 75, 1, 3, 3],
    [70, 80, 1, 3, 2],
    [75, 85, 1, 4, 2],
    [80, 90, 1, 4, 1],
    [85, 95, 1, 5, 1],
    [90, 100, 1, 5, 1],
    [95, 100, 1, 5, 1],
    [50, 55, 0, 1, 5],
    [55, 60, 0, 2, 4],
    [60, 65, 0, 3, 3],
    [65, 70, 0, 3, 3],
    [70, 75, 0, 3, 2],
    [75, 80, 0, 4, 2],
    [80, 85, 0, 3, 2],
    [85, 90, 0, 4, 1],
    [90, 95, 0, 5, 1],
    [95, 100, 0, 5, 1],
    [50, 50, 1, 1, 7],
    [55, 55, 1, 2, 6],
    [60, 60, 1, 3, 5],
    [65, 65, 1, 3, 4],
    [70, 70, 1, 3, 3],
    [75, 75, 1, 4, 2],
    [80, 80, 1, 4, 2],
    [85, 85, 1, 5, 1],
    [90, 90, 1, 5, 1],
    [95, 95, 1, 5, 1],
    [50, 65, 1, 1, 6],
    [60, 75, 1, 2, 4],
    [70, 85, 1, 3, 3],
    [80, 90, 1, 4, 2],
    [90, 95, 1, 5, 1],
    [55, 70, 0, 2, 5],
    [65, 80, 0, 3, 3],
    [75, 90, 0, 4, 2],
    [85, 95, 0, 5, 1],
    [95, 100, 0, 5, 1]
])

# Labels: 1 = successful match, 0 = unsuccessful
y = np.array([
    0,0,0,1,1,1,1,1,1,1,
    0,0,1,1,1,1,1,1,1,1,
    0,0,0,0,1,1,1,1,1,1,
    0,0,0,1,1,1,1,1,1,1,
    0,0,1,1,1,0,0,1,1,1
])

# Train RandomForest
clf = RandomForestClassifier(n_estimators=500, random_state=42)
clf.fit(X, y)

# Save model using joblib
joblib.dump(clf, "borrow_match_model.pkl")
print("✅ Model trained with 50 samples and saved as borrow_match_model.pkl")