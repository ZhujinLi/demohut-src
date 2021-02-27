import 'two.js/build/two';
import { mwt } from './mwt';
import { random } from './random';

const W = 800;
const H = 400;

const two = new Two({
    fullscreen: false,
    width: W,
    height: H,
});
two.appendTo(document.getElementById('div-main'));

let mode = 'show';

let contour = [
    [50, 200],
    [100, 200],
    [400, 100],
    [600, 90],
    [700, 110],
    [700, 200],
    [400, 210],
    [150, 300],
    [20, 300],
];

const twoObjects = {
    points: [],
    lines: [],
};

// Init
for (let i = 0; i < contour.length; i++) {
    const point = two.makeCircle(contour[i][0], contour[i][1], 3);
    point.fill = '#000';
    twoObjects.points.push(point);
}
showResult(mwt(contour));

document.getElementById('div-main').onpointerup = (e) => {
    if (mode != 'edit') {
        return;
    }

    contour.push([e.offsetX, e.offsetY]);

    const point = two.makeCircle(e.offsetX, e.offsetY, 3);
    point.fill = '#000';
    twoObjects.points.push(point);
};

document.getElementById('btn-new-shape').onclick = () => {
    mode = 'edit';
    contour = [];
    twoObjects.points = [];
    twoObjects.lines = [];
    two.clear();

    document.getElementById('label-weight').innerText = ' ';
};

document.getElementById('btn-mwt').onclick = () => {
    mode = 'show';
    showResult(mwt(contour));
};

document.getElementById('btn-random').onclick = () => {
    mode = 'show';
    showResult(random(contour));
};

two.play();

//

function showResult(result) {
    two.remove(twoObjects.lines);
    twoObjects.lines = [];

    for (let e of result.edges) {
        const line = two.makeLine(e[0], e[1], e[2], e[3]);
        line.stroke = '#ff8000';
        twoObjects.lines.push(line);
    }

    document.getElementById('label-weight').innerText = '-> Weight = ' + result.weight;
}