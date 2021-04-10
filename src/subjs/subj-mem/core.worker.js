const MINBYTES = 1 << 14;   /* First working set size */
const MAXBYTES = 1 << 27;   /* Last working set size */
const MAXSTRIDE = 15;       /* Stride x8 bytes */

// Note that the original C implementation uses data type long which is 64-bit on 64-bit Linux.
// Since JavaScript represents numbers in double, I'll go with it.
const data = new Float64Array(new ArrayBuffer(MAXBYTES));
for (let i = 0; i < data.length; i++) {
    data[i] = i;
}

function test(elems, stride) {
    let acc0 = 0;
    for (let i = 0; i < elems; i += stride) {
        acc0 = data[i];
    }
    return acc0;
}

function run(size, stride) {
    let elems = size / 8;

    // Due to browsers' limit on time resolution, I have no option but to repeat lots of times.
    let repeat = MAXBYTES / size * stride;

    // Since it is repeated, warming up is not needed

    let time = Infinity;
    for (let i = 0; i < 3; i++) {
        const beg = performance.now();
        for (let r = 0; r < repeat; r++)
            test(elems, stride, 1);
        const end = performance.now();

        time = Math.min(time, (end - beg) / 1000.0);
    }

    return { mbps: (size / stride * repeat / (1 << 20)) / time, time };
}

for (let size = MAXBYTES; size >= MINBYTES; size /= 2) {
    const label = size > (1 << 20) ? (size / (1 << 20)) + "m" : (size / 1024) + "k";
    let log = label;
    let row = [];
    for (let stride = 1; stride <= MAXSTRIDE; stride++) {
        const res = run(size, stride);
        log += "\t" + res.mbps.toFixed(0) + "(" + res.time.toFixed(4) + ")";
        row.push(res.mbps);
    }
    console.log(log);
    self.postMessage({
        row: row
    });
}
