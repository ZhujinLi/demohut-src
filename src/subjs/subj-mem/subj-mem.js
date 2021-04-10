let mbpsSamples = [];

const plotdata = [{
    y: ["128m", "64m", "32m", "16m", "8m", "4m", "2m", "1024k", "512k", "256k", "128k", "64k", "32k", "16k"],
    z: mbpsSamples,
    type: 'surface'
}];

const layout = {
    autosize: false,
    width: 800,
    height: 600,
    scene: {
        xaxis: { title: 'stride', },
        yaxis: { title: 'size', },
        zaxis: { title: 'MB/s', },
        camera: {
            eye: { x: 1.5, y: -1.5, z: 1.5, },
        }
    },
    margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    showlegend: false,
};
Plotly.newPlot('plot', plotdata, layout);

const worker = new Worker('./core.worker.js');
worker.onmessage = ({ data: { row } }) => {
    mbpsSamples.push(row);
    Plotly.redraw('plot');
};
