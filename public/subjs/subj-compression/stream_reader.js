export class StreamReader {
    constructor(arrayBuffer) {
        this._uint8Array = new Uint8Array(arrayBuffer);
        this._sizeInBits = 0;
        this._readingByte = 0;
    }

    readBit() {
        if ((this._sizeInBits & 7) == 0) {
            this._readingByte = this._uint8Array[this._sizeInBits >>> 3];
        }

        let ret = this._readingByte >>> 7;
        this._readingByte = (this._readingByte << 1) & 0xff;
        this._sizeInBits++;
        return ret;
    }

    readUint8() {
        this._sizeInBits = (this._sizeInBits + 7) & (~7);   // Align
        let ret = this._uint8Array[this._sizeInBits >>> 3];
        this._sizeInBits += 8;
        return ret;
    }

    readUint32() {
        let res = 0;
        for (let i = 0; i < 4; i++) {
            res = res >>> 8 | (this.readUint8() << 24);
        }
        return res;
    }
}