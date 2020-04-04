
export function formatFileSize(size) {
    return size + " (" + fileSizeIEC(size) + ")";
}

export function fileSizeIEC(a, b, c, d, e) {
    return (b = Math, c = b.log, d = 1024, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2)
        + ' ' + (e ? 'KMGTPEZY'[--e] + 'iB' : 'Bytes')
}

export function sortCodeMap(codeMap) {
    let codeList = [];
    for (let [k, v] of codeMap) {
        codeList.push([k, v]);
    }

    codeList.sort((a, b) => a[1].length > b[1].length ? 1 : a[1].length < b[1].length ? -1 : a[1] > b[1] ? 1 : 0);
    return codeList;
}

export function verify(arrayBufferA, arrayBufferB) {
    if (arrayBufferA.byteLength != arrayBufferB.byteLength) {
        return "Failed: byte length not equal";
    }

    let arrayA = new Uint8Array(arrayBufferA);
    let arrayB = new Uint8Array(arrayBufferB);
    for (let i = 0; i < arrayBufferA.byteLength; i++) {
        if (arrayA[i] != arrayB[i]) {
            return "Failed: at byte position " + i;
        }
    }
    return "Passed";
}

export function downloadBlob(data, fileName) {
    let blob, url;
    blob = new Blob([data], {
        type: "application/octet-stream"
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function () {
        return window.URL.revokeObjectURL(url);
    });
}

function downloadURL(data, fileName) {
    let a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
}