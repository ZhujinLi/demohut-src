// Make sure these constants match the C code
const MINBYTES = 1 << 14;   /* First working set size */
const MAXBYTES = 1 << 27;   /* Last working set size */
const MAXSTRIDE = 15;       /* Stride x8 bytes */

const SAMPLE_COUNT = (Math.log2(MAXBYTES / MINBYTES) + 1) * MAXSTRIDE;

console.time("Evaluation");

let iSample = 0;
for (let size = MAXBYTES; size >= MINBYTES; size /= 2) {
    const label = size > (1 << 20) ? (size / (1 << 20)) + "m" : (size / 1024) + "k";
    let row = label;
    for (let stride = 1; stride <= MAXSTRIDE; stride++) {
        const mbps = Module.ccall('run', 'number', ['number', 'number'], [size, stride]);
        row += "\t" + mbps;
        iSample++;
    }
    console.log(row);
}

console.timeEnd("Evaluation");