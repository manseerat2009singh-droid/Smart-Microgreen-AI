from flask import Flask, render_template, jsonify, request
from pathlib import Path
import pandas as pd
import csv
from datetime import datetime

app = Flask(__name__)

ROOT = Path(__file__).parent

# Find the dataset automatically
DATASET = ROOT / "growth_dataset.csv"

if not DATASET.exists():
    DATASET = ROOT / "results" / "growth_dataset.csv"

df = pd.read_csv(DATASET)


def clean_value(value):
    if pd.isna(value):
        return None

    try:
        return float(value)
    except:
        return str(value)


@app.route("/")
def home():
    return render_template(
        "index.html",
        boxes=int(df["box_id"].nunique()),
        days=int(df["day"].nunique()),
        records=len(df),
        avg_vgi=round(float(df["visual_growth_index"].mean()), 2)
    )


@app.route("/api/box/<int:box_id>")
def box_analysis(box_id):

    box_data = df[df["box_id"] == box_id]

    if box_data.empty:
        return jsonify({"error": "Box not found"}), 404

    latest = box_data.sort_values("day").iloc[-1]

    return jsonify({
        "box_id": box_id,
        "day": int(latest["day"]),
        "vgi": round(float(latest["visual_growth_index"]), 2),
        "green": round(float(latest["top_green_pct"]), 2),
        "exg": round(float(latest["top_exg_mean"]), 2)
    })


@app.route("/api/trend")
def trend():

    trend_data = (
        df.groupby("day")["visual_growth_index"]
        .mean()
        .reset_index()
    )

    return jsonify([
        {
            "day": int(row["day"]),
            "vgi": round(float(row["visual_growth_index"]), 2)
        }
        for _, row in trend_data.iterrows()
    ])


@app.route("/api/comparison")
def comparison():

    latest = (
        df.sort_values("day")
        .groupby("box_id")
        .tail(1)
        .sort_values("box_id")
    )

    return jsonify([
        {
            "box": int(row["box_id"]),
            "vgi": round(float(row["visual_growth_index"]), 2)
        }
        for _, row in latest.iterrows()
    ])


@app.route("/feedback", methods=["POST"])
def feedback():

    data = request.json

    feedback_file = ROOT / "feedback.csv"

    file_exists = feedback_file.exists()

    with open(feedback_file, "a", newline="", encoding="utf-8") as f:

        writer = csv.writer(f)

        if not file_exists:
            writer.writerow(["date", "name", "rating", "message"])

        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M"),
            data.get("name", ""),
            data.get("rating", ""),
            data.get("message", "")
        ])

    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)