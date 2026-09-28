import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path
import pandas as pd
import cv2
import numpy as np
import matplotlib.pyplot as plt


# ============================================================
# PROJECT PATHS
# ============================================================

ROOT = Path(__file__).parent
DATASET = ROOT / "results" / "growth_dataset.csv"


# ============================================================
# LOAD DATA
# ============================================================

try:
    df = pd.read_csv(DATASET)
except Exception:
    df = pd.DataFrame()


# ============================================================
# GROWTH LEVEL
# ============================================================

def growth_level(value):

    if value < 33:
        return "Low Growth"
    elif value < 66:
        return "Moderate Growth"
    else:
        return "High Growth"


# ============================================================
# GET BOX DATA
# ============================================================

def get_box_data(box):

    if df.empty:
        return None

    data = df[df["box_id"] == box]

    if data.empty:
        return None

    latest_day = data["day"].max()

    latest = data[data["day"] == latest_day].iloc[0]

    return latest


# ============================================================
# SHOW BOX ANALYSIS
# ============================================================

def analyze_box():

    try:
        box = int(box_entry.get())
    except ValueError:
        messagebox.showerror(
            "Invalid Box",
            "Please enter a box number from 1 to 22."
        )
        return

    if box < 1 or box > 22:
        messagebox.showerror(
            "Invalid Box",
            "Please enter a box number from 1 to 22."
        )
        return

    result = get_box_data(box)

    if result is None:
        messagebox.showerror(
            "No Data",
            "No data found for this box."
        )
        return

    growth = float(result["visual_growth_index"])
    level = growth_level(growth)
    day = int(result["day"])

    output_box.delete("1.0", tk.END)

    output_box.insert(
        tk.END,
        f"BOX {box} ANALYSIS\n"
    )

    output_box.insert(
        tk.END,
        "────────────────────────────\n\n"
    )

    output_box.insert(
        tk.END,
        f"Latest Day Analysed : Day {day}\n\n"
    )

    output_box.insert(
        tk.END,
        f"Visual Growth Index : {growth:.2f}/100\n\n"
    )

    output_box.insert(
        tk.END,
        f"Growth Category     : {level}\n\n"
    )

    output_box.insert(
        tk.END,
        f"Top Green Coverage  : "
        f"{result['top_green_pct']:.2f}%\n\n"
    )

    output_box.insert(
        tk.END,
        f"Vegetation Signal   : "
        f"{result['top_exg_positive_pct']:.2f}%\n\n"
    )

    output_box.insert(
        tk.END,
        "Interpretation:\n"
    )

    if growth < 33:
        text = (
            "The image shows relatively lower visible "
            "vegetation development."
        )

    elif growth < 66:
        text = (
            "The image shows moderate visible "
            "vegetation development."
        )

    else:
        text = (
            "The image shows comparatively higher "
            "visible vegetation development."
        )

    output_box.insert(
        tk.END,
        text
    )


# ============================================================
# SHOW DATASET SUMMARY
# ============================================================

def box_comparison_graph():
    if df.empty:
        messagebox.showerror("No Data", "Dataset could not be loaded.")
        return

    latest = (
        df.sort_values("day")
        .groupby("box_id")
        .tail(1)
        .sort_values("box_id")
    )

    plt.figure(figsize=(10, 5))
    plt.bar(
        latest["box_id"].astype(str),
        latest["visual_growth_index"]
    )

    plt.title("Latest Visual Growth Index by Box")
    plt.xlabel("Box Number")
    plt.ylabel("Visual Growth Index")
    plt.ylim(0, 100)
    plt.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    plt.show()

def growth_trend_graph():
    if df.empty:
        messagebox.showerror("No Data", "Dataset could not be loaded.")
        return

    trend = (
        df.groupby("day")["visual_growth_index"]
        .mean()
        .reset_index()
    )

    plt.figure(figsize=(9, 5))
    plt.plot(
        trend["day"],
        trend["visual_growth_index"],
        marker="o"
    )

    plt.title("Average Visual Growth Index Across Days")
    plt.xlabel("Day")
    plt.ylabel("Average Visual Growth Index")
    plt.xticks(trend["day"])
    plt.ylim(0, 100)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

def cultivation_insights():
    output_box.delete("1.0", tk.END)

    if df.empty:
        output_box.insert(tk.END, "Dataset could not be loaded.")
        return

    output_box.insert(tk.END, "CULTIVATION INSIGHTS\n")
    output_box.insert(tk.END, "────────────────────────────\n\n")

    output_box.insert(
        tk.END,
        "The system compares cultivation conditions "
        "with the Visual Growth Index obtained from images.\n\n"
    )

    # Overall growth statistics
    average_growth = df["visual_growth_index"].mean()
    highest_growth = df["visual_growth_index"].max()
    lowest_growth = df["visual_growth_index"].min()

    highest_row = df.loc[
        df["visual_growth_index"].idxmax()
    ]

    lowest_row = df.loc[
        df["visual_growth_index"].idxmin()
    ]

    output_box.insert(
        tk.END,
        f"Average Visual Growth Index : {average_growth:.2f}/100\n\n"
    )

    output_box.insert(
        tk.END,
        f"Highest Observed Index      : {highest_growth:.2f}/100\n"
    )

    output_box.insert(
        tk.END,
        f"  → Box {int(highest_row['box_id'])}, "
        f"Day {int(highest_row['day'])}\n\n"
    )

    output_box.insert(
        tk.END,
        f"Lowest Observed Index       : {lowest_growth:.2f}/100\n"
    )

    output_box.insert(
        tk.END,
        f"  → Box {int(lowest_row['box_id'])}, "
        f"Day {int(lowest_row['day'])}\n\n"
    )

    output_box.insert(
        tk.END,
        "EXPERIMENTAL OBSERVATION\n"
    )
    output_box.insert(
        tk.END,
        "────────────────────────────\n\n"
    )

    # Compare each cultivation variable numerically where possible
    numeric_columns = [
    "seed_density",
    "seed_soaking_time",
    "blackout_duration",
    "nutrient_ec",
    "nutrient_spray_start_day",
    "media_thickness"
]

    for column in numeric_columns:
        if column not in df.columns:
            continue

        temp = df[[column, "visual_growth_index"]].copy()
        temp[column] = pd.to_numeric(temp[column], errors="coerce")
        temp = temp.dropna()

        if len(temp) < 3 or temp[column].nunique() < 2:
            continue

        correlation = temp[column].corr(
            temp["visual_growth_index"]
        )

        if pd.isna(correlation):
            continue

        direction = "positive" if correlation > 0 else "negative"

        output_box.insert(
            tk.END,
            f"• {column}: {direction} association "
            f"(correlation = {correlation:.2f})\n"
        )

    output_box.insert(
        tk.END,
        "\nIMPORTANT:\n"
    )
    output_box.insert(
        tk.END,
        "These are observations from the available experiment. "
        "Correlation does not prove that a cultivation condition "
        "directly causes higher or lower growth.\n"
    )

def show_summary():

    output_box.delete("1.0", tk.END)

    if df.empty:
        output_box.insert(
            tk.END,
            "Dataset could not be loaded."
        )
        return

    boxes = df["box_id"].nunique()
    days = df["day"].nunique()
    rows = len(df)

    output_box.insert(
        tk.END,
        "SMART MICROGREEN AI\n"
    )

    output_box.insert(
        tk.END,
        "DATASET SUMMARY\n"
    )

    output_box.insert(
        tk.END,
        "────────────────────────────\n\n"
    )

    output_box.insert(
        tk.END,
        f"Boxes Analysed : {boxes}\n\n"
    )

    output_box.insert(
        tk.END,
        f"Days Analysed  : {days}\n\n"
    )

    output_box.insert(
        tk.END,
        f"Data Records   : {rows}\n\n"
    )

    output_box.insert(
        tk.END,
        "Image-derived features include:\n\n"
        "• Excess Green Index (ExG)\n"
        "• Green pixel percentage\n"
        "• Vegetation signal\n"
        "• Visual Growth Index\n\n"
    )

    output_box.insert(
        tk.END,
        "The system analyses visible plant "
        "development from the captured images."
    )


# ============================================================
# WEBCAM ANALYSIS
# ============================================================

def webcam_analysis():
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not cap.isOpened():
        messagebox.showerror(
            "Camera Error",
            "Could not access the webcam."
        )
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        cv2.imshow(
            "Smart Microgreen AI - Press SPACE to Analyse | ESC to Exit",
            frame
        )

        key = cv2.waitKey(10) & 0xFF

        # SPACE = analyse current frame
        if key == 32:
            image = frame.copy()

            b, g, r = cv2.split(
                image.astype(np.float32)
            )

            exg = 2 * g - r - b

            hsv = cv2.cvtColor(
                image.astype(np.uint8),
                cv2.COLOR_BGR2HSV
            )

            green = (
                (hsv[:, :, 0] >= 35) &
                (hsv[:, :, 0] <= 95) &
                (hsv[:, :, 1] >= 35) &
                (hsv[:, :, 2] >= 35)
            )

            green_percentage = float(
                np.mean(green) * 100
            )

            vegetation_signal = float(
                np.mean(exg > 10) * 100
            )

            score = min(
                100,
                0.5 * green_percentage +
                0.5 * vegetation_signal
            )

            cap.release()
            cv2.destroyAllWindows()

            output_box.delete("1.0", tk.END)

            output_box.insert(
                tk.END,
                "LIVE WEBCAM ANALYSIS\n"
            )
            output_box.insert(
                tk.END,
                "────────────────────────────\n\n"
            )

            output_box.insert(
                tk.END,
                f"Visual Growth Score : {score:.2f}/100\n\n"
            )

            output_box.insert(
                tk.END,
                f"Green Coverage      : "
                f"{green_percentage:.2f}%\n\n"
            )

            output_box.insert(
                tk.END,
                f"Vegetation Signal   : "
                f"{vegetation_signal:.2f}%\n\n"
            )

            output_box.insert(
                tk.END,
                f"Assessment          : "
                f"{growth_level(score)}\n\n"
            )

            output_box.insert(
                tk.END,
                "This is a real-time visual assessment "
                "based on vegetation characteristics "
                "captured by the webcam."
            )

            return

        # ESC = safely close webcam
        elif key == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

root = tk.Tk()

root.title(
    "Smart Microgreen AI - Growth Monitoring System"
)

root.geometry("1150x800")

root.configure(
    bg="#eef5ee"
)


# ---------------- HEADER ----------------

header = tk.Frame(
    root,
    bg="#173d2b",
    height=100
)

header.pack(
    fill="x"
)

title = tk.Label(
    header,
    text="SMART MICROGREEN AI",
    font=("Arial", 25, "bold"),
    bg="#173d2b",
    fg="white"
)

title.pack(
    pady=(20, 2)
)

subtitle = tk.Label(
    header,
    text="Image-Based Growth Monitoring & Analysis",
    font=("Arial", 12),
    bg="#173d2b",
    fg="#d7eadb"
)

subtitle.pack()


# ---------------- INPUT ----------------

input_frame = tk.Frame(root, bg="#eef5ee")
input_frame.pack(pady=20)

label = tk.Label(
    input_frame,
    text="Enter Box Number (1–22):",
    font=("Arial", 13, "bold"),
    bg="#eef5ee"
)
label.grid(row=0, column=0, padx=8, pady=8)

box_entry = tk.Entry(
    input_frame,
    font=("Arial", 14),
    width=7,
    justify="center"
)
box_entry.grid(row=0, column=1, padx=8, pady=8)

analyze_button = tk.Button(
    input_frame,
    text="ANALYSE BOX",
    font=("Arial", 11, "bold"),
    bg="#2e7d4f",
    fg="white",
    padx=15,
    pady=8,
    command=analyze_box
)
analyze_button.grid(row=0, column=2, padx=6, pady=8)

summary_button = tk.Button(
    input_frame,
    text="DATASET SUMMARY",
    font=("Arial", 11, "bold"),
    bg="#315d46",
    fg="white",
    padx=15,
    pady=8,
    command=show_summary
)
summary_button.grid(row=0, column=3, padx=6, pady=8)

webcam_button = tk.Button(
    input_frame,
    text="LIVE WEBCAM",
    font=("Arial", 11, "bold"),
    bg="#6b4f2a",
    fg="white",
    padx=15,
    pady=8,
    command=webcam_analysis
)
webcam_button.grid(row=0, column=4, padx=6, pady=8)

insights_button = tk.Button(
    input_frame,
    text="CULTIVATION INSIGHTS",
    font=("Arial", 11, "bold"),
    bg="#4b6f44",
    fg="white",
    padx=15,
    pady=8,
    command=cultivation_insights
)
insights_button.grid(row=1, column=2, padx=6, pady=8)

graph_button = tk.Button(
    input_frame,
    text="GROWTH TREND",
    font=("Arial", 11, "bold"),
    bg="#496b72",
    fg="white",
    padx=15,
    pady=8,
    command=growth_trend_graph
)
graph_button.grid(row=1, column=3, padx=6, pady=8)

comparison_button = tk.Button(
    input_frame,
    text="BOX COMPARISON",
    font=("Arial", 11, "bold"),
    bg="#66527a",
    fg="white",
    padx=15,
    pady=8,
    command=box_comparison_graph
)
comparison_button.grid(row=1, column=4, padx=6, pady=8)

summary_button.grid(
    row=0,
    column=3,
    padx=8
)

webcam_button = tk.Button(
    input_frame,
    text="LIVE WEBCAM",
    font=("Arial", 11, "bold"),
    bg="#6b4f2a",
    fg="white",
    padx=15,
    pady=8,
    command=webcam_analysis
)

webcam_button.grid(
    row=0,
    column=4,
    padx=8
)


# ---------------- OUTPUT ----------------

output_box = tk.Text(
    root,
    height=22,
    width=90,
    font=("Consolas", 12),
    bg="white",
    fg="#173d2b",
    relief="solid",
    borderwidth=1,
    padx=15,
    pady=15
)

output_box.pack(
    padx=35,
    pady=10
)


# ---------------- FOOTER ----------------

footer = tk.Label(
    root,
    text="CBSE Artificial Intelligence Project • Fenugreek Microgreens",
    font=("Arial", 9),
    bg="#eef5ee",
    fg="#555555"
)

footer.pack(
    pady=8
)


# Show summary initially
show_summary()


root.mainloop()