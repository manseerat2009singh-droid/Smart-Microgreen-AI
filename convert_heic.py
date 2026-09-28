from pathlib import Path
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path(__file__).parent
DOWNLOADS = Path.home() / "Downloads"
DATA = ROOT / "data"


def find_source(day):

    # Search every Day folder in Downloads
    for folder in DOWNLOADS.glob(f"Day {day}-*"):

        if not folder.is_dir():
            continue

        # Look inside for the actual "Day X" folder
        for subfolder in folder.rglob(f"Day {day}"):

            images = [
                f for f in subfolder.iterdir()
                if f.suffix.lower() in {".heic", ".jpg", ".jpeg", ".png"}
            ]

            if len(images) >= 110:
                return subfolder

    return None


def convert_day(day):

    source = find_source(day)

    if source is None:
        print(f"Day {day}: SOURCE NOT FOUND")
        return

    output = DATA / f"Day {day}"
    output.mkdir(parents=True, exist_ok=True)

    files = sorted(
        [
            f for f in source.iterdir()
            if f.suffix.lower() in {".heic", ".jpg", ".jpeg", ".png"}
        ],
        key=lambda f: f.name.lower()
    )

    # Keep exactly 110 images
    files = files[:110]

    print(f"Day {day}: {len(files)} images found")

    for i, file in enumerate(files):

        box = i // 5 + 1
        view = i % 5 + 1

        output_file = output / f"{box}.{view}.jpg"

        try:
            with Image.open(file) as img:
                img.convert("RGB").save(
                    output_file,
                    "JPEG",
                    quality=90
                )

        except Exception as e:
            print(f"Error: {file.name} -> {e}")

    print(f"Day {day}: DONE")


for day in range(1, 9):
    convert_day(day)

# Day 9 — exact known location
source = DOWNLOADS / "Day 9-20260922T202559Z-1-001" / "Day 9"
output = DATA / "Day 9"
output.mkdir(parents=True, exist_ok=True)

files = sorted(
    [
        f for f in source.iterdir()
        if f.suffix.lower() in {".heic", ".jpg", ".jpeg", ".png"}
    ],
    key=lambda f: f.name.lower()
)[:110]

print(f"Day 9: {len(files)} images found")

for i, file in enumerate(files):
    box = i // 5 + 1
    view = i % 5 + 1
    output_file = output / f"{box}.{view}.jpg"

    with Image.open(file) as img:
        img.convert("RGB").save(
            output_file,
            "JPEG",
            quality=90
        )

print("Day 9: DONE")
print("\nALL DAYS COMPLETE!")