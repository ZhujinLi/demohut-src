import * as PIXI from 'pixi.js';

const BORDER_COLOR = 0x808080;

export function createLine(x0, y0, x1, y1) {
    let line = new PIXI.Graphics();
    line.lineStyle(1, BORDER_COLOR);
    line.moveTo(x0, y0);
    line.lineTo(x1, y1);
    return line;
}

export function createPiece(x, y, radius, isWhite) {
    let piece = new PIXI.Graphics();
    piece.beginFill(isWhite ? 0xffffff : 0x000000);
    piece.drawCircle(0, 0, radius);
    piece.endFill();
    piece.position.set(x, y);

    return piece;
}

export function createSrcCircle(x, y, radius) {
    let circle = new PIXI.Graphics();
    circle.lineStyle(3, 0xff0000, 1);
    circle.beginFill(0, 0);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.position.set(x, y);

    return circle;
}

export function createDstCircle(x, y, radius) {
    let circle = new PIXI.Graphics();
    circle.lineStyle(3, 0x0000ff, 1);
    circle.beginFill(0, 0);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.position.set(x, y);

    return circle;
}

export function createNextCircle(x, y, radius) {
    let circle = new PIXI.Graphics();
    circle.lineStyle(3, 0xffff00, 1);
    circle.beginFill(0, 0);
    circle.drawCircle(0, 0, radius);
    circle.endFill();
    circle.position.set(x, y);

    return circle;
}

export function createOpenMark(x, y, radius) {
    let mark = new PIXI.Graphics();
    mark.beginFill(0x00ff00, 0.3);
    mark.drawRect(x - radius, y - radius, radius * 2, radius * 2);
    mark.endFill();

    return mark;
}

export function createCloseMark(x, y, radius) {
    let mark = new PIXI.Graphics();
    mark.beginFill(0x0000ff, 0.2);
    mark.drawRect(x - radius, y - radius, radius * 2, radius * 2);
    mark.endFill();

    return mark;
}

export function createGridInfo(x, y, radius, f, g, h) {
    let fontSize = 12;
    let textStyle = new PIXI.TextStyle({
        fontSize: fontSize,
        fill: "0x000000",
    });

    let container = new PIXI.Container();

    let fText = new PIXI.Text(f, textStyle);
    fText.position.set(x - radius, y - radius);
    container.addChild(fText);

    let gText = new PIXI.Text(g, textStyle);
    gText.position.set(x - radius, y + radius - fontSize);
    container.addChild(gText);

    let hText = new PIXI.Text(h, textStyle);
    hText.position.set(x + radius - fontSize, y + radius - fontSize);
    container.addChild(hText);

    return container;
}

export function createArrow(grid, x, y, radius) {
    let angle;
    if (grid.prev.i < grid.i) angle = 90;
    else if (grid.prev.i > grid.i) angle = 270;
    else if (grid.prev.j < grid.j) angle = 180;
    else angle = 0;

    let triangle = new PIXI.Graphics();
    triangle.beginFill(0x666666, 0.3);

    triangle.drawPolygon([
        0, -radius,
        -radius, radius,
        radius, radius,
    ]);

    triangle.angle = angle;

    triangle.endFill();

    //The triangle's x/y position is anchored to its first point in the path
    triangle.x = x;
    triangle.y = y;

    return triangle;
}

/**
 * 
 * @param {Array} tracePos 
 */
export function createTrace(tracePos) {
    let line = new PIXI.Graphics();
    line.lineStyle(3, 0xFFC500, 1);
    for (let i = 0; i < tracePos.length - 1; i++) {
        line.moveTo(tracePos[i].x, tracePos[i].y);
        line.lineTo(tracePos[i + 1].x, tracePos[i + 1].y);
    }
    return line;
}

export function createLegend(x, gridDim) {
    let container = new PIXI.Container();

    const GAP = 10;

    x = x + GAP;
    let y = GAP;

    let border = new PIXI.Graphics();
    border.lineStyle(1, BORDER_COLOR, 1);
    border.beginFill(0, 0);
    border.drawRect(x, y, gridDim, gridDim);
    border.endFill();
    container.addChild(border);

    let fgh = createGridInfo(x + gridDim / 2, y + gridDim / 2, gridDim / 2.3, 'F', 'G', 'H');
    container.addChild(fgh);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Costs"))

    y += gridDim + GAP;

    let arrow = createArrow({ i: 0, j: 0, prev: { i: 0, j: 1 } }, x + gridDim / 2, y + gridDim / 2, gridDim / 3);
    container.addChild(arrow);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Direction"))

    y += gridDim + GAP;

    let open = createOpenMark(x + gridDim / 2, y + gridDim / 2, gridDim / 2);
    container.addChild(open);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Open set"))

    y += gridDim + GAP;

    let close = createCloseMark(x + gridDim / 2, y + gridDim / 2, gridDim / 2);
    container.addChild(close);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Close set"))

    y += gridDim + GAP;

    let startCircle = createSrcCircle(x + gridDim / 2, y + gridDim / 2, gridDim / 2.3);
    container.addChild(startCircle);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Start"))

    y += gridDim + GAP;

    let endCircle = createDstCircle(x + gridDim / 2, y + gridDim / 2, gridDim / 2.3);
    container.addChild(endCircle);

    container.addChild(_createLabel(x + gridDim + GAP, y, "End"))

    y += gridDim + GAP;

    let nextCircle = createNextCircle(x + gridDim / 2, y + gridDim / 2, gridDim / 2.3);
    container.addChild(nextCircle);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Next"))

    y += gridDim + GAP;

    let trace = createTrace([{ x: x, y: y + gridDim / 2 }, { x: x + gridDim, y: y + gridDim / 2 }]);
    container.addChild(trace);

    container.addChild(_createLabel(x + gridDim + GAP, y, "Trace"))

    return container;
}

function _createLabel(x, y, label) {
    let style = new PIXI.TextStyle({ fontSize: 18, fill: 0x000000 });
    let text = new PIXI.Text(label, style);
    text.position.set(x, y);
    return text;
}