/* global cv */
/* global Chart */

let virtualVideo;
let startImg;
let endImg;
let chart;

document.getElementById("opencv-content").style.display = "none";
document.getElementById("slider-start-time").oninput = onStartTimeChanged;
document.getElementById("slider-end-time").oninput = onEndTimeChanged;
document.getElementById("slider-roi-l").oninput = onRoiChanged;
document.getElementById("slider-roi-t").oninput = onRoiChanged;
document.getElementById("slider-roi-r").oninput = onRoiChanged;
document.getElementById("slider-roi-b").oninput = onRoiChanged;
document.getElementById("input-video-file").onchange = onNewVideo;
document.getElementById("btn-analyze").onclick = onAnalyze;

cv['onRuntimeInitialized'] = () => {
    document.getElementById("loading-ico").style.display = "none";
    document.getElementById("opencv-content").style.display = "initial";

    chart = new Chart("plot-curve", {
        type: 'line',
        data: {
            datasets: [
                { label: "translation", borderColor: "red" },
                { label: "rotation", borderColor: "blue" },
                { label: "scaling", borderColor: "green" }]
        },
        options: {
            maintainAspectRatio: false
        }
    });

    setupVideo("/public/subjs/subj-anim-curve/example.mp4", { l: 20, t: 150, r: 630, b: 1100 }, 0.6, 1.5);
}

function setupVideo(path, roi, startTime, endTime) {
    virtualVideo = document.createElement("video");

    virtualVideo.onloadedmetadata = () => {
        if (!startTime) {
            startTime = virtualVideo.duration / 4;
        }
        document.getElementById("slider-start-time").value = startTime / virtualVideo.duration;
        updateStartTimeLabel();

        if (!endTime) {
            endTime = virtualVideo.duration / 4 * 3;
        }
        document.getElementById("slider-end-time").value = endTime / virtualVideo.duration;
        updateEndTimeLabel();

        if (roi == undefined) {
            roi = {
                l: virtualVideo.videoWidth / 4, t: virtualVideo.videoHeight / 4,
                r: virtualVideo.videoWidth * 3 / 4, b: virtualVideo.videoHeight * 3 / 4
            };
        }
        document.getElementById("slider-roi-l").value = roi.l / virtualVideo.videoWidth;
        document.getElementById("slider-roi-t").value = roi.t / virtualVideo.videoHeight;
        document.getElementById("slider-roi-r").value = roi.r / virtualVideo.videoWidth;
        document.getElementById("slider-roi-b").value = roi.b / virtualVideo.videoHeight;
        onRoiChanged();

        startImg = endImg = null;
        virtualVideo.onseeked = initThumbnails;
        virtualVideo.currentTime = startTimeInSec();
    }

    virtualVideo.src = path;
}

function currentRoi() {
    return {
        l: document.getElementById("slider-roi-l").value * virtualVideo.videoWidth,
        t: document.getElementById("slider-roi-t").value * virtualVideo.videoHeight,
        r: document.getElementById("slider-roi-r").value * virtualVideo.videoWidth,
        b: document.getElementById("slider-roi-b").value * virtualVideo.videoHeight,
    };
}

function onRoiChanged() {
    let roi = currentRoi();

    document.getElementById("label-roi-l").innerText = "left: " + roi.l.toFixed(0);
    document.getElementById("label-roi-t").innerText = "top: " + roi.t.toFixed(0);
    document.getElementById("label-roi-r").innerText = "right: " + roi.r.toFixed(0);
    document.getElementById("label-roi-b").innerText = "bottom: " + roi.b.toFixed(0);

    renderThumbnails();
}

function onStartTimeChanged() {
    updateStartTimeLabel();

    virtualVideo.onseeked = updateStartThumbnail;
    virtualVideo.currentTime = startTimeInSec();
}

function onEndTimeChanged() {
    updateEndTimeLabel();

    virtualVideo.onseeked = updateEndThumbnail;
    virtualVideo.currentTime = endTimeInSec();
}

function getVideoImage() {
    let virtualCanvas = document.createElement('canvas');
    let ctx = virtualCanvas.getContext('2d');
    virtualCanvas.height = virtualVideo.videoHeight;
    virtualCanvas.width = virtualVideo.videoWidth;

    ctx.drawImage(virtualVideo, 0, 0, virtualCanvas.width, virtualCanvas.height);

    let img = document.createElement("img");
    img.src = virtualCanvas.toDataURL();
    return img;
}

function updateStartThumbnail() {
    startImg = getVideoImage();
    startImg.onload = renderThumbnails;
}

function updateEndThumbnail() {
    endImg = getVideoImage();
    endImg.onload = renderThumbnails;
}

function initThumbnails() {
    if (!startImg) {
        updateStartThumbnail();
        virtualVideo.currentTime = endTimeInSec();
    } else if (!endImg) {
        updateEndThumbnail();
        virtualVideo.onseeked = null;
    }
}

function startTimeInSec() {
    let startTime = document.getElementById("slider-start-time").value;
    let timeInSec = startTime * virtualVideo.duration;
    return timeInSec;
}

function endTimeInSec() {
    let endTime = document.getElementById("slider-end-time").value;
    let timeInSec = endTime * virtualVideo.duration;
    return timeInSec;
}

function updateStartTimeLabel() {
    document.getElementById("label-start-time").innerText = startTimeInSec().toFixed(2) + "s";
}

function updateEndTimeLabel() {
    document.getElementById("label-end-time").innerText = endTimeInSec().toFixed(2) + "s";
}

function renderSingleThumbnail(canvas, img) {
    canvas.height = img.height / img.width * canvas.width;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let roi = currentRoi();
    ctx.strokeRect(
        canvas.width * roi.l / virtualVideo.videoWidth,
        canvas.height * roi.t / virtualVideo.videoHeight,
        canvas.width * (roi.r - roi.l) / virtualVideo.videoWidth,
        canvas.height * (roi.b - roi.t) / virtualVideo.videoHeight
    );
}

function renderThumbnails() {
    if (startImg) {
        renderSingleThumbnail(document.getElementById("canvas-start-time"), startImg);
    }

    if (endImg) {
        renderSingleThumbnail(document.getElementById("canvas-end-time"), endImg);
    }
}

function onNewVideo(e) {
    setupVideo(URL.createObjectURL(e.target.files[0]));
}

function onAnalyze() {
    let lastImg, curImg;
    let mask = roiMask();
    let m = new cv.Mat.eye(2, 3, cv.CV_32F);

    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    chart.data.datasets[2].data = [];
    chart.data.labels = [];

    virtualVideo.currentTime = startTimeInSec();
    virtualVideo.onseeked = () => {
        if (virtualVideo.currentTime > endTimeInSec()) {
            virtualVideo.onseeked = null;
            return;
        }

        lastImg = curImg;
        curImg = getVideoImage();
        curImg.onload = () => {
            if (lastImg && curImg) {
                evalFrameTransform(lastImg, curImg, mask, m);
            }
            virtualVideo.currentTime += 0.016;
        };
    }
}

function evalFrameTransform(lastImg, curImg, mask, m) {
    let mat = cv.imread(lastImg);
    let mat1 = cv.imread(curImg);

    cv.cvtColor(mat, mat, cv.COLOR_BGR2GRAY)
    cv.cvtColor(mat1, mat1, cv.COLOR_BGR2GRAY)

    let criteria = { type: cv.TermCriteria_EPS | cv.TermCriteria_MAX_ITER, maxCount: 200, epsilon: 0.001 };
    cv.findTransformECC(mat, mat1, m, cv.MOTION_AFFINE, criteria, mask, 5)

    let labels = chart.data.labels;
    labels.push(labels.length);

    let tArray = chart.data.datasets[0].data;
    let t = Math.sqrt(Math.pow(m.floatPtr(0, 2)[0], 2) + Math.pow(m.floatPtr(1, 2)[0], 2));
    t /= virtualVideo.videoWidth;   // Make it smaller
    let lastT = tArray.length > 0 ? tArray[tArray.length - 1] : 0;
    let accumT = t + lastT;
    tArray.push(accumT);

    let rArray = chart.data.datasets[1].data;
    let r = 0.5 * (Math.atan2(-m.floatPtr(0, 1)[0], m.floatPtr(0, 0)[0]) +
        Math.atan2(m.floatPtr(1, 0)[0], m.floatPtr(1, 1)[0]));
    let lastR = rArray.length > 0 ? rArray[rArray.length - 1] : 0;
    let accumR = r + lastR;
    rArray.push(accumR);

    let sArray = chart.data.datasets[2].data;
    let s = 0.5 * (m.floatPtr(0, 0)[0] + m.floatPtr(1, 1)[0])
    let lastS = sArray.length > 0 ? sArray[sArray.length - 1] : 1;
    let accumS = lastS * s;
    sArray.push(accumS);

    chart.update();

    mat.delete();
    mat1.delete();
}

function roiMask() {
    let rows = virtualVideo.videoHeight;
    let cols = virtualVideo.videoWidth;
    let mask = new cv.Mat.zeros(rows, cols, cv.CV_8U);
    let roi = currentRoi();
    for (let i = roi.l; i < roi.r; i++) {
        for (let j = roi.t; j < roi.b; j++) {
            mask.ucharPtr(j, i)[0] = 1;
        }
    }
    return mask;
}