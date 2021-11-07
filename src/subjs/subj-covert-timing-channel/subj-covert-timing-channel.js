// Use a dedicated thread because it's kind of time consuming.
const worker = new Worker('./hack.worker.js');

document.getElementById("button-hack").onclick = () => {
    const actualPw = document.getElementById("input-pw").value;
    worker.postMessage({ actualPw: actualPw });
};

worker.onmessage = ({ data: { log } }) => {
    if (log == null) {
        document.getElementById("log").innerText = "";
    } else {
        document.getElementById("log").innerText += log + "\n";
    }
};