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

                <div class="result-card">
                    <small>GROWTH CATEGORY</small>
                    <strong>${growthCategory}</strong>
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


feedbackForm.addEventListener(
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
