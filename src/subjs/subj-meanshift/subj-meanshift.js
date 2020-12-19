import 'two.js/build/two';

const W = 800;
const H = 600;
const GREEN = '#a0ff00';
const ORANGE = '#ff8000';
const BLUE = '#00c0ff';

const two = new Two({
    fullscreen: false,
    width: W,
    height: H,
});
two.appendTo(document.getElementById('div-main'));

const rect = two.makeRectangle(300, 200, 200, 100);
rect.fill = GREEN;
rect.opacity = 0.3;
rect.noStroke();

let points = [];
for (let i = 0; i < 1000; i++) {
    const point = two.makeCircle(randn_bm() * W, randn_bm() * H, 2);
    point.linewidth = 0;
    enablePointHighlight(point, false);
    points.push(point);
}

const rectCenter = makeCross(GREEN);

const meanPoint = makeCross(ORANGE);

two.bind('update', animate).play();

function animate() {
    const mean = calcMean();
    const delta = { x: mean.x - rect.position.x, y: mean.y - rect.position.y };

    meanPoint.position.x = mean.x;
    meanPoint.position.y = mean.y;

    rect.position.x += delta.x / 50;
    rect.position.y += delta.y / 50;

    rectCenter.position.x = rect.position.x;
    rectCenter.position.y = rect.position.y;

    for (let i = 0; i < points.length; i++) {
        enablePointHighlight(points[i], inside(points[i], rect));
    }
}

function calcMean() {
    let x = 0, y = 0;
    let cnt = 0;
    for (let i = 0; i < points.length; i++) {
        if (inside(points[i], rect)) {
            cnt++;
            x += points[i].position.x;
            y += points[i].position.y;
        }
    }
    return { x: x / cnt, y: y / cnt };
}

function makeCross(color) {
    const hor = two.makeLine(-5, 0, 5, 0);
    hor.stroke = color;

    const ver = two.makeLine(0, -5, 0, 5);
    ver.stroke = color;

    const group = two.makeGroup(hor, ver);
    return group;
}

function inside(point, rect) {
    return point.position.x >= rect.position.x - rect.width / 2
        && point.position.x <= rect.position.x + rect.width / 2
        && point.position.y >= rect.position.y - rect.height / 2
        && point.position.y <= rect.position.y + rect.height / 2;
}

function enablePointHighlight(point, enable) {
    point.fill = enable ? ORANGE : BLUE;
}

// Get normal distribution using Box-Muller transform
function randn_bm() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * 0.12 + 0.5;
}
