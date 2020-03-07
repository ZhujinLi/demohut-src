
export function showDemoCWidth() {
    const canvas = document.getElementById("view-cwidth");
    const ctx = canvas.getContext("2d");

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const x0 = w / 4;
    const x1 = w * 3 / 8;
    const x2 = w * 7 / 16;
    const x3 = w - x2;
    const x4 = w - x1;
    const x5 = w - x0;
    const y0 = h / 6;
    const y1 = h / 3;
    const y2 = h / 2;
    const y3 = h / 3 * 2;

    let dist = 0.0;
    const SPEED = 0.5;
    const TICK_INVERVAL = 10.0;

    const side = (y3 - y2) / 3;
    const circumference = Math.PI * side * 3;

    setInterval(render, 16);

    function render() {
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();

        ctx.strokeStyle = '#888';

        ctx.moveTo(x2, y0);
        ctx.lineTo(x3, y0);
        ctx.lineTo(x4, y1);
        ctx.lineTo(x5, y1);
        ctx.lineTo(x5, y2);
        ctx.lineTo(x0, y2);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y0);

        ctx.moveTo(0, y3);
        ctx.lineTo(w, y3);

        dist += SPEED;
        const tick0 = TICK_INVERVAL - (dist - Math.floor(dist / TICK_INVERVAL) * TICK_INVERVAL);

        for (let x = tick0; x < w; x += TICK_INVERVAL) {
            ctx.moveTo(x, y3);
            ctx.lineTo(x, y3 + 10);
        }

        ctx.stroke();

        drawWheel(x1, y2, true);
        drawWheel(x4, y2, false);

        ctx.strokeStyle = '#f88';
        ctx.beginPath();
        ctx.moveTo(x1, y2);
        ctx.lineTo(x1, y3);
        ctx.moveTo(x4, y2);
        ctx.lineTo(x4, y3);
        ctx.stroke();

        function drawWheel(baseX, baseY, showInner) {
            ctx.beginPath();

            const unitCircum = circumference / 3;
            const unitDist = dist - Math.floor(dist / unitCircum) * unitCircum;

            let A, B, C;
            if (unitDist / unitCircum < 2 / 3) {  // Big
                C = { x: baseX, y: baseY + side };

                const alpha = unitDist / (unitCircum * 2.0 / 3) * (Math.PI / 3);
                const beta = (Math.PI / 3) - alpha;
                A = { x: baseX - side * Math.sin(alpha), y: C.y + side * Math.cos(alpha) };
                B = { x: baseX + side * Math.sin(beta), y: C.y + side * Math.cos(beta) };
            } else {    // Small
                B = { x: baseX, y: baseY + side * 2 };

                const alpha = (unitDist / unitCircum - 2.0 / 3) * 3 * (Math.PI / 3);
                const beta = (Math.PI / 3) - alpha;
                A = { x: baseX - side * Math.sin(beta), y: B.y - side * Math.cos(beta) };
                C = { x: baseX + side * Math.sin(alpha), y: B.y - side * Math.cos(alpha) };
            }

            let D = reflect(A, C);
            let E = reflect(A, B);
            let F = reflect(C, B);
            let G = reflect(C, A);
            let H = reflect(B, A);
            let I = reflect(B, C);

            if (showInner) {
                ctx.moveTo(D.x, D.y);
                ctx.lineTo(G.x, G.y);
                ctx.moveTo(F.x, F.y);
                ctx.lineTo(I.x, I.y);
                ctx.moveTo(E.x, E.y);
                ctx.lineTo(H.x, H.y);

                ctx.stroke();
            }

            drawArc(C, D, side * 2);
            drawArc(B, I, side);
            drawArc(A, H, side * 2);
            drawArc(C, G, side);
            drawArc(B, F, side * 2);
            drawArc(A, E, side);
        }

        function drawArc(O, startP, radius) {
            const startAngle = -Math.atan2(O.y - startP.y, startP.x - O.x);

            ctx.beginPath();
            ctx.arc(O.x, O.y, radius, startAngle - Math.PI / 3, startAngle);
            ctx.stroke();
        }

        function reflect(base, p) {
            return { x: 2 * base.x - p.x, y: 2 * base.y - p.y };
        }
    }
}