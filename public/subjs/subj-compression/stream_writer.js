
export class StreamWriter {
    constructor(arrayBuffer) {
        this._uint8Array = new Uint8Array(arrayBuffer);
        this._sizeInBits = 0;
    }

    sizeInBits() {
        return this._sizeInBits;
    }

    sizeInBytes() {
        return (this._sizeInBits + 7) >>> 3;
    }

    seek(sizeInBits) {
        this._sizeInBits = sizeInBits;
    }

    writeBit(bit) {
        this._uint8Array[this._sizeInBits >>> 3] <<= 1;
        this._uint8Array[this._sizeInBits >>> 3] |= bit;
        this._sizeInBits++;
    }

    writeUint8(v) {
        this.padIfNeeded();
        this._uint8Array[this._sizeInBits >>> 3] = v;
        this._sizeInBits += 8;
    }

    writeUint32(v) {
        for (let i = 0; i < 4; i++) {
            this.writeUint8(v & 0xff);
            v >>>= 8;
        }
    }

    // For the convenience of reader
    padIfNeeded() {
        let currentBitLength = this._sizeInBits & 7;
        if (currentBitLength > 0 && currentBitLength < 8) {
            this._uint8Array[this._sizeInBits >>> 3] <<= 8 - currentBitLength;
        }
        this._sizeInBits = (this._sizeInBits + 7) & (~7);   // Align
    }
}