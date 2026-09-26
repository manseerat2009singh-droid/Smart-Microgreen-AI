# Smart Microgreen Growth Analyzer

CBSE Class 12 AI project prototype for fenugreek microgreens.

## Current scope
The currently available data contains cultivation conditions for 22 experimental boxes and image observations for Days 1–3. Because final height/harvest-weight measurements are not currently available, this version does **not** claim to predict height or yield. Instead it analyzes visual growth using image-derived vegetation features and provides an exploratory ML estimate of a visual growth index. If height/weight data is found later, the target can be replaced without rebuilding the whole application.

## Image organization
For Days 2 and 3, the supplied image sequence contains 110 images: the first 88 are treated as 4 side views × 22 boxes, and the final 22 are treated as 1 top view × 22 boxes. Day 1 contains 111 images; the extra image is ignored by the automatic mapper. This assumption should be checked against the team's original naming/record before final submission.

## Run
1. Put folders `Day 1`, `Day 2`, ... inside `data/` if you want to process images locally.
2. Install: `pip install -r requirements.txt`
3. Run: `python generate_dataset.py`
4. Run the interface: `python app.py`

The app includes image analysis, cultivation-condition exploration, an optional webcam capture/analysis panel, and visual-growth prediction.
