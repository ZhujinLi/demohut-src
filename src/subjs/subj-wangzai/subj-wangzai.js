/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas-under");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

// Initialize a position
drawEyeBalls(1, 0.5);

// For desktop, interact with mouse
window.onmousemove = onmousemove;

// For mobile, interact with gyroscope (requiring HTTPS)
if (window.DeviceMotionEvent) {
    window.ondevicemotion = ondevicemotion;

    // Permission prompt needs to be activated by user input on iPhone
    window.onclick = () => DeviceMotionEvent.requestPermission();
}

/**
 * 
 * @param {DeviceMotionEvent} ev 
 */
function ondevicemotion(ev) {
    const x = -ev.accelerationIncludingGravity.x / 9.8 * 0.5 + 0.5;
    const y = ev.accelerationIncludingGravity.y / 9.8 * 0.5 + 0.5;
    drawEyeBalls(x, y);
}

/**
 * 
 * @param {MouseEvent} ev 
 */
function onmousemove(ev) {
    const x = ev.x / window.innerWidth;
    const y = ev.y / window.innerHeight;
    drawEyeBalls(x, y);
}

function drawEyeBalls(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEyeBall([[410, 421], [462, 410], [457, 381], [403, 398]], x, y, 15);
    drawEyeBall([[631, 391], [692, 383], [683, 363], [620, 372]], x, y, 15);
    drawEyeBall([[513, 858], [532, 856], [532, 834], [515, 833]], x, y, 7);
    drawEyeBall([[548, 853], [565, 855], [567, 831], [549, 831]], x, y, 7);
}

function drawEyeBall(quad, x, y, radius) {
    const posImg = blerp(quad, x, y);
    const posCanvas = transformCoordImg2Canvas(posImg);

    ctx.fillStyle = "#000";

    ctx.beginPath();
    ctx.arc(posCanvas[0], posCanvas[1], radius, 0, 360);
    ctx.closePath();

    ctx.fill();
}

function transformCoordImg2Canvas(coord) {
    const wImg = document.getElementById("img-pic").naturalWidth;
    const hImg = document.getElementById("img-pic").naturalHeight;
    const wCanvas = canvas.width;
    const hCanvas = canvas.height;

    return [
        coord[0] / wImg * wCanvas,
        coord[1] / hImg * hCanvas,
    ];
}

/**
 * Perform bilinear interpolation over a quad (CCW from bottom-left).
 */
function blerp(quad, x, y) {
    const top = lerp(quad[3], quad[2], x);
    const bottom = lerp(quad[0], quad[1], x);
    return lerp(top, bottom, y);
}

function lerp(a, b, ratio) {
    return [
        a[0] * (1 - ratio) + b[0] * ratio,
        a[1] * (1 - ratio) + b[1] * ratio,
    ];
}