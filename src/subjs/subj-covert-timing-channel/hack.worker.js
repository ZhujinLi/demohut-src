const MIN_LEN = 3;
const MAX_LEN = 16;
const DICT = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * This is the vulnerable function we are going to attack!
 * @param {string} actualPw 
 * @param {string} typedPw 
 */
function validatePassword(actualPw, typedPw) {
    if (actualPw.length != typedPw.length) {
        return false;
    }

    for (let i = 0; i < actualPw.length; i++) {
        if (actualPw[i] != typedPw[i]) {
            return false;
        }
    }

    return true;
}

function measureTime(actualPw, guessedPw) {
    const t0 = performance.now();
    for (let i = 0; i < 1000000; i++) {
        validatePassword(actualPw, guessedPw);
    }
    const t1 = performance.now();
    return t1 - t0;
}

self.onmessage = ({ data: { actualPw } }) => {
    self.postMessage({ log: null });

    if (actualPw.length < MIN_LEN || actualPw.length > MAX_LEN) {
        self.postMessage({ log: "Requiring length to be between " + MIN_LEN + " and " + MAX_LEN });
        return;
    }

    for (let c of actualPw) {
        if (!DICT.includes(c)) {
            self.postMessage({ log: "Accepting these characters only: " + DICT });
            return;
        }
    }

    self.postMessage({ log: "First, try to guess the length..." });

    let lengthMaxLikelihood = { length: MIN_LEN, time: 0 };
    for (let len = MIN_LEN; len <= MAX_LEN; len++) {
        const guessedPw = "x".repeat(len);
        const time = measureTime(actualPw, guessedPw);
        if (time > lengthMaxLikelihood.time) {
            lengthMaxLikelihood.length = len;
            lengthMaxLikelihood.time = time;
        }
        self.postMessage({ log: "Trying length " + len + ", time elapsed: " + time.toFixed(2) });
    }

    self.postMessage({ log: "The length is most likely to be " + lengthMaxLikelihood.length });

    self.postMessage({ log: "Next, try to determine characters one by one..." });

    let pw = "";
    for (let i = 0; i < lengthMaxLikelihood.length - 1; i++) {
        let char = " ";
        // Improve the reliability: accept the char only if two successive runs give the same result
        while (true) {
            let charMaxLikelihood = { char: "x", time: 0 };
            for (let j in DICT) {
                let time = measureTime(actualPw, pw + DICT[j] + "x".repeat(lengthMaxLikelihood.length - i - 1));
                if (time > charMaxLikelihood.time) {
                    charMaxLikelihood.char = DICT[j];
                    charMaxLikelihood.time = time;
                }
            }
            if (char == charMaxLikelihood.char) {
                break;
            }
            char = charMaxLikelihood.char;
        }
        pw += char;
        self.postMessage({ log: "Most likely character for position " + i + ": " + char });
    }

    // The last character is hard to guess because there are no further memory access
    // and the times are not so distinguishable, but we don't need timing channel anymore.
    for (let c of DICT) {
        if (validatePassword(actualPw, pw + c)) {
            pw += c;
            self.postMessage({ log: "The last character: " + c });
            break;
        }
    }

    self.postMessage({ log: "Final guess: " + pw });;
};
