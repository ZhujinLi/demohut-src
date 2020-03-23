
import { StreamWriter } from "./stream_writer.js";
import { magicNumber } from "./huffman_common.js";

export function encodeHuffman(srcArrayBuffer) {
    let data = new Uint8Array(srcArrayBuffer);
    let hist = calcHist(data);

    let nodes = initNodes(hist);
    let root = makeTree(nodes);

    let codeMap = new Map();
    generateCodeMap(root, codeMap, "");

    // Upper limits
    let estimatedHeaderSize = 1 + codeMap.size * (1 + 1 + 8);
    let estimatedContentSize = _estimateContentSize(hist, codeMap);

    let dstArrayBuffer = new ArrayBuffer(estimatedHeaderSize + estimatedContentSize);
    let writer = new StreamWriter(dstArrayBuffer);

    // Write magic number
    writer.writeUint32(magicNumber());

    // Write original size
    writer.writeUint32(srcArrayBuffer.byteLength);

    // Write codebook
    writer.writeUint8(codeMap.size - 1);
    for (let [ascii, code] of codeMap) {
        writer.writeUint8(ascii);
        writer.writeUint8(code.length - 1);
        _writeCodeAsBinary(code, writer);
    }

    // Reserve size position
    writer.padIfNeeded();
    let reservedPos = writer.sizeInBits();
    writer.writeUint32(0);  // We don't know the size yet

    // Write content
    let sizeInBitsBeforeContent = writer.sizeInBits();
    for (let byte of data) {
        _writeCodeAsBinary(codeMap.get(byte), writer);
    }
    let sizeInBitsAfterContent = writer.sizeInBits();
    let sizeInBytesAfterContent = writer.sizeInBytes();

    // Add padding
    writer.padIfNeeded();

    // Write size back
    writer.seek(reservedPos);
    writer.writeUint32(sizeInBitsAfterContent - sizeInBitsBeforeContent);

    dstArrayBuffer = shrinkArrayBuffer(dstArrayBuffer, sizeInBytesAfterContent);

    return { hist: hist, codeMap: codeMap, data: dstArrayBuffer };
}

function calcHist(data) {
    let hist = new Array(256);
    for (let i = 0; i < 256; i++) {
        hist[i] = 0;
    }

    for (let byte of data) {
        hist[byte]++;
    }

    return hist;
}

function initNodes(hist) {
    let nodes = [];
    for (let i = 0; i < 256; i++) {
        if (hist[i]) {
            nodes.push({ ascii: i, freq: hist[i] });
        }
    }
    return nodes;
}

function makeTree(nodes) {
    if (nodes.length == 1) {
        return { left: nodes[0] };
    }

    while (nodes.length > 1) {
        // For each round, merge the two nodes with lowest frequencies.
        // This can be further optimized using priority queue (heap).
        // Interestingly, the huffman tree is also a heap.
        let nodeA = removeMinFreq(nodes);
        let nodeB = removeMinFreq(nodes);
        let newNode = { freq: nodeA.freq + nodeB.freq, left: nodeA, right: nodeB };
        nodes.push(newNode);
    }
    return nodes[0];
}

function removeMinFreq(nodes) {
    let minPos = 0;
    for (let i = 1; i < nodes.length; i++) {
        if (nodes[i].freq < nodes[minPos].freq) {
            minPos = i;
        }
    }
    return nodes.splice(minPos, 1)[0];
}

function generateCodeMap(root, codeMap, code) {
    if (root.ascii != undefined) {
        codeMap.set(root.ascii, code);
    } else {
        if (root.left) {
            generateCodeMap(root.left, codeMap, code + "0");
        }
        if (root.right) {
            generateCodeMap(root.right, codeMap, code + "1");
        }
    }
}

function _estimateContentSize(hist, codeMap) {
    let sizeInBits = 0;
    for (let [k, v] of codeMap) {
        sizeInBits += hist[k] * v.length;
    }
    return Math.ceil(sizeInBits / 8
        * 1.2); // Safer to expand 20% for there may be precision error or something
}

function _writeCodeAsBinary(code, writer) {
    for (let c of code) {
        writer.writeBit(c - '0');
    }
}

function shrinkArrayBuffer(arrayBuffer, byteLength) {
    let array = new Uint8Array(arrayBuffer);

    let newArrayBuffer = new ArrayBuffer(byteLength);
    let newArray = new Uint8Array(newArrayBuffer);

    for (let i = 0; i < byteLength; i++) {
        newArray[i] = array[i];
    }

    return newArrayBuffer;
}