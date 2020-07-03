import * as math from "mathjs";

export function init() {
    const perm = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random());
    const center3x3 = math.matrix([perm.slice(0, 3), perm.slice(3, 6), perm.slice(6, 9)]);
    const m = math.zeros(9, 9);
    m.subset(math.index([3, 4, 5], [3, 4, 5]), center3x3);
    return m;
}

/**
 * 
 * @param {math.Matrix} mat 
 */
export function ltrb(mat) {
    // Left
    mat.subset(math.index(3, [0, 1, 2]), mat.subset(math.index(5, [3, 4, 5])));
    mat.subset(math.index(4, [0, 1, 2]), mat.subset(math.index(3, [3, 4, 5])));
    mat.subset(math.index(5, [0, 1, 2]), mat.subset(math.index(4, [3, 4, 5])));

    // Top
    mat.subset(math.index([0, 1, 2], 3), mat.subset(math.index([3, 4, 5], 5)));
    mat.subset(math.index([0, 1, 2], 4), mat.subset(math.index([3, 4, 5], 3)));
    mat.subset(math.index([0, 1, 2], 5), mat.subset(math.index([3, 4, 5], 4)));

    // Right
    mat.subset(math.index(3, [6, 7, 8]), mat.subset(math.index(4, [3, 4, 5])));
    mat.subset(math.index(4, [6, 7, 8]), mat.subset(math.index(5, [3, 4, 5])));
    mat.subset(math.index(5, [6, 7, 8]), mat.subset(math.index(3, [3, 4, 5])));

    // Bottom
    mat.subset(math.index([6, 7, 8], 3), mat.subset(math.index([3, 4, 5], 4)));
    mat.subset(math.index([6, 7, 8], 4), mat.subset(math.index([3, 4, 5], 5)));
    mat.subset(math.index([6, 7, 8], 5), mat.subset(math.index([3, 4, 5], 3)));
}

/**
 * 
 * @param {math.Matrix} mat 
 */
export function corners(mat) {
    // Top-left
    mat.subset(math.index([0, 1, 2], 0), mat.subset(math.index([3, 4, 5], 2)));
    mat.subset(math.index([0, 1, 2], 1), mat.subset(math.index([3, 4, 5], 0)));
    mat.subset(math.index([0, 1, 2], 2), mat.subset(math.index([3, 4, 5], 1)));

    // Top-right
    mat.subset(math.index([0, 1, 2], 6), mat.subset(math.index([3, 4, 5], 8)));
    mat.subset(math.index([0, 1, 2], 7), mat.subset(math.index([3, 4, 5], 6)));
    mat.subset(math.index([0, 1, 2], 8), mat.subset(math.index([3, 4, 5], 7)));

    // Bottom-left
    mat.subset(math.index([6, 7, 8], 0), mat.subset(math.index([3, 4, 5], 1)));
    mat.subset(math.index([6, 7, 8], 1), mat.subset(math.index([3, 4, 5], 2)));
    mat.subset(math.index([6, 7, 8], 2), mat.subset(math.index([3, 4, 5], 0)));

    // Bottom-right
    mat.subset(math.index([6, 7, 8], 6), mat.subset(math.index([3, 4, 5], 7)));
    mat.subset(math.index([6, 7, 8], 7), mat.subset(math.index([3, 4, 5], 8)));
    mat.subset(math.index([6, 7, 8], 8), mat.subset(math.index([3, 4, 5], 6)));
}

/**
 * 
 * @param {math.Matrix} mat 
 */
export function hide(mat) {
    for (let i = 0; i < 40; i++) {
        let col = Math.round(Math.random() * 8);
        let row = Math.round(Math.random() * 8);
        mat.set([row, col], 0);
    }
}