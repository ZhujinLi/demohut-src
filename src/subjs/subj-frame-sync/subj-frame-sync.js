import 'chart.js';
import { motion } from "./motion.js";

function showNormal() {
    motion('#view-normal', (frameCount) => {
        return {
            ratio: frameCount / 60,
            lastRatio: frameCount / 60,
            tearing: 0
        };
    });
}
showNormal();

function showVSync() {
    const RENDER_DURATION_MS = 10.5;
    const SWAP_DURATION_MS = 1.6;
    const FPS = 1000 / RENDER_DURATION_MS;

    const renderRecords = [];
    for (let i = 0; i < FPS; i++) {
        const from = i / FPS;
        const to = (i + 1) / FPS;
        renderRecords.push({ x: from * 60, y: from });
        renderRecords.push({ x: to * 60, y: from });
        renderRecords.push(NaN);
    }

    const tearings = [];
    for (let i = 0; i < 60; i++) {
        tearings[i] = 0;
    }

    const swapRecords = [];
    for (let i = 0; i < FPS; i++) {
        const from = i / FPS + RENDER_DURATION_MS / 1000;
        const to = from + SWAP_DURATION_MS / 1000;
        swapRecords.push({ x: from * 60, y: i / FPS });
        swapRecords.push({ x: to * 60, y: i / FPS });
        swapRecords.push(NaN);

        const prevFrame = Math.floor(from * 60);
        const curFrame = Math.floor(to * 60);
        if (prevFrame != curFrame) {
            tearings[curFrame] = ((curFrame / 60 - from) / (to - from));
        }
    }

    const tearingRecords = [];
    for (let i = 0; i < 60; i++) {
        if (tearings[i] != 0) {
            tearingRecords.push({ x: i, y: 0 });
            tearingRecords.push({ x: i, y: 1 });
            tearingRecords.push(NaN);
        }
    }

    new Chart("plot-v-sync", {
        type: 'line',
        data: {
            datasets: [
                { data: renderRecords, fill: false, pointRadius: 0, borderWidth: 1, borderColor: 'blue', label: 'render' },
                { data: swapRecords, fill: false, pointRadius: 0, borderWidth: 1, borderColor: 'red', label: 'swap' },
                { data: tearingRecords, fill: false, pointRadius: 0, borderWidth: 1, borderColor: 'green', label: 'tearing' }
            ]
        },
        options: {
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        min: 0,
                        max: 1,
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'position'
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                        min: 0,
                        max: 60,
                        stepSize: 1,
                        autoSkip: false,
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'time'
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            legend: {
                display: true
            }
        }
    });

    motion('#view-v-sync', (frameCount) => {
        let info = {};
        const curRenderCycle = Math.floor(frameCount / 60 * 1000 / RENDER_DURATION_MS);
        info.ratio = curRenderCycle / FPS;
        info.lastRatio = (curRenderCycle - 1) / FPS;
        info.tearing = tearings[frameCount];
        return info;
    });
}
showVSync();

function showTimerSync() {
    const FPS = 100;

    const timerRecords = [];
    for (let i = 0; i < FPS; i++) {
        timerRecords.push({ x: i / FPS * 60, y: i / FPS });
    }

    const renderRecords = [];
    for (let i = 0; i < 60; i++) {
        const renderCycle = Math.floor(i / 60 * FPS);
        renderRecords.push({ x: i, y: renderCycle / FPS });
    }

    new Chart("plot-timer-sync", {
        type: 'line',
        data: {
            datasets: [
                { data: timerRecords, fill: false, pointRadius: 1, borderWidth: 1, borderColor: 'blue', label: 'timer' },
                { data: renderRecords, fill: false, pointRadius: 1, borderWidth: 1, borderColor: 'red', label: 'render' }
            ]
        },
        options: {
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        min: 0,
                        max: 1,
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'position'
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                        min: 0,
                        max: 60,
                        stepSize: 1,
                        autoSkip: false,
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'time'
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            legend: {
                display: true
            }
        }
    });

    motion('#view-timer-sync', (frameCount) => {
        let info = {};
        const curRenderCycle = Math.floor(frameCount / 60 * FPS);
        info.ratio = curRenderCycle / FPS;
        info.lastRatio = info.ratio;
        info.tearing = 0;
        return info;
    });
}
showTimerSync();