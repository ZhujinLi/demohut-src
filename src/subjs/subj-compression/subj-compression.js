import { encodeHuffman } from "./huffman_encode.js";
import { sortCodeMap, formatFileSize, verify, downloadBlob } from "./util.js";
import { asciiSymbolList } from "./ascii.js";
import { decodeHuffman } from "./huffman_decode.js";
import 'chart.js';

let histChart = new Chart("chart-hist", {
    type: 'bar',
    data: {
        labels: asciiSymbolList,
        datasets: [{
            backgroundColor: '#000000'
        }]
    },
    options: {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                ticks: { autoSkip: false, source: 'data' }
            }]
        }
    }
});

document.getElementById("input-file").onchange = (e) => {
    document.getElementById("info").style.display = "none";

    let f = e.target.files[0];
    if (!f || f.size == 0) {
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        let arrayBuffer = e.target.result;

        let timeBeforeEncoding = new Date();
        let encoded = encodeHuffman(arrayBuffer);
        let timeAfterEncoding = new Date();

        let timeBeforeDecoding = new Date();
        let decoded = decodeHuffman(encoded.data);
        let timeAfterDecoding = new Date();

        // Show results
        document.getElementById("info").style.display = "initial";

        // Download encoded file
        downloadBlob(encoded.data, f.name + ".compressed");

        // Histogram
        histChart.data.datasets[0].data = encoded.hist;
        histChart.update();

        // Codes
        let codeList = sortCodeMap(encoded.codeMap);
        let table = document.getElementById("table-codes");
        table.innerHTML = "";
        for (let i = 0; i < codeList.length; i++) {
            let row = table.insertRow();
            let ascii = codeList[i][0];
            let code = codeList[i][1];
            row.insertCell().appendChild(document.createTextNode(i));
            row.insertCell().appendChild(document.createTextNode(asciiSymbolList[ascii]));
            row.insertCell().appendChild(document.createTextNode(code));
        }

        // Original size
        document.getElementById("text-orig-size").innerText = formatFileSize(arrayBuffer.byteLength);

        // Compressed size
        document.getElementById("text-comp-size").innerText = formatFileSize(encoded.data.byteLength);

        // Compression ratio
        let compRatio = f.size / encoded.data.byteLength;
        document.getElementById("text-comp-ratio").innerText = compRatio.toFixed(2);

        // Compression time
        document.getElementById("text-comp-time").innerText = (timeAfterEncoding - timeBeforeEncoding) + " ms";

        // Decompression time
        document.getElementById("text-decomp-time").innerText = (timeAfterDecoding - timeBeforeDecoding) + " ms";

        // Verification
        document.getElementById("text-verify").innerText = verify(arrayBuffer, decoded.data);
    }

    reader.readAsArrayBuffer(f);
};

document.getElementById("input-file-decomp").onchange = (e) => {
    let f = e.target.files[0];
    if (!f || f.size == 0) {
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        let arrayBuffer = e.target.result;
        let decoded = decodeHuffman(arrayBuffer);
        if (decoded) {
            downloadBlob(decoded.data, f.name + ".decompressed");
        }
    };

    reader.readAsArrayBuffer(f);
}