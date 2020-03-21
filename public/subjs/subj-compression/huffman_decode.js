
import { StreamReader } from "./stream_reader.js";
import { magicNumber } from "./huffman_common.js";
import { StreamWriter } from "./stream_writer.js";

export function decodeHuffman(srcArrayBuffer) {
    let reader = new StreamReader(srcArrayBuffer);
    if (reader.readUint32() != magicNumber()) {
        alert("Unrecognized file format!");
        return;
    }

    let decodedByteLength = reader.readUint32();
    let dstArrayBuffer = new ArrayBuffer(decodedByteLength);
    let writer = new StreamWriter(dstArrayBuffer);

    let decodeBook = new Map();
    let codeBookSize = reader.readUint8() + 1;
    for (let i = 0; i < codeBookSize; i++) {
        let ascii = reader.readUint8();
        let bitLength = reader.readUint8() + 1;
        let code = "";
        for (let j = 0; j < bitLength; j++) {
            code += reader.readBit();
        }
        decodeBook.set(code, ascii);
    }

    let contentBitLength = reader.readUint32();
    let codeBuffer = "";
    for (let i = 0; i < contentBitLength; i++) {
        codeBuffer += reader.readBit();
        let ascii = decodeBook.get(codeBuffer);
        if (ascii != undefined) {
            writer.writeUint8(ascii);
            codeBuffer = "";
        }
    }

    return { data: dstArrayBuffer };
}