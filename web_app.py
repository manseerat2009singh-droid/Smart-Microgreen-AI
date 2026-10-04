from flask import Flask, render_template, jsonify, request, send_file
from pathlib import Path
import pandas as pd
import csv
from datetime import datetime
import os

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

@app.route("/dashboard")
def dashboard():
    return render_template(
        "dashboard.html",
        boxes=int(df["box_id"].nunique()),
        days=int(df["day"].nunique()),
        records=len(df),
        avg_vgi=round(float(df["visual_growth_index"].mean()), 2)
    )


@app.route("/analysis")
def analysis():
    return render_template("analysis.html")


@app.route("/feedback")
def feedback_page():
    return render_template("feedback.html")


@app.route("/team")
def team():
    return render_template("team.html")

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

@app.route("/api/box/<int:box_id>/trend")
def box_trend(box_id):

    box_data = (
        df[df["box_id"] == box_id]
        .sort_values("day")
    )

    if box_data.empty:
        return jsonify({"error": "Box not found"}), 404

    return jsonify([
        {
            "day": int(row["day"]),
            "vgi": round(float(row["visual_growth_index"]), 2)
        }
        for _, row in box_data.iterrows()
    ])

@app.route("/api/box/<int:box_id>/profile")
def box_profile(box_id):

    box_data = (
        df[df["box_id"] == box_id]
        .sort_values("day")
    )

    if box_data.empty:
        return jsonify({"error": "Box not found"}), 404

    latest = box_data.iloc[-1]

    condition_columns = [
        "seed_density",
        "seed_soaking_time",
        "biofertilizer",
        "cocopeat",
        "harvest_time",
        "blackout_duration",
        "nutrient_ec",
        "nutrient_spray_start_day",
        "media_thickness",
        "seaweed"
    ]

    conditions = {
        col: clean_value(latest[col])
        for col in condition_columns
        if col in box_data.columns
    }

    history = [
        {
            "day": int(row["day"]),
            "vgi": round(float(row["visual_growth_index"]), 2),
            "green": round(float(row["top_green_pct"]), 2),
            "exg": round(float(row["top_exg_mean"]), 2)
        }
        for _, row in box_data.iterrows()
    ]

    first_vgi = history[0]["vgi"]
    latest_vgi = history[-1]["vgi"]

    return jsonify({
        "box_id": box_id,
        "latest_day": int(latest["day"]),
        "vgi": latest_vgi,
        "green": round(float(latest["top_green_pct"]), 2),
        "exg": round(float(latest["top_exg_mean"]), 2),
        "change_from_first": round(latest_vgi - first_vgi, 2),
        "conditions": conditions,
        "history": history
    })

@app.route("/api/box/<int:box_id>/images/<int:day>")
def box_images(box_id, day):

    image_dir = ROOT / "data" / f"Day {day}"

    if not image_dir.exists():
        return jsonify({"error": "Day images not found"}), 404

    images = []

    for view in range(1, 6):

        image_path = image_dir / f"{box_id}.{view}.jpg"

        if image_path.exists():
            images.append({
                "view": view,
                "url": f"/data/Day%20{day}/{box_id}.{view}.jpg"
            })

    return jsonify({
        "box_id": box_id,
        "day": day,
        "images": images
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


@app.route("/api/image/<int:day>/<int:box_id>/<int:view>")
def serve_image(day, box_id, view):

    image_dir = ROOT / "data" / f"Day {day}"

    matches = list(image_dir.glob(f"{box_id}.{view}.*"))

    if not matches:
        return jsonify({"error": "Image not found"}), 404

    image_path = matches[0]

    if image_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
        return send_file(image_path)

    if image_path.suffix.lower() in [".heic", ".heif"]:

        import io
        from PIL import Image
        import pillow_heif

        heif = pillow_heif.read_heif(str(image_path))

        image = Image.frombytes(
            heif.mode,
            heif.size,
            heif.data
        )

        output = io.BytesIO()
        image.save(output, format="JPEG", quality=90)
        output.seek(0)

        return send_file(
            output,
            mimetype="image/jpeg"
        )

    return jsonify({"error": "Unsupported image format"}), 415


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))