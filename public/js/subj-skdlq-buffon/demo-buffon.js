
export function showDemoBuffon() {
    let totalCount = 0;
    let intersectCount = 0;
    let isRunning = false;

    const btn = document.getElementById('button-buffon');
    updateBtnText();
    updateResult();

    btn.onclick = () => {
        isRunning = !isRunning;
        updateBtnText();
    }

    setInterval(tossIfNeeded, 100);

    function tossIfNeeded() {
        if (isRunning) {
            let step = calcStep();
            for (let i = 0; i < step; i++) {
                totalCount++;
                const x = Math.random() / 2;
                const angle = Math.random() * Math.PI / 2;
                if (Math.cos(angle) > 2 * x) {
                    intersectCount++;
                }
            }

            updateResult();
        }
    }

    function calcStep() {
        if (totalCount < 10) {
            return 1;
        } else if (totalCount < 100) {
            return 10;
        } else if (totalCount < 1000) {
            return 100;
        } else if (totalCount < 10000) {
            return 1000;
        } else if (totalCount < 100000) {
            return 10000;
        } else if (totalCount < 1000000) {
            return 100000;
        } else {
            return 1000000;
        }
    }

    function updateResult() {
        document.getElementById('li-buffon-total-count').textContent = '投针次数：' + totalCount;
        document.getElementById('li-buffon-intersect-count').textContent = '相交次数：' + intersectCount;
        document.getElementById('li-buffon-pi').textContent = '2/相交次数*投针次数：' + 2 / intersectCount * totalCount;
    }

    function updateBtnText() {
        btn.textContent = isRunning ? "暂停" : "给我投";
    }

}