import { sqrt } from "mathjs";

/**
 * @param {Array} contour 
 */
export function mwt(contour) {
    let n = contour.length;
    const L = Array(n).fill(0).map(x => Array(n).fill(Infinity));
    const S = Array(n).fill(0).map(x => Array(n).fill(0));

    for (let i = 0; i < n - 1; i++) {
        L[i][i + 1] = 0;
    }

    for (let l = 2; l < n; l++) {
        for (let i = 0; i < n - l; i++) {
            const j = i + l;
            L[i][j] = Infinity;
            if (!isEdgeInsidePolygon(i, j)) {
                continue;
            }
            for (let k = i + 1; k < j; k++) {
                const x = L[i][k] + L[k][j] + u(i, j, k);
                if (x < L[i][j]) {
                    L[i][j] = x;
                    S[i][j] = k;
                }
            }
        }
    }

    let edges = [];
    makeEdges(0, n - 1);

    return {
        edges: edges,
        weight: L[0][n - 1],
    };

    //

    function u(i, j, k) {
        const xi = contour[i][0];
        const yi = contour[i][1];

        const xj = contour[j][0];
        const yj = contour[j][1];

        const xk = contour[k][0];
        const yk = contour[k][1];

        return length(xi - xj, yi - yj) +
            length(xi - xk, yi - yk) +
            length(xk - xj, yk - yj);

        function length(dx, dy) {
            return sqrt(dx * dx + dy * dy);
        }
    }

    function makeEdges(i, j) {
        if (i >= j - 1) {
            return;
        }

        edges.push([contour[i][0], contour[i][1], contour[j][0], contour[j][1]]);

        const k = S[i][j];
        edges.push([contour[i][0], contour[i][1], contour[k][0], contour[k][1]]);
        edges.push([contour[j][0], contour[j][1], contour[k][0], contour[k][1]]);

        makeEdges(i, k);
        makeEdges(k, j);
    }

    function isEdgeInsidePolygon(i, j) {
        if (i == 0 && j == n - 1) {
            return true;
        }

        // Check intersection
        for (let k = 0; k < n; k++) {
            const w = (k + 1) % n;
            if (k == i || k == j || w == i || w == j) {
                continue;
            }

            if (linesIntersect(contour[i][0], contour[i][1], contour[j][0], contour[j][1],
                contour[k][0], contour[k][1], contour[w][0], contour[w][1])) {
                return false;
            }
        }

        // Check whether fully outside
        const midx = (contour[i][0] + contour[j][0]) / 2;
        const midy = (contour[i][1] + contour[j][1]) / 2;
        if (!pointInsidePolygon(midx, midy)) {
            return false;
        }

        return true;

        //

        function linesIntersect(x0, y0, x1, y1, x2, y2, x3, y3) {
            // Here we ignore collinear cases
            return direction(x0, y0, x1, y1, x2, y2) != direction(x0, y0, x1, y1, x3, y3)
                && direction(x2, y2, x3, y3, x0, y0) != direction(x2, y2, x3, y3, x1, y1);

            //

            function direction(ax, ay, bx, by, cx, cy) {
                return Math.sign((by - ay) * (cx - bx) - (bx - ax) * (cy - by));
            }
        }

        function pointInsidePolygon(x, y) {
            let inside = false;
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                let leftx, lefty, rightx, righty;
                if (contour[i][0] < contour[j][0]) {
                    leftx = contour[i][0];
                    lefty = contour[i][1];
                    rightx = contour[j][0];
                    righty = contour[j][1];
                }
                else {
                    leftx = contour[j][0];
                    lefty = contour[j][1];
                    rightx = contour[i][0];
                    righty = contour[i][1];
                }
                if ((x > leftx) == (x <= rightx)) {
                    if ((leftx - x) * (righty - y) <= (lefty - y) * (rightx - x)) {
                        inside = !inside;
                    }
                }
            }
            return inside;
        }
    }
}
