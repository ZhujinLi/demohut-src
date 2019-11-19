
/* global Chart */

export function showDemoGolden() {
    let lineChart;
    const N = 15;

    init();
    document.getElementById("button-regenerate-golden").onclick = regenerateData;

    regenerateData();

    function init() {
        const labels = new Array(N);
        for (let i = 1; i <= N; i++)
            labels[i - 1] = i;

        lineChart = new Chart("plot-golden", {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '数列项',
                    yAxisID: 'A',
                    borderColor: '#0072BD',
                    fill: false
                }, {
                    label: '相邻项比值',
                    yAxisID: 'B',
                    borderColor: '#D95319',
                    fill: false
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                    }, {
                        id: 'B',
                        type: 'linear',
                        position: 'right'
                    }]
                }
            }
        });
    }

    function regenerateData() {
        const sequence = new Array(N);
        sequence[0] = Math.round(Math.random() * 10) + 1;
        sequence[1] = Math.round(Math.random() * 10) + 1;
        for (let i = 2; i < N; i++)
            sequence[i] = sequence[i - 1] + sequence[i - 2];

        const ratios = new Array(N);
        ratios[0] = null;
        for (let i = 1; i < N; i++)
            ratios[i] = sequence[i] / sequence[i - 1];

        lineChart.data.datasets[0].data = sequence;
        lineChart.data.datasets[1].data = ratios;
        lineChart.update();
    }
}