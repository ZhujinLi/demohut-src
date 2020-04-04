export function showDemoEulerLine() {
    const canvas = document.getElementById("view-triangle");
    const ctx = canvas.getContext("2d");
    const A = { x: 250, y: 50 };
    const B = { x: 200, y: 300 };
    const C = { x: 500, y: 300 };
    let selectedVertex = null;

    const VERTEX_RADIUS = 5;
    const CENTER_RADIUS = 3;
    const CIRCUMCENTER_COLOR = "#0072BD";
    const CENTROID_COLOR = "#D95319";
    const ORTHOCENTER_COLOR = "#EDB120";

    canvas.onmousedown = (evt) => {
        const mousePos = getMousePos(canvas, evt);
        if (testVertex(mousePos, A)) {
            selectedVertex = A;
        } else if (testVertex(mousePos, B)) {
            selectedVertex = B;
        } else if (testVertex(mousePos, C)) {
            selectedVertex = C
        } else {
            selectedVertex = null;
        }
    }

    canvas.onmouseup = () => {
        selectedVertex = null;
    }

    canvas.onmousemove = (evt) => {
        const mousePos = getMousePos(canvas, evt);
        if (selectedVertex) {
            selectedVertex.x = mousePos.x;
            selectedVertex.y = mousePos.y;
        }
        render();
    };

    render();

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 0.5;

        renderTriangleSide(A, B);
        renderTriangleSide(A, C);
        renderTriangleSide(B, C);

        renderEulerLine();

        renderCircumcenter();
        renderCentroid();
        renderOrthocenter();

        renderTriangleVertex(A);
        renderTriangleVertex(B);
        renderTriangleVertex(C);

        renderLegend();
    }

    function renderTriangleSide(p, q) {
        ctx.strokeStyle = "#666";
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    }

    function renderEulerLine() {
        ctx.strokeStyle = "#000";
        const orthocenter = calcOrthocenter();
        const circumcenter = calcCircumcenter();
        ctx.moveTo(orthocenter.x, orthocenter.y);
        ctx.lineTo(circumcenter.x, circumcenter.y);
        ctx.stroke();
    }

    function renderTriangleVertex(p) {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(p.x, p.y, VERTEX_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    }

    function renderLegend() {
        const startX = canvas.clientWidth - 100;
        const startY = 30;
        const STEP = 30;

        // Dots
        //
        ctx.fillStyle = CIRCUMCENTER_COLOR;
        ctx.beginPath();
        ctx.arc(startX, startY, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = CENTROID_COLOR;
        ctx.beginPath();
        ctx.arc(startX, startY + STEP, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = ORTHOCENTER_COLOR;
        ctx.beginPath();
        ctx.arc(startX, startY + 2 * STEP, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Texts
        //
        ctx.font = "16px Helvetica";
        ctx.textBaseline = 'middle';

        ctx.fillStyle = CIRCUMCENTER_COLOR
        ctx.fillText("外心", startX + 10, startY);

        ctx.fillStyle = CENTROID_COLOR;
        ctx.fillText("重心", startX + 10, startY + STEP);

        ctx.fillStyle = ORTHOCENTER_COLOR;
        ctx.fillText("垂心", startX + 10, startY + STEP * 2);
    }

    function renderCircumcenter() {
        const center = calcCircumcenter();

        // Draw circumcenter
        ctx.fillStyle = CIRCUMCENTER_COLOR;
        ctx.beginPath();
        ctx.arc(center.x, center.y, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw cicumcircle
        const radius = Math.sqrt(Math.pow((center.x - A.x), 2) + Math.pow(center.y - A.y, 2));
        ctx.strokeStyle = CIRCUMCENTER_COLOR;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the lines
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(A.x, A.y);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(B.x, B.y);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(C.x, C.y);
        ctx.stroke();
    }

    function renderCentroid() {
        const centroid = calcCentroid();

        // Draw centroid
        ctx.fillStyle = CENTROID_COLOR;
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw lines
        ctx.strokeStyle = CENTROID_COLOR;
        ctx.moveTo(A.x, A.y);
        ctx.lineTo((B.x + C.x) / 2, (B.y + C.y) / 2);
        ctx.moveTo(B.x, B.y);
        ctx.lineTo((A.x + C.x) / 2, (A.y + C.y) / 2);
        ctx.moveTo(C.x, C.y);
        ctx.lineTo((A.x + B.x) / 2, (A.y + B.y) / 2);
        ctx.stroke();
    }

    function renderOrthocenter() {
        const orthocenter = calcOrthocenter();

        // Draw orthocenter
        ctx.fillStyle = ORTHOCENTER_COLOR;
        ctx.beginPath();
        ctx.arc(orthocenter.x, orthocenter.y, CENTER_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw rays
        ctx.strokeStyle = ORTHOCENTER_COLOR;
        ray(A, orthocenter);
        ray(B, orthocenter);
        ray(C, orthocenter);
        ctx.stroke();
    }

    function ray(from, to) {
        const toFar = {
            x: from.x + 1000 * (to.x - from.x),
            y: from.y + 1000 * (to.y - from.y),
        };
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(toFar.x, toFar.y);
    }

    function calcCircumcenter() {
        const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
        const x = 1 / D * ((A.x * A.x + A.y * A.y) * (B.y - C.y) + (B.x * B.x + B.y * B.y) * (C.y - A.y) + (C.x * C.x + C.y * C.y) * (A.y - B.y));
        const y = 1 / D * ((A.x * A.x + A.y * A.y) * (C.x - B.x) + (B.x * B.x + B.y * B.y) * (A.x - C.x) + (C.x * C.x + C.y * C.y) * (B.x - A.x));
        return { x: x, y: y };
    }

    function calcCentroid() {
        const centroid = {
            x: (A.x + B.x + C.x) / 3.0,
            y: (A.y + B.y + C.y) / 3.0
        };
        return centroid;
    }

    function calcOrthocenter() {
        // Here I just make use of the theorem...
        const circumcenter = calcCircumcenter();
        const centroid = calcCentroid();
        const v = { x: centroid.x - circumcenter.x, y: centroid.y - circumcenter.y };
        const orthocenter = {
            x: circumcenter.x + 3 * v.x,
            y: circumcenter.y + 3 * v.y
        };
        return orthocenter;
    }

    function testVertex(p, v) {
        const dist = Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
        return dist <= VERTEX_RADIUS * 1.5;
    }
}