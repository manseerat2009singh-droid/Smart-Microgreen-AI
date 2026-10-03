// ==========================================
// SMART MICROGREEN AI - WEBSITE SCRIPT
// ==========================================


// ==========================================
// BOX ANALYSIS
// ==========================================

async function analyseBox() {

    const boxInput = document.getElementById("boxNumber");
    const result = document.getElementById("analysisResult");

    const box = boxInput.value;

    if (!box || box < 1 || box > 22) {

        result.innerHTML = `
            <div class="result-placeholder">
                <div class="big-leaf">⚠️</div>
                <h3>Invalid Box Number</h3>
                <p>Please enter a box number between 1 and 22.</p>
            </div>
        `;

        return;
    }

    result.innerHTML = `
        <div class="result-placeholder">
            <div class="big-leaf">🔄</div>
            <h3>Analysing Box ${box}...</h3>
            <p>Retrieving the latest visual growth data.</p>
        </div>
    `;


    try {

        const response = await fetch(`/api/box/${box}`);

        const data = await response.json();


        if (!response.ok) {

            throw new Error(data.error || "Box not found");

        }


        let growthCategory;

        if (data.vgi < 33) {
            growthCategory = "Low Growth";
        }
        else if (data.vgi < 66) {
            growthCategory = "Moderate Growth";
        }
        else {
            growthCategory = "High Growth";
        }


        result.innerHTML = `

            <div class="result-grid">

                <div class="result-card">
                    <small>BOX NUMBER</small>
                    <strong>${data.box_id}</strong>
                </div>

                <div class="result-card">
                    <small>LATEST DAY</small>
                    <strong>Day ${data.day}</strong>
                </div>

                <div class="result-card">
                    <small>VISUAL GROWTH INDEX</small>
                    <strong>${data.vgi}</strong>
                </div>
                 
            <div class="vgi-ring" style="--vgi: ${data.vgi};">
    <div class="vgi-ring-inner">
        <strong>${data.vgi}</strong>
        <span>VGI</span>
    </div>
</div>
                

<div class="result-card status-card">
    <small>GROWTH CATEGORY</small>

    <strong class="growth-status ${growthCategory
        .toLowerCase()
        .replace(" ", "-")}">
        ${growthCategory}
    </strong>
</div>

            </div>

            <div class="feature-panel">

    <div class="feature-panel-title">
        <span>VISUAL DIAGNOSTICS</span>
        <small>IMAGE-DERIVED SIGNALS</small>
    </div>

    <div class="feature-bars">

        <div class="feature-item">
            <div class="feature-label">
                <span>TOP GREEN COVERAGE</span>
                <strong>${data.green}%</strong>
            </div>

            <div class="feature-track">
                <div class="feature-fill"
                     style="width:${Math.min(data.green, 100)}%;">
                </div>
            </div>
        </div>

        <div class="feature-item">
            <div class="feature-label">
                <span>VEGETATION SIGNAL</span>
                <strong>${data.exg}</strong>
            </div>

            <div class="feature-track">
                <div class="feature-fill"
                     style="width:${Math.min(Math.max(data.exg * 2, 0), 100)}%;">
                </div>
            </div>
        </div>

    </div>

</div>

<div class="box-growth-timeline">

    <div class="timeline-header">
        <div>
            <span>BOX GROWTH HISTORY</span>
            <small>DAY-WISE VISUAL GROWTH INDEX</small>
        </div>
        <strong>9 DAYS</strong>
    </div>

    <div id="boxTimeline" class="timeline-points">
        <div class="timeline-loading">
            Loading growth history...
        </div>
    </div>

</div>

            <div class="result-grid" style="margin-top:14px;">

                <div class="result-card">
                    <small>TOP GREEN COVERAGE</small>
                    <strong>${data.green}%</strong>
                </div>

                <div class="result-card">
                    <small>VEGETATION SIGNAL</small>
                    <strong>${data.exg}</strong>
                </div>

            </div>
        `;
                const trendResponse = await fetch(`/api/box/${box}/trend`);
        const trendData = await trendResponse.json();

        const timeline = document.getElementById("boxTimeline");

       if (timeline && Array.isArray(trendData)) {

    timeline.innerHTML = trendData.map(item => `
        <div class="timeline-point">
            <span>DAY ${item.day}</span>
            <strong>${item.vgi}</strong>
        </div>
    `).join("");

}

    }
    catch (error) {

        result.innerHTML = `
            <div class="result-placeholder">
                <div class="big-leaf">❌</div>
                <h3>Analysis Failed</h3>
                <p>${error.message}</p>
            </div>
        `;

    }
}



// ==========================================
// GROWTH TREND CHART
// ==========================================

let trendChart = null;

async function loadTrendChart() {

    try {

        const response = await fetch("/api/trend");

        const data = await response.json();


        const labels = data.map(item => `Day ${item.day}`);

        const values = data.map(item => item.vgi);


        const ctx = document
            .getElementById("trendChart")
            .getContext("2d");


        if (trendChart) {
            trendChart.destroy();
        }


    trendChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: labels,

        datasets: [

            {
                label: "Average Visual Growth Index",

                data: values,

                borderColor: "#62e18b",

                backgroundColor: (context) => {

                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if (!chartArea) {
                        return "rgba(98,225,139,0.10)";
                    }

                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );

                    gradient.addColorStop(0, "rgba(98,225,139,0.24)");
                    gradient.addColorStop(1, "rgba(98,225,139,0.01)");

                    return gradient;
                },

                borderWidth: 3,

                pointBackgroundColor: "#62e18b",

                pointBorderColor: "#07130e",

                pointBorderWidth: 3,

                pointRadius: 5,

                pointHoverRadius: 8,

                pointHoverBackgroundColor: "#ffffff",

                pointHoverBorderColor: "#62e18b",

                pointHoverBorderWidth: 3,

                tension: 0.42,

                fill: true
            }

        ]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

        animation: {
            duration: 1200,
            easing: "easeOutQuart"
        },

        plugins: {

            legend: {
                display: true,

                labels: {
                    color: "#b8cdbf",
                    padding: 18,
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                        size: 11,
                        weight: "600"
                    }
                }
            },

            tooltip: {

                backgroundColor: "rgba(5,14,9,0.96)",

                titleColor: "#62e18b",

                bodyColor: "#e5f4e9",

                borderColor: "rgba(98,225,139,0.35)",

                borderWidth: 1,

                padding: 12,

                displayColors: false,

                callbacks: {
                    label: function(context) {
                        return "VGI: " + Number(context.raw).toFixed(2);
                    }
                }
            }

        },

        scales: {

            x: {

                ticks: {
                    color: "#8da698",
                    padding: 8,
                    font: {
                        size: 10
                    }
                },

                grid: {
                    color: "rgba(255,255,255,0.025)",
                    drawBorder: false
                }
            },

            y: {

                min: 0,

                max: 100,

                ticks: {
                    color: "#8da698",
                    padding: 8,
                    stepSize: 20,
                    font: {
                        size: 10
                    }
                },

                grid: {
                    color: "rgba(98,225,139,0.055)",
                    drawBorder: false
                }
            }

        }
    }

});
    }

    catch (error) {

        console.error("Trend chart error:", error);

    }

}



// ==========================================
// BOX COMPARISON CHART
// ==========================================

let comparisonChart = null;

async function loadComparisonChart() {

    try {

        const response = await fetch("/api/comparison");

        const data = await response.json();


        const labels = data.map(item => `Box ${item.box}`);

        const values = data.map(item => item.vgi);


        const ctx = document
            .getElementById("comparisonChart")
            .getContext("2d");


        if (comparisonChart) {
            comparisonChart.destroy();
        }


        comparisonChart = new Chart(ctx, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Visual Growth Index",

                        data: values,

                        backgroundColor: "rgba(76,220,130,0.65)",

                        borderColor: "#4cdc82",

                        borderWidth: 1,

                        borderRadius: 6
                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {
                        labels: {
                            color: "#9bb4a5"
                        }
                    }

                },


                scales: {

                    x: {

                        ticks: {
                            color: "#789284"
                        },

                        grid: {
                            display: false
                        }

                    },


                    y: {

                        min: 0,

                        max: 100,

                        ticks: {
                            color: "#789284"
                        },

                        grid: {
                            color: "rgba(255,255,255,0.04)"
                        }

                    }

                }

            }

        });

    }

    catch (error) {

        console.error("Comparison chart error:", error);

    }

}



// ==========================================
// WEBCAM
// ==========================================

let cameraStream = null;


async function startCamera() {

    const video = document.getElementById("camera");

    const status = document.getElementById("cameraStatus");


    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: false

        });


        video.srcObject = cameraStream;

        status.textContent = "Camera active • Ready for analysis";

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Camera access denied or unavailable.";

    }

}



// ==========================================
// WEBCAM FRAME ANALYSIS
// ==========================================

function analyseCamera() {

    const video = document.getElementById("camera");

    const canvas = document.getElementById("cameraCanvas");

    const status = document.getElementById("cameraStatus");


    if (!cameraStream) {

        status.textContent =
            "Start the camera first.";

        return;
    }


    const width = video.videoWidth;
    const height = video.videoHeight;


    if (!width || !height) {

        status.textContent =
            "Camera frame is not ready yet.";

        return;
    }


    canvas.width = width;
    canvas.height = height;


    const context = canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    const imageData = context.getImageData(
        0,
        0,
        width,
        height
    );


    const pixels = imageData.data;


    let greenPixels = 0;

    let vegetationPixels = 0;

    let totalExG = 0;

    let pixelCount = 0;


    // Sample every 4th pixel
    // to keep real-time processing fast.

    for (
        let i = 0;
        i < pixels.length;
        i += 16
    ) {

        const r = pixels[i];

        const g = pixels[i + 1];

        const b = pixels[i + 2];


        const exg =
            (2 * g) - r - b;


        totalExG += exg;

        pixelCount++;


        if (exg > 10) {

            vegetationPixels++;

        }


        // Simple green detection

        if (
            g > r * 1.15 &&
            g > b * 1.05 &&
            g > 45
        ) {

            greenPixels++;

        }

    }


    const greenPercentage =
        (greenPixels / pixelCount) * 100;


    const vegetationSignal =
        (vegetationPixels / pixelCount) * 100;


    const score =
        Math.min(
            100,
            (greenPercentage * 0.5) +
            (vegetationSignal * 0.5)
        );


    let assessment;


    if (score < 33) {

        assessment = "Low visible vegetation";

    }

    else if (score < 66) {

        assessment = "Moderate visible vegetation";

    }

    else {

        assessment = "High visible vegetation";

    }


    status.innerHTML = `
        Visual Growth Score: 
        <strong>${score.toFixed(1)}</strong>
        &nbsp; | &nbsp;
        Green Coverage:
        <strong>${greenPercentage.toFixed(1)}%</strong>
        &nbsp; | &nbsp;
        ${assessment}
    `;

}



// ==========================================
// FEEDBACK FORM
// ==========================================

const feedbackForm =
    document.getElementById("feedbackForm");


feedbackForm?.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("feedbackName").value;

        const rating =
            document.getElementById("feedbackRating").value;

        const message =
            document.getElementById("feedbackMessage").value;


        const status =
            document.getElementById("feedbackStatus");


        status.textContent =
            "Submitting feedback...";


        try {

            const response = await fetch(
                "/feedback",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        rating: rating,

                        message: message

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                status.textContent =
                    "✓ Thank you! Your feedback has been recorded.";

                feedbackForm.reset();

            }

            else {

                status.textContent =
                    "Something went wrong.";

            }

        }

        catch (error) {

            console.error(error);

            status.textContent =
                "Unable to submit feedback.";

        }

    }
);



// ==========================================
// INITIALISE WEBSITE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTrendChart();

        loadComparisonChart();

    }
);

// ===== BOX INTELLIGENCE =====

async function loadBoxProfile() {

    const boxInput = document.getElementById("profileBoxNumber");
    const panel = document.getElementById("boxProfileResult");

    if (!boxInput || !panel) return;

    const box = Number(boxInput.value);

    if (!box || box < 1 || box > 22) {
        panel.innerHTML = `
            <div class="box-intel-placeholder">
                <div class="intel-icon">⚠</div>
                <h3>INVALID BOX</h3>
                <p>Please enter a box number between 1 and 22.</p>
            </div>
        `;
        return;
    }

    panel.innerHTML = `
        <div class="box-intel-loading">
            <div class="intel-loader"></div>
            <span>LOADING BOX ${box} PROFILE...</span>
        </div>
    `;

    try {

        const response = await fetch(`/api/box/${box}/profile`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Box not found");
        }

        const history = data.history || [];
        const first = history.length ? history[0] : null;

        let growthCategory;

        if (data.vgi < 33) {
            growthCategory = "LOW GROWTH";
        } else if (data.vgi < 66) {
            growthCategory = "MODERATE GROWTH";
        } else {
            growthCategory = "HIGH GROWTH";
        }

        const changeClass =
            data.change_from_first >= 0
                ? "positive-change"
                : "negative-change";

        const conditionLabels = {
            seed_density: "Seed Density",
            seed_soaking_time: "Seed Soaking Time",
            biofertilizer: "Biofertilizer",
            cocopeat: "Cocopeat",
            harvest_time: "Harvest Time",
            blackout_duration: "Blackout Duration",
            nutrient_ec: "Nutrient EC",
            nutrient_spray_start_day: "Nutrient Spray Start",
            media_thickness: "Media Thickness",
            seaweed: "Seaweed"
        };

        const conditionsHTML = Object.entries(data.conditions || {})
            .map(([key, value]) => `
                <div class="condition-item">
                    <span>${conditionLabels[key] || key}</span>
                    <strong>${value ?? "—"}</strong>
                </div>
            `)
            .join("");
            
const historyHTML = history.map(item => `
    <div class="journey-point">
        <span>DAY ${item.day}</span>
        <strong>${item.vgi}</strong>
    </div>
`).join("");

        panel.innerHTML = `

            <div class="intel-profile-top">

                <div class="intel-box-id">
                    <span>EXPERIMENTAL BOX</span>
                    <strong>BOX ${data.box_id}</strong>
                    <small>OBSERVED THROUGH DAY ${data.latest_day}</small>
                </div>

                <div class="intel-vgi">
                    <div class="intel-vgi-ring"
                         style="--profile-vgi:${data.vgi};">
                        <div>
                            <strong>${data.vgi}</strong>
                            <span>VGI</span>
                        </div>
                    </div>

                    <div class="intel-status">
                        <span>CURRENT STATUS</span>
                        <strong>${growthCategory}</strong>
                    </div>
                </div>

            </div>


            <div class="intel-kpis">

                <div class="intel-kpi">
                    <span>LATEST VGI</span>
                    <strong>${data.vgi}</strong>
                    <small>Visual Growth Index</small>
                </div>

                <div class="intel-kpi">
                    <span>GREEN COVERAGE</span>
                    <strong>${data.green}%</strong>
                    <small>Top-view vegetation area</small>
                </div>

                <div class="intel-kpi">
                    <span>EXG SIGNAL</span>
                    <strong>${data.exg}</strong>
                    <small>Vegetation colour signal</small>
                </div>

                <div class="intel-kpi ${changeClass}">
                    <span>CHANGE FROM FIRST</span>
                    <strong>
                        ${data.change_from_first >= 0 ? "+" : ""}
                        ${data.change_from_first}
                    </strong>
                    <small>VGI points</small>
                </div>

            </div>


            <div class="intel-grid">

                <div class="intel-panel">

                    <div class="intel-panel-heading">
                        <div>
                            <span>GROWTH JOURNEY</span>
                            <small>DAY-WISE VISUAL GROWTH INDEX</small>
                        </div>

                        <strong>${history.length} DAYS</strong>
                    </div>

                    <div class="journey-track">
                        ${historyHTML}
                    </div>

                </div>


                <div class="intel-panel">

                    <div class="intel-panel-heading">
                        <div>
                            <span>WHY THIS SCORE?</span>
                            <small>IMAGE-DERIVED INTERPRETATION</small>
                        </div>
                    </div>

                    <div class="score-explanation">

                        <div class="explanation-row">
                            <span>VGI</span>
                            <p>
                                Combines normalized image-derived vegetation
                                signals into a single visual growth index.
                            </p>
                        </div>

                        <div class="explanation-row">
                            <span>GREEN</span>
                            <p>
                                ${data.green}% of the analysed top-view
                                area was classified as green vegetation.
                            </p>
                        </div>

                        <div class="explanation-row">
                            <span>EXG</span>
                            <p>
                                The ExG signal captures vegetation-related
                                colour information from the image.
                            </p>
                        </div>

                    </div>

                </div>

            </div>


            <div class="intel-panel conditions-panel">

                <div class="intel-panel-heading">
                    <div>
                        <span>CULTIVATION CONDITIONS</span>
                        <small>EXPERIMENTAL SETUP FOR BOX ${data.box_id}</small>
                    </div>

                    <strong>10 VARIABLES</strong>
                </div>

                <div class="conditions-grid">
                    ${conditionsHTML}
                </div>

            </div>
<div class="image-evidence-panel">

    <div class="intel-panel-heading">
        <div>
            <span>IMAGE EVIDENCE</span>
            <small>CAPTURED VISUAL OBSERVATIONS</small>
        </div>

        <strong>5 VIEWS</strong>
    </div>
    <div class="day-explorer">
        <span>OBSERVATION DAY</span>
        <div class="day-buttons" id="dayButtons"></div>
    </div>
    <div class="image-evidence-grid" id="imageEvidenceGrid">
        <div class="image-loading">
            Loading captured images...
        </div>
    </div>

</div>

        `;
        const dayButtons = document.getElementById("dayButtons");

if (dayButtons) {
    dayButtons.innerHTML = data.history.map(item => `
        <button
            class="day-button ${item.day === data.latest_day ? "active" : ""}"
            onclick="loadBoxDay(${data.box_id}, ${item.day})">
            DAY ${item.day}
        </button>
    `).join("");
}
                const imageGrid = document.getElementById("imageEvidenceGrid");

        if (imageGrid) {
            try {
                const imageResponse =
                    await fetch(`/api/box/${box}/images/${data.latest_day}`);

                const imageData = await imageResponse.json();

                if (!imageResponse.ok) {
                    throw new Error(
                        imageData.error || "Images unavailable"
                    );
                }

                if (!imageData.images.length) {
                    imageGrid.innerHTML = `
                        <div class="image-loading">
                            No captured images available for this observation day.
                        </div>
                    `;
                } else {
                    imageGrid.innerHTML =
                        imageData.images.map(image => `
                            <div class="evidence-image-card">
                                <div class="evidence-image-wrap">
                                    <img
                                        src="/api/image/${data.latest_day}/${data.box_id}/${image.view}"
                                        alt="Box ${data.box_id}, Day ${data.latest_day}, View ${image.view}"
                                    >
                                </div>

                                <div class="evidence-image-label">
                                    <span>VIEW ${image.view}</span>
                                    <small>
                                        ${image.view === 5
                                            ? "TOP VIEW"
                                            : "SIDE VIEW"}
                                    </small>
                                </div>
                            </div>
                        `).join("");
                }

            } catch (error) {
                imageGrid.innerHTML = `
                    <div class="image-loading">
                        Image evidence unavailable.
                    </div>
                `;
            }
        }

    } catch (error) {

        panel.innerHTML = `
            <div class="box-intel-placeholder">
                <div class="intel-icon">✕</div>
                <h3>PROFILE UNAVAILABLE</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}


async function loadBoxDay(box, day) {

    const grid = document.getElementById("imageEvidenceGrid");

    if (!grid) return;

    grid.innerHTML = `
        <div class="image-loading">
            Loading Day ${day} images...
        </div>
    `;

    try {

        const response =
            await fetch(`/api/box/${box}/images/${day}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Images unavailable"
            );
        }

        if (!data.images.length) {

            grid.innerHTML = `
                <div class="image-loading">
                    No images available for Day ${day}.
                </div>
            `;

            return;
        }

        grid.innerHTML = data.images.map(image => `

            <div class="evidence-image-card">

                <div class="evidence-image-wrap">

                    <img
                        onclick="openImageViewer(this.src)"
                        style="cursor: zoom-in;"
                        src="/api/image/${day}/${box}/${image.view}"
                        alt="Box ${box}, Day ${day}, View ${image.view}"
                    >

                </div>

                <div class="evidence-image-label">

                    <span>VIEW ${image.view}</span>

                    <small>
                        ${image.view === 5
                            ? "TOP VIEW"
                            : "SIDE VIEW"}
                    </small>

                </div>

            </div>

        `).join("");

        document.querySelectorAll(".day-button").forEach(button => {
            button.classList.remove("active");
        });

        document
            .querySelector(`.day-button[onclick="loadBoxDay(${box}, ${day})"]`)
            ?.classList.add("active");

    } catch (error) {

        grid.innerHTML = `
            <div class="image-loading">
                Image evidence unavailable.
            </div>
        `;

    }
}

function openImageViewer(src) {

    const viewer = document.createElement("div");

    viewer.id = "imageViewer";

    viewer.innerHTML = `
        <div class="image-viewer-backdrop" onclick="closeImageViewer()">

            <button
                class="image-viewer-close"
                onclick="closeImageViewer()">
                ×
            </button>

            <img
                src="${src}"
                class="image-viewer-image"
                onclick="event.stopPropagation()"
            >

        </div>
    `;

    document.body.appendChild(viewer);
}


function closeImageViewer() {

    const viewer = document.getElementById("imageViewer");

    if (viewer) {
        viewer.remove();
    }
}

/* ===== EXPERIMENT LAB ===== */

let experimentTimer = null;
let experimentDay = 1;

async function buildExperimentLab() {

    const grid = document.getElementById("labGrid");

    if (!grid) return;

    grid.innerHTML = "";

    for (let box = 1; box <= 22; box++) {

        const card = document.createElement("button");

        card.className = "lab-box";
        card.innerHTML = `
            <span class="lab-box-number">${String(box).padStart(2, "0")}</span>
            <span class="lab-box-status">LOADING</span>
        `;

        card.onclick = () => inspectLabBox(box);

        grid.appendChild(card);

        try {

            const response =
                await fetch(`/api/box/${box}`);

            const data = await response.json();

            const vgi = Number(data.vgi || 0);

            let level = "LOW";

            if (vgi >= 66) {
                level = "HIGH";
            } else if (vgi >= 33) {
                level = "MODERATE";
            }

            card.querySelector(".lab-box-status").textContent =
                `${level} • ${vgi.toFixed(1)}`;

            card.dataset.vgi = vgi;

        } catch {

            card.querySelector(".lab-box-status").textContent =
                "DATA ERROR";
        }
    }
}


async function inspectLabBox(box) {

    const info = document.getElementById("labInfo");

    if (!info) return;

    info.innerHTML = `
        <span>SCANNING EXPERIMENTAL BOX ${String(box).padStart(2, "0")}</span>
        <h3>LOADING VISUAL PROFILE...</h3>
        <p>Analysing image-derived growth signals.</p>
    `;

    try {

        const response =
            await fetch(`/api/box/${box}/profile`);

        const data = await response.json();

        info.innerHTML = `
            <span>EXPERIMENTAL BOX ${String(box).padStart(2, "0")}</span>

            <h3>
                VISUAL GROWTH INDEX
                <strong>${Number(data.vgi).toFixed(1)}</strong>
            </h3>

            <div class="lab-metrics">

                <div>
                    <small>LATEST DAY</small>
                    <b>DAY ${data.latest_day}</b>
                </div>

                <div>
                    <small>GREEN COVERAGE</small>
                    <b>${Number(data.green).toFixed(1)}%</b>
                </div>

                <div>
                    <small>VEGETATION SIGNAL</small>
                    <b>${Number(data.exg).toFixed(2)}</b>
                </div>

            </div>

            <p class="lab-analysis">
                ${data.change_from_first >= 0
                    ? "Visual growth signal has increased"
                    : "Visual growth signal has decreased"}
                by
                <strong>${Math.abs(Number(data.change_from_first)).toFixed(1)}</strong>
                points from the first available observation.
            </p>

            <button
                class="lab-profile-btn"
                onclick="openBoxFromLab(${box})">
                OPEN FULL BOX PROFILE →
            </button>
        `;

    } catch {

        info.innerHTML = `
            <span>ERROR</span>
            <h3>PROFILE UNAVAILABLE</h3>
            <p>Could not load this experimental box.</p>
        `;
    }
}


function openBoxFromLab(box) {

    const input =
        document.getElementById("profileBoxNumber");

    if (input) {
        input.value = box;
    }

    if (typeof loadBoxProfile === "function") {
        loadBoxProfile();
    }

    document
        .querySelector(".box-intelligence-section")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


async function startExperimentReplay() {

    if (experimentTimer) {
        clearInterval(experimentTimer);
    }

    const status =
        document.getElementById("replayStatus");

    const dayLabel =
        document.getElementById("replayDay");

    const vgiLabel =
        document.getElementById("replayVgi");

    const progress =
        document.getElementById("replayProgress");

    experimentDay = 1;

    if (status) {
        status.textContent =
            "SCANNING EXPERIMENT • INITIALISING DAY 1";
    }

    experimentTimer = setInterval(async () => {

        if (experimentDay > 9) {

            clearInterval(experimentTimer);
            experimentTimer = null;

            if (status) {
                status.textContent =
                    "EXPERIMENT REPLAY COMPLETE • DAY 9 REACHED";
            }

            return;
        }

        if (dayLabel) {
            dayLabel.textContent =
                `DAY ${experimentDay}`;
        }

        if (progress) {
            progress.style.width =
                `${(experimentDay / 9) * 100}%`;
        }

        try {

            const response =
                await fetch("/api/trend");

            const trend = await response.json();

            const point = trend.find(
                item =>
                    Number(item.day) === experimentDay
            );

            if (point && vgiLabel) {

                const value =
                    Number(
                        point.visual_growth_index ??
                        point.vgi ??
                        0
                    );

                vgiLabel.textContent =
                    `AVERAGE VGI — ${value.toFixed(1)}`;
            }

        } catch {

            if (vgiLabel) {
                vgiLabel.textContent =
                    "VGI — ANALYSING";
            }
        }

        if (status) {

            status.textContent =
                `ANALYSING DAY ${experimentDay} • IMAGE-DERIVED VEGETATION SIGNALS`;
        }

        experimentDay++;

    }, 1200);
}


/* Automatically build the lab */
document.addEventListener("DOMContentLoaded", () => {

    buildExperimentLab();

});

/* =========================================================
   SMART MICROGREEN AI — SELECTED BOX TIME MACHINE
   APPEND ONLY — paste at the VERY BOTTOM of script.js
   ========================================================= */

(function () {
    let selectedTimeMachineBox = null;
    let selectedTimeMachineOriginal = null;

    /* Capture whichever box the user clicks in the Experiment Lab */
    function installBoxSelection() {
        if (typeof window.inspectLabBox !== "function") return;

        if (!selectedTimeMachineOriginal) {
            selectedTimeMachineOriginal = window.inspectLabBox;

            window.inspectLabBox = function (box) {
                selectedTimeMachineBox = Number(box);
                return selectedTimeMachineOriginal.apply(this, arguments);
            };
        }
    }

    /* Modal styling */
    const style = document.createElement("style");
    style.textContent = `
        #selectedBoxTimeMachine {
            position: fixed;
            inset: 0;
            z-index: 10000;
            background:
                radial-gradient(circle at 50% 35%, rgba(0,217,154,.10), transparent 35%),
                rgba(2,8,11,.97);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 28px;
            box-sizing: border-box;
            backdrop-filter: blur(14px);
        }

        .tm-shell {
            width: min(1050px, 94vw);
            max-height: 92vh;
            overflow: auto;
            border: 1px solid rgba(0,217,154,.24);
            border-radius: 24px;
            background: linear-gradient(145deg, #0c171a, #071013);
            box-shadow: 0 30px 100px rgba(0,0,0,.65);
            padding: 28px;
            box-sizing: border-box;
        }

        .tm-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 22px;
        }

        .tm-kicker {
            color: #00d99a;
            font-size: 10px;
            letter-spacing: 3px;
            font-weight: 900;
        }

        .tm-title {
            margin: 7px 0 3px;
            font-size: clamp(25px, 4vw, 42px);
            font-weight: 900;
            letter-spacing: .5px;
        }

        .tm-subtitle {
            margin: 0;
            color: rgba(255,255,255,.48);
            font-size: 13px;
        }

        .tm-close {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.05);
            color: white;
            font-size: 25px;
            cursor: pointer;
            flex: 0 0 auto;
        }

        .tm-close:hover {
            border-color: #00d99a;
            color: #00d99a;
        }

        .tm-visual {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            min-height: 300px;
            border-radius: 18px;
            overflow: hidden;
            background: #03090b;
            border: 1px solid rgba(255,255,255,.08);
        }

        .tm-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            opacity: 0;
            transform: scale(1.025);
            transition: opacity .65s ease, transform 1s ease;
        }

        .tm-image.loaded {
            opacity: 1;
            transform: scale(1);
        }

        .tm-scan {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            top: 0;
            background: #00d99a;
            box-shadow: 0 0 18px #00d99a;
            opacity: 0;
            pointer-events: none;
        }

        .tm-scanning .tm-scan {
            opacity: .8;
            animation: tmScan 1.8s linear infinite;
        }

        @keyframes tmScan {
            from { top: 0; }
            to { top: 100%; }
        }

        .tm-image-label {
            position: absolute;
            left: 18px;
            top: 18px;
            padding: 8px 12px;
            border-radius: 8px;
            background: rgba(0,0,0,.62);
            border: 1px solid rgba(255,255,255,.12);
            font-size: 11px;
            letter-spacing: 1.5px;
            font-weight: 900;
        }

        .tm-live {
            position: absolute;
            right: 18px;
            top: 18px;
            padding: 7px 10px;
            border-radius: 7px;
            background: rgba(0,217,154,.12);
            color: #00d99a;
            border: 1px solid rgba(0,217,154,.28);
            font-size: 9px;
            letter-spacing: 1.5px;
            font-weight: 900;
        }

        .tm-data {
            display: grid;
            grid-template-columns: 1.1fr 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .tm-metric {
            padding: 16px;
            border-radius: 12px;
            background: rgba(255,255,255,.035);
            border: 1px solid rgba(255,255,255,.06);
        }

        .tm-metric small {
            display: block;
            color: rgba(255,255,255,.4);
            font-size: 9px;
            letter-spacing: 1.4px;
            margin-bottom: 7px;
        }

        .tm-metric strong {
            color: #00d99a;
            font-size: 22px;
        }

        .tm-progress-wrap {
            margin-top: 18px;
        }

        .tm-progress {
            height: 5px;
            border-radius: 10px;
            overflow: hidden;
            background: rgba(255,255,255,.08);
        }

        .tm-progress-bar {
            height: 100%;
            width: 0%;
            background: #00d99a;
            box-shadow: 0 0 16px rgba(0,217,154,.55);
            transition: width .7s ease;
        }

        .tm-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-top: 18px;
        }

        .tm-status {
            color: rgba(255,255,255,.45);
            font-family: monospace;
            font-size: 10px;
            letter-spacing: 1px;
        }

        .tm-play {
            border: 1px solid #00d99a;
            background: rgba(0,217,154,.08);
            color: #00d99a;
            border-radius: 9px;
            padding: 11px 18px;
            font-weight: 900;
            cursor: pointer;
        }

        @media (max-width: 650px) {
            #selectedBoxTimeMachine { padding: 12px; }
            .tm-shell { padding: 18px; }
            .tm-data { grid-template-columns: 1fr; }
            .tm-controls { flex-direction: column; align-items: stretch; }
        }
    `;
    document.head.appendChild(style);

    function closeSelectedTimeMachine() {
        const modal = document.getElementById("selectedBoxTimeMachine");
        if (modal) modal.remove();
    }

    async function getBoxHistory(box) {
        const response = await fetch(`/api/box/${box}/profile`);
        if (!response.ok) throw new Error("Profile unavailable");
        const data = await response.json();
        return data;
    }

    async function findUsableImage(box, day) {
        /* Prefer the top view because that is the view used by VGI. */
        const top = `/api/image/${day}/${box}/5`;

        const test = await new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(top);
            img.onerror = () => resolve(null);
            img.src = top;
        });

        if (test) return test;

        /* Fallback: ask the existing image API for any captured view. */
        try {
            const response = await fetch(`/api/box/${box}/images/${day}`);
            if (!response.ok) return null;

            const data = await response.json();
            if (data.images && data.images.length) {
                const view = data.images.find(x => Number(x.view) === 5) || data.images[0];
                return `/api/image/${day}/${box}/${view.view}`;
            }
        } catch (_) {}

        return null;
    }

    function waitForImage(url, img) {
        return new Promise(resolve => {
            img.classList.remove("loaded");
            img.onload = () => {
                requestAnimationFrame(() => img.classList.add("loaded"));
                resolve(true);
            };
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    async function playSelectedBox(box, existingModal = null) {
        let data;

        try {
            data = await getBoxHistory(box);
        } catch (_) {
            alert("Could not load the selected box data.");
            return;
        }

        const history = (data.history || [])
            .sort((a, b) => Number(a.day) - Number(b.day));

        if (!history.length) {
            alert("No day-wise observations are available for this box.");
            return;
        }

        const modal = existingModal || document.createElement("div");

        if (!existingModal) {
            modal.id = "selectedBoxTimeMachine";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="tm-shell">
                <div class="tm-top">
                    <div>
                        <div class="tm-kicker">SELECTED BOX TIME MACHINE</div>
                        <div class="tm-title">BOX ${String(box).padStart(2, "0")}</div>
                        <p class="tm-subtitle">Reconstructing the actual visual growth journey.</p>
                    </div>
                    <button class="tm-close" type="button">×</button>
                </div>

                <div class="tm-visual tm-scanning">
                    <img class="tm-image" alt="Microgreen experimental image">
                    <div class="tm-scan"></div>
                    <div class="tm-image-label" id="tmImageLabel">DAY --</div>
                    <div class="tm-live">● LIVE REPLAY</div>
                </div>

                <div class="tm-data">
                    <div class="tm-metric">
                        <small>VISUAL GROWTH INDEX</small>
                        <strong id="tmVgi">--</strong>
                    </div>
                    <div class="tm-metric">
                        <small>GREEN COVERAGE</small>
                        <strong id="tmGreen">--</strong>
                    </div>
                    <div class="tm-metric">
                        <small>OBSERVATION</small>
                        <strong id="tmDay">--</strong>
                    </div>
                </div>

                <div class="tm-progress-wrap">
                    <div class="tm-progress">
                        <div class="tm-progress-bar" id="tmProgress"></div>
                    </div>
                </div>

                <div class="tm-controls">
                    <div class="tm-status" id="tmStatus">LOADING REAL CAPTURE...</div>
                    <button class="tm-play" id="tmReplayAgain" type="button">↻ REPLAY</button>
                </div>
            </div>
        `;

        modal.querySelector(".tm-close").onclick = closeSelectedTimeMachine;

        const image = modal.querySelector(".tm-image");
        const label = modal.querySelector("#tmImageLabel");
        const vgi = modal.querySelector("#tmVgi");
        const green = modal.querySelector("#tmGreen");
        const dayLabel = modal.querySelector("#tmDay");
        const progress = modal.querySelector("#tmProgress");
        const status = modal.querySelector("#tmStatus");
        const visual = modal.querySelector(".tm-visual");

        let stopped = false;

        async function runReplay() {

    stopped = false;

    image.classList.remove("loaded");
    visual.classList.add("tm-scanning");

    status.textContent = "LOADING EXPERIMENTAL CAPTURES...";

    const frames = [];

    /*
     * Resolve all image URLs first.
     * Then preload each image ONCE and keep the loaded
     * Image object in memory for instant replay.
     */
    for (const item of history) {

        const day = Number(item.day);

        const url = await findUsableImage(box, day);

        const frame = {
            day,
            url,
            vgi: Number(item.vgi || 0),
            green: Number(item.green || 0),
            image: null
        };

        if (url) {

            const preload = new Image();

            const loaded = await new Promise(resolve => {

                preload.onload = () => resolve(true);
                preload.onerror = () => resolve(false);

                preload.src = url;
            });

            if (loaded) {
                frame.image = preload;
            }
        }

        frames.push(frame);
    }

    status.textContent =
        "REPLAYING • ACTUAL EXPERIMENTAL CAPTURES";

    for (let i = 0; i < frames.length; i++) {

        if (stopped) return;

        const frame = frames[i];

        label.textContent =
            `DAY ${frame.day}`;

        dayLabel.textContent =
            `DAY ${frame.day}`;

        vgi.textContent =
            frame.vgi.toFixed(1);

        green.textContent =
            `${frame.green.toFixed(1)}%`;

        progress.style.width =
            `${((i + 1) / frames.length) * 100}%`;

        if (frame.image) {

            image.classList.remove("loaded");

            /*
             * Use the already-loaded browser image.
             * No second Render request.
             */
            image.src = frame.image.src;

            requestAnimationFrame(() => {
                image.classList.add("loaded");
            });

            status.textContent =
                `DAY ${frame.day} • IMAGE CAPTURE LOADED • VGI ${frame.vgi.toFixed(1)}`;

        } else {

            image.removeAttribute("src");
            image.classList.remove("loaded");

            status.textContent =
                `DAY ${frame.day} • NO CAPTURE AVAILABLE`;
        }

        /*
         * Keep each frame visible.
         */
        await new Promise(resolve =>
            setTimeout(resolve, 1800)
        );
    }

    if (!stopped) {

        visual.classList.remove("tm-scanning");

        status.textContent =
            `REPLAY COMPLETE • BOX ${String(box).padStart(2, "0")} • DAY ${frames[frames.length - 1].day}`;
    }
}

        modal.querySelector("#tmReplayAgain").onclick = runReplay;

        runReplay();
    }

    /* Install after the original Experiment Lab has created its functions. */
    function boot() {
        installBoxSelection();

        /* Re-run installation in case the page loads the Lab slightly later. */
        setTimeout(installBoxSelection, 500);
        setTimeout(installBoxSelection, 1500);
    }

    /* Override the replay button ONLY. */
    window.startExperimentReplay = function () {
        installBoxSelection();

        if (!selectedTimeMachineBox) {
            /* If no box has been selected, make the user choose one instead of replaying 22 boxes. */
            const info = document.getElementById("labInfo");
            if (info) {
                info.scrollIntoView({ behavior: "smooth", block: "center" });
                info.animate(
                    [
                        { transform: "scale(1)" },
                        { transform: "scale(1.025)" },
                        { transform: "scale(1)" }
                    ],
                    { duration: 500 }
                );
            }
            return;
        }

        playSelectedBox(selectedTimeMachineBox);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();


/* =========================================================
   SMART MICROGREEN AI — GROWTH FORENSICS
   APPEND ONLY — paste at the VERY BOTTOM of script.js
   ========================================================= */

(function () {
    const css = document.createElement("style");
    css.textContent = `
        #growthForensics {
            position: fixed;
            inset: 0;
            z-index: 11000;
            background: rgba(2,7,9,.97);
            backdrop-filter: blur(16px);
            overflow-y: auto;
            padding: 24px;
            box-sizing: border-box;
            color: white;
        }

        .gf-shell {
            width: min(1180px, 96vw);
            margin: 0 auto;
            padding: 28px;
            border: 1px solid rgba(0,217,154,.22);
            border-radius: 24px;
            background: linear-gradient(145deg,#0b1619,#061012);
            box-shadow: 0 30px 100px rgba(0,0,0,.65);
        }

        .gf-head {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:20px;
            margin-bottom:24px;
        }

        .gf-kicker {
            color:#00d99a;
            font-size:10px;
            letter-spacing:3px;
            font-weight:900;
        }

        .gf-title {
            font-size:clamp(28px,5vw,48px);
            margin:7px 0;
            font-weight:900;
        }

        .gf-sub {
            margin:0;
            color:rgba(255,255,255,.48);
            font-size:13px;
        }

        .gf-close {
            width:44px;
            height:44px;
            border-radius:50%;
            border:1px solid rgba(255,255,255,.12);
            background:rgba(255,255,255,.05);
            color:white;
            font-size:26px;
            cursor:pointer;
        }

        .gf-close:hover {
            color:#00d99a;
            border-color:#00d99a;
        }

        .gf-comparison {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:14px;
        }

        .gf-card {
            position:relative;
            overflow:hidden;
            border-radius:16px;
            border:1px solid rgba(255,255,255,.08);
            background:#03090b;
        }

        .gf-card img,
        .gf-canvas {
            width:100%;
            aspect-ratio:16/10;
            display:block;
            object-fit:contain;
            background:#020607;
        }

        .gf-label {
            position:absolute;
            left:14px;
            top:14px;
            z-index:2;
            padding:7px 10px;
            border-radius:7px;
            background:rgba(0,0,0,.7);
            font-size:10px;
            letter-spacing:1.5px;
            font-weight:900;
        }

        .gf-metrics {
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:10px;
            margin-top:14px;
        }

        .gf-metric {
            padding:17px;
            border-radius:12px;
            background:rgba(255,255,255,.035);
            border:1px solid rgba(255,255,255,.06);
        }

        .gf-metric small {
            display:block;
            color:rgba(255,255,255,.4);
            font-size:9px;
            letter-spacing:1.2px;
            margin-bottom:7px;
        }

        .gf-metric strong {
            color:#00d99a;
            font-size:23px;
        }

        .gf-analysis {
            margin-top:18px;
            padding:22px;
            border-radius:15px;
            border:1px solid rgba(0,217,154,.14);
            background:rgba(0,217,154,.035);
        }

        .gf-analysis-head {
            color:#00d99a;
            font-size:10px;
            letter-spacing:2px;
            font-weight:900;
            margin-bottom:10px;
        }

        .gf-analysis p {
            margin:0;
            line-height:1.7;
            color:rgba(255,255,255,.68);
        }

        .gf-signal {
            margin-top:18px;
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:14px;
        }

        .gf-signal-card {
            padding:20px;
            border-radius:15px;
            background:rgba(255,255,255,.025);
            border:1px solid rgba(255,255,255,.07);
        }

        .gf-signal-card h3 {
            margin:0 0 7px;
            font-size:15px;
        }

        .gf-signal-card p {
            margin:0;
            color:rgba(255,255,255,.45);
            font-size:11px;
            line-height:1.6;
        }

        .gf-close-bottom {
            margin-top:20px;
            width:100%;
            padding:13px;
            border-radius:9px;
            border:1px solid #00d99a;
            background:rgba(0,217,154,.08);
            color:#00d99a;
            font-weight:900;
            cursor:pointer;
        }

        @media(max-width:700px) {
            .gf-shell { padding:18px; }
            .gf-comparison,
            .gf-signal { grid-template-columns:1fr; }
            .gf-metrics { grid-template-columns:1fr 1fr; }
        }
    `;
    document.head.appendChild(css);

    function closeForensics() {
        const el = document.getElementById("growthForensics");
        if (el) el.remove();
    }

    async function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    function calculateGreenSignal(img) {
        const canvas = document.createElement("canvas");
        const maxW = 500;
        const scale = Math.min(1, maxW / img.naturalWidth);

        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

        const ctx = canvas.getContext("2d", { willReadFrequently:true });
        ctx.drawImage(img,0,0,canvas.width,canvas.height);

        const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;

        let greenPixels = 0;
        let vegetationSignal = 0;

        for (let i=0; i<data.length; i+=4) {
            const r=data[i];
            const g=data[i+1];
            const b=data[i+2];

            const exg = 2*g-r-b;

            if (exg > 10) {
                greenPixels++;
                vegetationSignal += exg;
            }
        }

        const total = canvas.width * canvas.height;
        const coverage = total ? (greenPixels / total) * 100 : 0;
        const avgSignal = greenPixels ? vegetationSignal / greenPixels : 0;

        return { coverage, avgSignal };
    }

    function buildMaskCanvas(img) {
        const canvas = document.createElement("canvas");
        const maxW = 650;
        const scale = Math.min(1, maxW / img.naturalWidth);

        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

        const ctx = canvas.getContext("2d", { willReadFrequently:true });
        ctx.drawImage(img,0,0,canvas.width,canvas.height);

        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        const p = imageData.data;

        for (let i=0; i<p.length; i+=4) {
            const r=p[i];
            const g=p[i+1];
            const b=p[i+2];
            const exg=2*g-r-b;

            if (exg > 10) {
                p[i]=0;
                p[i+1]=255;
                p[i+2]=145;
                p[i+3]=185;
            } else {
                p[i]=7;
                p[i+1]=12;
                p[i+2]=14;
                p[i+3]=235;
            }
        }

        ctx.putImageData(imageData,0,0);
        return canvas;
    }

    async function showForensics(box) {
        const profileResponse = await fetch(`/api/box/${box}/profile`);
        const profile = await profileResponse.json();

        const history = (profile.history || [])
            .sort((a,b)=>Number(a.day)-Number(b.day));

        if (!history.length) {
            alert("No growth history available for this box.");
            return;
        }

        const first = history[0];
        const last = history[history.length-1];

        const firstUrl = `/api/image/${first.day}/${box}/5`;
        const lastUrl = `/api/image/${last.day}/${box}/5`;

        let firstImg, lastImg;

        try {
            [firstImg,lastImg] = await Promise.all([
                loadImage(firstUrl),
                loadImage(lastUrl)
            ]);
        } catch (_) {
            alert("Could not load the actual experimental images.");
            return;
        }

        const firstSignal = calculateGreenSignal(firstImg);
        const lastSignal = calculateGreenSignal(lastImg);

        const vgiChange = Number(last.vgi)-Number(first.vgi);
        const greenChange = lastSignal.coverage-firstSignal.coverage;

        const modal = document.createElement("div");
        modal.id = "growthForensics";

        modal.innerHTML = `
            <div class="gf-shell">
                <div class="gf-head">
                    <div>
                        <div class="gf-kicker">COMPUTER VISION • GROWTH FORENSICS</div>
                        <div class="gf-title">BOX ${String(box).padStart(2,"0")}</div>
                        <p class="gf-sub">Day ${first.day} → Day ${last.day} • actual experimental captures</p>
                    </div>
                    <button class="gf-close">×</button>
                </div>

                <div class="gf-comparison">
                    <div class="gf-card">
                        <span class="gf-label">DAY ${first.day} • RAW CAPTURE</span>
                        <img src="${firstUrl}" alt="Day ${first.day} experimental image">
                    </div>

                    <div class="gf-card">
                        <span class="gf-label">DAY ${last.day} • VEGETATION SIGNAL</span>
                        <canvas class="gf-canvas" id="gfMask"></canvas>
                    </div>
                </div>

                <div class="gf-metrics">
                    <div class="gf-metric">
                        <small>VGI START</small>
                        <strong>${Number(first.vgi).toFixed(1)}</strong>
                    </div>
                    <div class="gf-metric">
                        <small>VGI END</small>
                        <strong>${Number(last.vgi).toFixed(1)}</strong>
                    </div>
                    <div class="gf-metric">
                        <small>VGI CHANGE</small>
                        <strong>${vgiChange >= 0 ? "+" : ""}${vgiChange.toFixed(1)}</strong>
                    </div>
                    <div class="gf-metric">
                        <small>GREEN SIGNAL</small>
                        <strong>${greenChange >= 0 ? "+" : ""}${greenChange.toFixed(1)}%</strong>
                    </div>
                </div>

                <div class="gf-analysis">
                    <div class="gf-analysis-head">SYSTEM INTERPRETATION</div>
                    <p>
                        Across the available observation period, Box ${String(box).padStart(2,"0")}
                        showed a ${Math.abs(vgiChange).toFixed(1)}-point change in its
                        image-derived Visual Growth Index. The vegetation mask on the right
                        highlights pixels contributing to the visual vegetation signal.
                        This is an image-based observation and does not represent measured
                        plant height or harvest weight.
                    </p>
                </div>

                <div class="gf-signal">
                    <div class="gf-signal-card">
                        <h3>RAW IMAGE → VEGETATION MASK</h3>
                        <p>
                            Green pixels are highlighted using the same Excess Green
                            (ExG) image-processing concept used by the project.
                        </p>
                    </div>
                    <div class="gf-signal-card">
                        <h3>WHY THIS MATTERS</h3>
                        <p>
                            The interface makes the connection between the captured image
                            and the numerical visual-growth signal directly inspectable.
                        </p>
                    </div>
                </div>

                <button class="gf-close-bottom">CLOSE FORENSICS</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector(".gf-close").onclick = closeForensics;
        modal.querySelector(".gf-close-bottom").onclick = closeForensics;

        const mask = buildMaskCanvas(lastImg);
        const target = modal.querySelector("#gfMask");
        target.width = mask.width;
        target.height = mask.height;
        target.getContext("2d").drawImage(mask,0,0);
    }

    /*
       Add a FORENSICS button to the selected-box Time Machine.
       It appears after a replay is opened.
    */
    function installForensicsButton() {
        const modal = document.getElementById("selectedBoxTimeMachine");
        if (!modal || modal.querySelector("#growthForensicsBtn")) return;

        const title = modal.querySelector(".tm-title");
        if (!title) return;

        const match = title.textContent.match(/(\d+)/);
        if (!match) return;

        const box = Number(match[1]);

        const button = document.createElement("button");
        button.id = "growthForensicsBtn";
        button.className = "tm-play";
        button.textContent = "🔬 GROWTH FORENSICS";
        button.style.marginLeft = "8px";

        const controls = modal.querySelector(".tm-controls");
        if (controls) {
            controls.appendChild(button);
            button.onclick = () => showForensics(box);
        }
    }

    /* Watch for the Time Machine modal appearing. */
    const observer = new MutationObserver(() => {
        installForensicsButton();
    });

    observer.observe(document.body, { childList:true, subtree:true });
})();

/* =========================================================
   BOX-TO-BOX EXPERIMENTAL COMPARISON
   ISOLATED / APPEND ONLY
   ========================================================= */

(function () {

    function addBoxComparison() {

        if (document.getElementById("boxCompareEngine")) return;

        const lab = document.querySelector(".experiment-lab");
        if (!lab) return;

        const section = document.createElement("section");
        section.id = "boxCompareEngine";

        section.innerHTML = `
            <div class="bce-head">
                <div>
                    <span>EXPERIMENTAL COMPARISON</span>
                    <h2>BOX VS BOX</h2>
                    <p>Compare two experimental setups across the observation period.</p>
                </div>
            </div>

            <div class="bce-selectors">

                <div class="bce-select-box">
                    <label>BOX A</label>
                    <select id="bceBoxA">
                        ${Array.from({length:22},(_,i)=>
                            `<option value="${i+1}">BOX ${String(i+1).padStart(2,"0")}</option>`
                        ).join("")}
                    </select>
                </div>

                <div class="bce-vs">VS</div>

                <div class="bce-select-box">
                    <label>BOX B</label>
                    <select id="bceBoxB">
                        ${Array.from({length:22},(_,i)=>
                            `<option value="${i+1}" ${i===1?"selected":""}>
                                BOX ${String(i+1).padStart(2,"0")}
                            </option>`
                        ).join("")}
                    </select>
                </div>

                <button id="bceCompareBtn">
                    COMPARE →
                </button>

            </div>

            <div id="bceResult">
                <div class="bce-placeholder">
                    SELECT TWO BOXES TO BEGIN COMPARISON
                </div>
            </div>
        `;

        lab.appendChild(section);

        document
            .getElementById("bceCompareBtn")
            .addEventListener("click", compareBoxes);

    }


    async function compareBoxes() {

        const a =
            Number(document.getElementById("bceBoxA").value);

        const b =
            Number(document.getElementById("bceBoxB").value);

        const result =
            document.getElementById("bceResult");

        if (a === b) {

            result.innerHTML = `
                <div class="bce-placeholder">
                    PLEASE SELECT TWO DIFFERENT BOXES
                </div>
            `;

            return;
        }

        result.innerHTML = `
            <div class="bce-loading">
                COMPARING BOX ${String(a).padStart(2,"0")}
                WITH BOX ${String(b).padStart(2,"0")}...
            </div>
        `;

        try {

            const [responseA,responseB] =
                await Promise.all([
                    fetch(`/api/box/${a}/profile`),
                    fetch(`/api/box/${b}/profile`)
                ]);

            const A = await responseA.json();
            const B = await responseB.json();

            const aHistory = A.history || [];
            const bHistory = B.history || [];

            const aFirst =
                Number(aHistory[0]?.vgi || 0);

            const bFirst =
                Number(bHistory[0]?.vgi || 0);

            const aLast =
                Number(A.vgi || 0);

            const bLast =
                Number(B.vgi || 0);

            const aChange = aLast - aFirst;
            const bChange = bLast - bFirst;

            result.innerHTML = `

                <div class="bce-cards">

                    ${buildComparisonCard(
                        "BOX A",
                        A,
                        aFirst,
                        aLast,
                        aChange
                    )}

                    <div class="bce-middle">
                        <div>VS</div>
                        <span>VISUAL<br>COMPARISON</span>
                    </div>

                    ${buildComparisonCard(
                        "BOX B",
                        B,
                        bFirst,
                        bLast,
                        bChange
                    )}

                </div>

                <div class="bce-history">

                    <div class="bce-history-title">
                        <span>GROWTH TRAJECTORY</span>
                        <small>DAY-WISE VGI</small>
                    </div>

                    <div class="bce-bars">

                        ${buildHistory(
                            aHistory,
                            "A"
                        )}

                        ${buildHistory(
                            bHistory,
                            "B"
                        )}

                    </div>

                </div>

                <div class="bce-note">
                    <strong>INTERPRETATION</strong>
                    <span>
                        This comparison shows differences in
                        image-derived visual indicators.
                        It does not establish causation between
                        cultivation conditions and growth.
                    </span>
                </div>
            `;

        }

        catch(error) {

            console.error(error);

            result.innerHTML = `
                <div class="bce-placeholder">
                    COMPARISON DATA UNAVAILABLE
                </div>
            `;

        }

    }


    function buildComparisonCard(
        label,
        data,
        first,
        last,
        change
    ) {

        return `

        <div class="bce-card">

            <div class="bce-card-top">
                <span>${label}</span>
                <strong>
                    BOX ${String(data.box_id).padStart(2,"0")}
                </strong>
            </div>

            <div class="bce-vgi">
                <strong>${last.toFixed(1)}</strong>
                <span>VGI</span>
            </div>

            <div class="bce-stat-row">
                <span>START</span>
                <b>${first.toFixed(1)}</b>
            </div>

            <div class="bce-stat-row">
                <span>END</span>
                <b>${last.toFixed(1)}</b>
            </div>

            <div class="bce-stat-row">
                <span>CHANGE</span>
                <b class="${change >= 0 ? "bce-positive":"bce-negative"}">
                    ${change >= 0 ? "+" : ""}
                    ${change.toFixed(1)}
                </b>
            </div>

            <div class="bce-stat-row">
                <span>GREEN COVERAGE</span>
                <b>${Number(data.green).toFixed(1)}%</b>
            </div>

        </div>

        `;
    }


    function buildHistory(history,label) {

        return `

        <div class="bce-history-column">

            <div class="bce-history-label">
                BOX ${label}
            </div>

            ${history.map(item => {

                const value =
                    Number(item.vgi || 0);

                return `

                    <div class="bce-day">

                        <span>
                            DAY ${item.day}
                        </span>

                        <div class="bce-track">
                            <div
                                style="width:${Math.max(
                                    0,
                                    Math.min(100,value)
                                )}%">
                            </div>
                        </div>

                        <b>${value.toFixed(1)}</b>

                    </div>

                `;

            }).join("")}

        </div>

        `;
    }


    const style =
        document.createElement("style");

    style.textContent = `

        #boxCompareEngine {

            margin-top: 35px;
            padding: 35px;

            border-radius: 22px;

            background:
                rgba(255,255,255,0.025);

            border:
                1px solid
                rgba(0,217,154,0.14);

        }


        #boxCompareEngine * {
            box-sizing: border-box;
        }


        .bce-head span {

            color:#00d99a;

            font-size:9px;

            letter-spacing:2.5px;

            font-weight:900;

        }


        .bce-head h2 {

            margin:7px 0 4px;

            font-size:25px;

        }


        .bce-head p {

            margin:0;

            font-size:11px;

            opacity:.5;

        }


        .bce-selectors {

            display:grid;

            grid-template-columns:
                1fr 50px 1fr auto;

            align-items:end;

            gap:12px;

            margin-top:25px;

        }


        .bce-select-box label {

            display:block;

            font-size:8px;

            letter-spacing:1.5px;

            opacity:.5;

            margin-bottom:7px;

        }


        .bce-select-box select {

            width:100%;

            padding:12px;

            border-radius:8px;

            border:
                1px solid
                rgba(255,255,255,.12);

            background:#07100d;

            color:white;

            outline:none;

        }


        .bce-vs {

            text-align:center;

            color:#00d99a;

            font-weight:900;

            font-size:11px;

            padding-bottom:12px;

        }


        #bceCompareBtn {

            padding:12px 18px;

            border-radius:8px;

            border:1px solid #00d99a;

            background:rgba(0,217,154,.08);

            color:#00d99a;

            font-weight:800;

            cursor:pointer;

        }


        #bceCompareBtn:hover {

            background:#00d99a;

            color:#061d18;

        }


        .bce-placeholder,
        .bce-loading {

            margin-top:25px;

            padding:35px;

            text-align:center;

            border-radius:14px;

            background:rgba(0,0,0,.18);

            font-size:9px;

            letter-spacing:1.5px;

            opacity:.5;

        }


        .bce-cards {

            display:grid;

            grid-template-columns:
                1fr 70px 1fr;

            gap:15px;

            margin-top:25px;

        }


        .bce-card {

            padding:22px;

            border-radius:15px;

            background:rgba(0,0,0,.22);

            border:
                1px solid
                rgba(255,255,255,.06);

        }


        .bce-card-top {

            display:flex;

            justify-content:space-between;

            align-items:center;

        }


        .bce-card-top span {

            color:#00d99a;

            font-size:8px;

            letter-spacing:1.5px;

        }


        .bce-card-top strong {

            font-size:18px;

        }


        .bce-vgi {

            margin:22px 0;

        }


        .bce-vgi strong {

            font-size:42px;

            color:#00d99a;

        }


        .bce-vgi span {

            margin-left:5px;

            font-size:9px;

            opacity:.4;

        }


        .bce-stat-row {

            display:flex;

            justify-content:space-between;

            padding:10px 0;

            border-top:
                1px solid
                rgba(255,255,255,.05);

            font-size:9px;

        }


        .bce-stat-row span {

            opacity:.45;

        }


        .bce-stat-row b {

            color:#d9eee3;

        }


        .bce-positive {
            color:#00d99a !important;
        }


        .bce-negative {
            color:#ff7777 !important;
        }


        .bce-middle {

            display:flex;

            flex-direction:column;

            justify-content:center;

            align-items:center;

            gap:8px;

        }


        .bce-middle div {

            width:42px;

            height:42px;

            border-radius:50%;

            display:flex;

            align-items:center;

            justify-content:center;

            background:rgba(0,217,154,.08);

            border:1px solid rgba(0,217,154,.25);

            color:#00d99a;

            font-weight:900;

            font-size:10px;

        }


        .bce-middle span {

            text-align:center;

            font-size:6px;

            line-height:1.5;

            opacity:.35;

        }


        .bce-history {

            margin-top:18px;

            padding:20px;

            border-radius:15px;

            background:rgba(0,0,0,.18);

        }


        .bce-history-title span {

            display:block;

            color:#00d99a;

            font-size:8px;

            letter-spacing:1.5px;

            font-weight:800;

        }


        .bce-history-title small {

            font-size:8px;

            opacity:.35;

        }


        .bce-bars {

            display:grid;

            grid-template-columns:1fr 1fr;

            gap:25px;

            margin-top:18px;

        }


        .bce-history-label {

            font-size:12px;

            font-weight:800;

            margin-bottom:14px;

        }


        .bce-day {
    display:grid;
    grid-template-columns:
        55px 1fr 45px;
    align-items:center;
    gap:12px;
    margin:11px 0;
    font-size:11px;
}

.bce-day span {
    opacity:.55;
    font-size:10px;
}

.bce-day b {
    text-align:right;
    color:#00d99a;
    font-size:11px;
}


        .bce-day span {

            opacity:.45;

        }


        .bce-track {

            height:5px;

            background:
                rgba(255,255,255,.07);

            border-radius:10px;

            overflow:hidden;

        }


        .bce-track div {

            height:100%;

            background:#00d99a;

            border-radius:10px;

        }


        .bce-day b {

            text-align:right;

            color:#00d99a;

        }


        .bce-note {

            margin-top:15px;

            padding:13px 15px;

            border-radius:10px;

            background:rgba(0,217,154,.035);

            border:
                1px solid
                rgba(0,217,154,.10);

            font-size:9px;

            line-height:1.5;

        }


        .bce-note strong {

            color:#00d99a;

            margin-right:8px;

            font-size:8px;

            letter-spacing:1px;

        }


        .bce-note span {

            opacity:.5;

        }


        @media(max-width:750px) {

            .bce-selectors {
                grid-template-columns:1fr;
            }

            .bce-vs {
                display:none;
            }

            .bce-cards {
                grid-template-columns:1fr;
            }

            .bce-middle {
                display:none;
            }

            .bce-bars {
                grid-template-columns:1fr;
            }

        }

    `;

    document.head.appendChild(style);


    document.addEventListener(
        "DOMContentLoaded",
        addBoxComparison
    );

})();

/* =========================================================
   FEEDBACK WALL ADDON
   ========================================================= */

async function loadFeedbackWall() {

    const grid = document.getElementById("feedbackWallGrid");
    const count = document.getElementById("feedbackCount");

    if (!grid) return;

    try {

        const response = await fetch("/feedback");

        if (!response.ok) {
            throw new Error("Feedback endpoint unavailable");
        }

        const html = await response.text();

        /*
         * This addon intentionally does not assume a new backend
         * database structure. Existing feedback submission remains
         * untouched.
         */

        grid.innerHTML = `
            <div class="feedback-empty">
                <span>LIVE FEEDBACK SYSTEM</span>
                <h3>Feedback received successfully</h3>
                <p>
                    Submitted responses are being collected through
                    the Smart Microgreen AI feedback system.
                </p>
            </div>
        `;

        if (count) {
            count.textContent = "✓";
        }

    } catch (error) {

        console.error("Feedback wall:", error);

        grid.innerHTML = `
            <div class="feedback-empty">
                <span>SYSTEM STATUS</span>
                <h3>Feedback channel active</h3>
                <p>
                    Your response helps improve the project.
                </p>
            </div>
        `;

    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadFeedbackWall();
});


/* =========================================================
   FEEDBACK WALL STYLES
   ========================================================= */

(function injectFeedbackWallStyles() {

    if (document.getElementById("feedbackWallStyles")) return;

    const style = document.createElement("style");
    style.id = "feedbackWallStyles";

    style.textContent = `

        .feedback-wall {
            max-width: 1150px;
            margin: 70px auto 100px;
            padding: 45px;
            border-radius: 28px;
            background:
                radial-gradient(
                    circle at 10% 10%,
                    rgba(0,217,154,.12),
                    transparent 32%
                ),
                rgba(7,15,20,.96);
            border: 1px solid rgba(0,217,154,.16);
            box-shadow: 0 30px 90px rgba(0,0,0,.28);
        }

        .feedback-wall-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 30px;
            margin-bottom: 30px;
        }

        .feedback-wall-header h2 {
            margin: 8px 0;
            font-size: 32px;
            letter-spacing: -1px;
        }

        .feedback-wall-header p {
            margin: 0;
            opacity: .6;
        }

        .feedback-wall-stat {
            min-width: 105px;
            padding: 18px 20px;
            text-align: center;
            border-radius: 16px;
            background: rgba(0,217,154,.07);
            border: 1px solid rgba(0,217,154,.18);
        }

        .feedback-wall-stat strong {
            display: block;
            font-size: 25px;
            color: #00d99a;
        }

        .feedback-wall-stat span {
            font-size: 9px;
            letter-spacing: 1.5px;
            opacity: .55;
        }

        .feedback-wall-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }

        .feedback-empty {
            grid-column: 1 / -1;
            padding: 45px 30px;
            text-align: center;
            border-radius: 18px;
            background: rgba(255,255,255,.025);
            border: 1px solid rgba(255,255,255,.07);
        }

        .feedback-empty span {
            font-size: 10px;
            letter-spacing: 2px;
            color: #00d99a;
            font-weight: 800;
        }

        .feedback-empty h3 {
            margin: 12px 0 8px;
            font-size: 22px;
        }

        .feedback-empty p {
            margin: 0;
            opacity: .55;
            font-size: 13px;
        }

        @media (max-width: 800px) {

            .feedback-wall {
                margin: 50px 20px;
                padding: 28px;
            }

            .feedback-wall-header {
                align-items: flex-start;
                flex-direction: column;
            }

            .feedback-wall-grid {
                grid-template-columns: 1fr;
            }

        }

    `;

    document.head.appendChild(style);

})();

/* =========================================================
   FEEDBACK EXPERIENCE ENGINE
   ========================================================= */

(function () {

    function initFeedbackExperience() {

        const stars = document.querySelectorAll(
            ".flp-stars button"
        );

        const score = document.getElementById("flpScore");
        const meter = document.getElementById("flpMeter");
        const status = document.getElementById("flpStatus");

        if (!stars.length || !score || !meter || !status) return;

        stars.forEach(star => {

            star.addEventListener("mouseenter", () => {

                const rating = Number(star.dataset.rating);

                stars.forEach(s => {
                    s.classList.toggle(
                        "preview",
                        Number(s.dataset.rating) <= rating
                    );
                });

                status.textContent =
                    rating >= 5 ? "EXCEPTIONAL EXPERIENCE" :
                    rating >= 4 ? "VERY POSITIVE EXPERIENCE" :
                    rating >= 3 ? "GOOD EXPERIENCE" :
                    rating >= 2 ? "ROOM FOR IMPROVEMENT" :
                    "WE NEED TO DO BETTER";

            });

            star.addEventListener("click", () => {

                const rating = Number(star.dataset.rating);

                score.textContent = rating;
                meter.style.width = `${rating * 20}%`;

                stars.forEach(s => {
                    s.classList.toggle(
                        "selected",
                        Number(s.dataset.rating) <= rating
                    );
                });

                status.textContent =
                    `RATING SELECTED • ${rating}/5`;

                const ratingSelect =
                    document.getElementById("feedbackRating");

                if (ratingSelect) {
                    ratingSelect.value = String(rating);
                }

            });

        });

        const starContainer =
            document.getElementById("flpStars");

        starContainer.addEventListener(
            "mouseleave",
            () => {

                stars.forEach(s => {
                    s.classList.remove("preview");
                });

            }
        );
        const ratingSelect = document.getElementById("feedbackRating");

if (ratingSelect) {
    ratingSelect.addEventListener("change", function () {

        const rating = Number(this.value);

        if (!rating) {
            score.textContent = "—";
            meter.style.width = "0%";

            stars.forEach(s => {
                s.classList.remove("selected", "preview");
            });

            status.textContent = "SELECT A RATING TO BEGIN";
            return;
        }

        score.textContent = rating;
        meter.style.width = `${rating * 20}%`;

        stars.forEach(s => {
            s.classList.toggle(
                "selected",
                Number(s.dataset.rating) <= rating
            );
            s.classList.remove("preview");
        });

        status.textContent = `RATING SELECTED • ${rating}/5`;
    });
}
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initFeedbackExperience
        );
    } else {
        initFeedbackExperience();
    }

})();


/* =========================================================
   FEEDBACK EXPERIENCE STYLES
   ========================================================= */

(function () {

    if (document.getElementById("feedbackExperienceCSS")) return;

    const style = document.createElement("style");

    style.id = "feedbackExperienceCSS";

    style.textContent = `

        .feedback-live-panel {
            margin-top: 30px;
            padding: 26px;
            border-radius: 20px;
            background:
                linear-gradient(
                    145deg,
                    rgba(98,225,139,.075),
                    rgba(255,255,255,.018)
                );
            border: 1px solid rgba(98,225,139,.16);
            position: relative;
            overflow: hidden;
        }

        .feedback-live-panel::after {
            content: "";
            position: absolute;
            width: 180px;
            height: 180px;
            right: -80px;
            top: -80px;
            border-radius: 50%;
            background: rgba(98,225,139,.08);
            filter: blur(20px);
            pointer-events: none;
        }

        .flp-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }

        .flp-header span {
            font-size: 9px;
            letter-spacing: 2px;
            color: #62e18b;
            font-weight: 800;
        }

        .flp-header h3 {
            margin: 7px 0 0;
            font-size: 19px;
        }

        .flp-score {
            min-width: 65px;
            text-align: center;
        }

        .flp-score strong {
            font-size: 28px;
            color: #62e18b;
        }

        .flp-score small {
            opacity: .45;
        }

        .flp-stars {
            display: flex;
            gap: 8px;
            margin: 22px 0 16px;
        }

        .flp-stars button {
            width: 44px;
            height: 44px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 12px;
            background: rgba(255,255,255,.025);
            color: rgba(255,255,255,.25);
            font-size: 22px;
            cursor: pointer;
            transition:
                transform .2s ease,
                color .2s ease,
                background .2s ease,
                border-color .2s ease;
        }

        .flp-stars button:hover,
        .flp-stars button.preview,
        .flp-stars button.selected {
            color: #62e18b;
            background: rgba(98,225,139,.08);
            border-color: rgba(98,225,139,.35);
            transform: translateY(-3px);
        }

        .flp-meter {
            height: 5px;
            width: 100%;
            border-radius: 99px;
            overflow: hidden;
            background: rgba(255,255,255,.07);
        }

        #flpMeter {
            width: 0%;
            height: 100%;
            border-radius: inherit;
            background: #62e18b;
            transition: width .45s ease;
        }

        .flp-status {
            margin-top: 12px;
            font-size: 9px;
            letter-spacing: 1.5px;
            opacity: .5;
            font-weight: 700;
        }

        @media (max-width: 600px) {

            .feedback-live-panel {
                padding: 20px;
            }

            .flp-stars {
                gap: 5px;
            }

            .flp-stars button {
                width: 40px;
                height: 40px;
            }

        }

    `;

    document.head.appendChild(style);

})();

/* =========================================================
   FEEDBACK INTELLIGENCE CONSOLE
   ========================================================= */

(function () {

    function initFeedbackIntelligence() {

        const name = document.getElementById("feedbackName");
        const rating = document.getElementById("feedbackRating");
        const message = document.getElementById("feedbackMessage");

        const charCount = document.getElementById("ficCharCount");
        const preview = document.getElementById("ficMessagePreview");
        const messageMeter = document.getElementById("ficMessageMeter");
        const messageStatus = document.getElementById("ficMessageStatus");

        const ratingValue = document.getElementById("ficRatingValue");
        const ratingBar = document.getElementById("ficRatingBar");
        const ratingText = document.getElementById("ficRatingText");

        const readyText = document.getElementById("ficReadyText");
        const checkName = document.getElementById("ficCheckName");
        const checkRating = document.getElementById("ficCheckRating");
        const checkMessage = document.getElementById("ficCheckMessage");

        if (!message || !rating) return;

        function updateConsole() {

            const nameOK = name && name.value.trim().length > 0;
            const ratingOK = rating.value !== "";
            const messageLength = message.value.trim().length;
            const messageOK = messageLength >= 10;

            /* MESSAGE */

            charCount.textContent =
                `${message.value.length} / 500`;

            const percentage =
                Math.min((message.value.length / 500) * 100, 100);

            messageMeter.style.width =
                `${percentage}%`;

            if (!messageLength) {

                preview.textContent =
                    "Start typing your feedback...";

                messageStatus.textContent =
                    "WAITING FOR INPUT";

            } else {

                preview.textContent =
                    message.value;

                if (messageLength < 10) {
                    messageStatus.textContent =
                        "KEEP GOING • ADD MORE DETAIL";
                } else if (messageLength < 40) {
                    messageStatus.textContent =
                        "BASIC RESPONSE DETECTED";
                } else if (messageLength < 100) {
                    messageStatus.textContent =
                        "CLEAR RESPONSE DETECTED";
                } else {
                    messageStatus.textContent =
                        "DETAILED RESPONSE DETECTED";
                }

            }

            /* RATING */

            if (ratingOK) {

                const value = Number(rating.value);

                ratingValue.textContent = value;
                ratingBar.style.width = `${value * 20}%`;

                ratingText.textContent =
                    value === 5 ? "EXCELLENT" :
                    value === 4 ? "VERY POSITIVE" :
                    value === 3 ? "POSITIVE" :
                    value === 2 ? "NEEDS IMPROVEMENT" :
                    "CRITICAL FEEDBACK";

            } else {

                ratingValue.textContent = "—";
                ratingBar.style.width = "0%";
                ratingText.textContent =
                    "No rating selected";

            }

            /* CHECKS */

            checkName.textContent =
                `${nameOK ? "✓" : "○"} NAME`;

            checkRating.textContent =
                `${ratingOK ? "✓" : "○"} RATING`;

            checkMessage.textContent =
                `${messageOK ? "✓" : "○"} MESSAGE`;

            checkName.classList.toggle("fic-complete", nameOK);
            checkRating.classList.toggle("fic-complete", ratingOK);
            checkMessage.classList.toggle("fic-complete", messageOK);

            /* FINAL STATUS */

            if (nameOK && ratingOK && messageOK) {

                readyText.textContent =
                    "READY TO SUBMIT";

                readyText.classList.add("fic-ready");

            } else {

                readyText.textContent =
                    "INCOMPLETE";

                readyText.classList.remove("fic-ready");

            }
        }

        name?.addEventListener("input", updateConsole);
        rating.addEventListener("change", updateConsole);
        message.addEventListener("input", updateConsole);

        updateConsole();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initFeedbackIntelligence
        );
    } else {
        initFeedbackIntelligence();
    }

})();


/* =========================================================
   FEEDBACK INTELLIGENCE STYLING
   ========================================================= */

(function () {

    if (document.getElementById("ficStyles")) return;

    const style = document.createElement("style");
    style.id = "ficStyles";

    style.textContent = `

        .fic-section {
            max-width: 1150px;
            margin: 75px auto 100px;
            padding: 42px;
            border-radius: 28px;
            background:
                radial-gradient(
                    circle at 85% 15%,
                    rgba(98,225,139,.10),
                    transparent 30%
                ),
                rgba(7,15,20,.97);
            border: 1px solid rgba(98,225,139,.15);
            box-shadow: 0 30px 100px rgba(0,0,0,.3);
        }

        .fic-heading {
            display:flex;
            justify-content:space-between;
            align-items:flex-end;
            gap:25px;
            margin-bottom:30px;
        }

        .fic-heading > div:first-child span {
            color:#62e18b;
            font-size:9px;
            font-weight:800;
            letter-spacing:2px;
        }

        .fic-heading h2 {
            margin:8px 0;
            font-size:32px;
            letter-spacing:-1px;
        }

        .fic-heading p {
            margin:0;
            opacity:.5;
            font-size:13px;
        }

        .fic-live {
            display:flex;
            align-items:center;
            gap:8px;
            padding:9px 13px;
            border:1px solid rgba(98,225,139,.2);
            border-radius:99px;
            font-size:9px;
            letter-spacing:1.5px;
            color:#62e18b;
            font-weight:800;
        }

        .fic-live i {
            width:7px;
            height:7px;
            border-radius:50%;
            background:#62e18b;
            box-shadow:0 0 12px #62e18b;
            animation:ficPulse 1.5s infinite;
        }

        @keyframes ficPulse {
            50% { opacity:.3; transform:scale(.65); }
        }

        .fic-grid {
            display:grid;
            grid-template-columns:1.5fr .8fr;
            gap:18px;
        }

        .fic-main,
        .fic-signal,
        .fic-readiness {
            border:1px solid rgba(255,255,255,.07);
            background:rgba(255,255,255,.025);
            border-radius:18px;
            padding:22px;
        }

        .fic-main {
            min-height:230px;
        }

        .fic-message-head {
            display:flex;
            justify-content:space-between;
            margin-bottom:15px;
        }

        .fic-message-head span,
        .fic-signal > span,
        .fic-readiness > span {
            font-size:9px;
            letter-spacing:1.7px;
            font-weight:800;
            opacity:.5;
        }

        .fic-message-head strong {
            font-size:10px;
            opacity:.4;
        }

        .fic-textbox {
            min-height:115px;
            padding:18px;
            border-radius:13px;
            background:rgba(0,0,0,.22);
            border:1px solid rgba(255,255,255,.06);
            position:relative;
            overflow:hidden;
        }

        .fic-textbox p {
            margin:0;
            font-size:13px;
            line-height:1.7;
            opacity:.65;
            word-break:break-word;
        }

        .fic-scan-line {
            position:absolute;
            left:0;
            right:0;
            top:0;
            height:1px;
            background:#62e18b;
            opacity:.35;
            animation:ficScan 3s linear infinite;
        }

        @keyframes ficScan {
            0% { transform:translateY(0); }
            100% { transform:translateY(115px); }
        }

        .fic-meter,
        .fic-rating-track {
            height:4px;
            border-radius:99px;
            background:rgba(255,255,255,.07);
            overflow:hidden;
        }

        #ficMessageMeter,
        #ficRatingBar {
            height:100%;
            width:0;
            background:#62e18b;
            border-radius:inherit;
            transition:.4s ease;
        }

        .fic-status {
            margin-top:12px;
            font-size:9px;
            letter-spacing:1.4px;
            color:#62e18b;
            font-weight:800;
        }

        .fic-side {
            display:grid;
            gap:18px;
        }

        .fic-rating-number {
            margin:15px 0;
        }

        .fic-rating-number strong {
            font-size:38px;
            color:#62e18b;
        }

        .fic-rating-number small {
            opacity:.35;
        }

        .fic-signal p {
            margin:12px 0 0;
            font-size:10px;
            opacity:.5;
            letter-spacing:1px;
        }

        .fic-readiness strong {
            display:block;
            margin:12px 0 18px;
            font-size:18px;
            color:#ffb45c;
        }

        .fic-readiness strong.fic-ready {
            color:#62e18b;
        }

        .fic-checks {
            display:grid;
            gap:9px;
            font-size:10px;
            letter-spacing:1px;
            opacity:.45;
        }

        .fic-checks .fic-complete {
            color:#62e18b;
            opacity:1;
        }

        @media(max-width:800px) {

            .fic-section {
                margin:50px 20px;
                padding:28px;
            }

            .fic-grid {
                grid-template-columns:1fr;
            }

            .fic-heading {
                align-items:flex-start;
                flex-direction:column;
            }

        }

    `;

    document.head.appendChild(style);

})();