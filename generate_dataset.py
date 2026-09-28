from pathlib import Path
import cv2
import numpy as np
import pandas as pd

ROOT = Path(__file__).parent
DATA = ROOT / "data"
OUT = ROOT / "results" / "growth_dataset.csv"


def visual_features(path):
    im = cv2.imread(str(path))

    if im is None:
        return {
            "exg_mean": np.nan,
            "exg_p90": np.nan,
            "exg_positive_pct": np.nan,
            "green_pct": np.nan
        }

    h, w = im.shape[:2]
    scale = min(1.0, 500.0 / max(h, w))

    if scale < 1.0:
        im = cv2.resize(
            im,
            (int(w * scale), int(h * scale))
        )

    h, w = im.shape[:2]

    im = im[
        int(0.10 * h):int(0.90 * h),
        int(0.10 * w):int(0.90 * w)
    ]

    b, g, r = cv2.split(im.astype(np.float32))

    exg = 2 * g - r - b

    hsv = cv2.cvtColor(
        im.astype(np.uint8),
        cv2.COLOR_BGR2HSV
    )

    green = (
        (hsv[:, :, 0] >= 35) &
        (hsv[:, :, 0] <= 95) &
        (hsv[:, :, 1] >= 35) &
        (hsv[:, :, 2] >= 35)
    )

    return {
        "exg_mean": float(np.mean(exg)),
        "exg_p90": float(np.percentile(exg, 90)),
        "exg_positive_pct": float(np.mean(exg > 10) * 100),
        "green_pct": float(np.mean(green) * 100)
    }


def extract_day(day):

    folder = DATA / day

    if not folder.exists():
        print(f"Skipping {day}: folder not found.")
        return None

    rows = []

    for box in range(1, 23):

        side_files = [
            folder / f"{box}.{view}.jpg"
            for view in range(1, 5)
        ]

        top_file = folder / f"{box}.5.jpg"

        required_files = side_files + [top_file]

        if not all(f.exists() for f in required_files):
            print(f"Missing image(s) for Box {box} in {day}")
            continue

        side_features = [
            visual_features(f)
            for f in side_files
        ]

        top_features = visual_features(top_file)

        row = {
            "box_id": box,
            "day": int(day.split()[-1]),
            "top_file": top_file.name
        }

        for key, value in top_features.items():
            row["top_" + key] = value

        for key in top_features:

            values = [
                feature[key]
                for feature in side_features
            ]

            row["side_mean_" + key] = float(
                np.nanmean(values)
            )

        rows.append(row)

    return pd.DataFrame(rows)


# -----------------------------
# PROCESS ALL DAYS
# -----------------------------

frames = []

day_folders = sorted(
    [
        p.name
        for p in DATA.glob("Day *")
        if p.is_dir()
    ],
    key=lambda x: int(x.split()[-1])
)

for day in day_folders:

    print(f"Processing {day}...")

    result = extract_day(day)

    if result is not None and not result.empty:
        frames.append(result)


if not frames:
    raise SystemExit(
        "No usable Day folders found."
    )


img = pd.concat(
    frames,
    ignore_index=True
)


# -----------------------------
# MERGE WITH RECIPE DATA
# -----------------------------

recipes = pd.read_csv(
    DATA / "recipes.csv"
)

df = img.merge(
    recipes,
    on="box_id",
    how="left"
).sort_values(
    ["box_id", "day"]
)


# -----------------------------
# NORMALISE VISUAL FEATURES
# -----------------------------

for column in [
    "top_exg_mean",
    "top_exg_positive_pct",
    "top_green_pct"
]:

    minimum = df[column].min()
    maximum = df[column].max()

    df[column + "_norm"] = (
        (df[column] - minimum)
        /
        (maximum - minimum + 1e-9)
    )


# -----------------------------
# VISUAL GROWTH INDEX
# -----------------------------

df["visual_growth_index"] = 100 * (

    0.45 * df["top_exg_mean_norm"]

    +

    0.45 * df["top_exg_positive_pct_norm"]

    +

    0.10 * df["top_green_pct_norm"]

)


# -----------------------------
# SAVE DATASET
# -----------------------------

OUT.parent.mkdir(
    exist_ok=True
)

df.to_csv(
    OUT,
    index=False
)


print()
print("SUCCESS!")
print(f"Dataset saved to: {OUT}")
print(f"Total rows: {len(df)}")
print(f"Boxes: {df['box_id'].nunique()}")
print(f"Days: {df['day'].nunique()}")