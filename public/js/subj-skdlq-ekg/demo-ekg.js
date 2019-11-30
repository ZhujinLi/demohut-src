/* global Chart */

export function showDemoEkg() {
    let lineChart;
    let count = 0;
    let numberFlags = new Array(1000000);

    init();

    setInterval(update, 100);

    document.getElementById("button-restart-ekg").onclick = reset;

    function init() {
        for (let i = 0; i < numberFlags.length; i++)
            numberFlags[i] = false;

        lineChart = new Chart("plot-ekg", {
            type: 'line',
            data: {
                datasets: [{
                    fill: false,
                    borderColor: '#77AC30',
                    pointRadius: 0
                }]
            },
            options: {
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    }
                },
                legend: {
                    display: false
                }
            }
        });
    }

    function update() {
        if (count >= 50) {
            lineChart.data.datasets[0].data.shift();
            lineChart.data.labels.shift();
        }

        lineChart.data.datasets[0].data.push(nextNumber());
        lineChart.data.labels.push(count);
        lineChart.update();
        count++;
    }

    function nextNumber() {
        if (count < 2) {
            numberFlags[count + 1] = true;
            return count + 1;
        }

        const x = lineChart.data.datasets[0].data[lineChart.data.datasets[0].data.length - 1];
        for (let i = 1; ; i++) {
            if (numberFlags[i] == true)
                continue;

            if (!coprime(i, x)) {
                numberFlags[i] = true;
                return i;
            }
        }
    }

    function coprime(x, y) {
        for (let i = 2; i <= x && i <= y; i++) {
            if (x % i == 0 && y % i == 0) {
                return false;
            }
        }
        return true;
    }

    function reset() {
        count = 0;

        for (let i = 0; i < numberFlags.length; i++)
            numberFlags[i] = false;

        lineChart.data.datasets[0].data = [];
        lineChart.data.labels = [];
    }
}