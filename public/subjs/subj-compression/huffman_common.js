
/**
 * ----Binary format----
 * File
 * {
 *   magicNumber: uint32,
 * 
 *   originalSizeInBytes: uint32,
 * 
 *   codeBookSize: uint8,   // The actual size is: (this number + 1).
 *                          // If the original file is empty, compressed file would be empty too.
 *   codes: Code[codeBookSize+1],
 * 
 *   dataSizeInBits: uint32,
 *   data: uint8[ceil(dataSizeInBits/8)]
 * }
 * 
 * Code
 * {
 *   datum: uint8,
 *   bitLength: uint8,  // The actual length is: (this number + 1)
 *   encoded: uint8[ceil((bitLength+1) / 8)]
 * }
 */

export function magicNumber() {
    let string = "HfMN";
    let number = 0;
    for (let c of string) {
        number = (number << 8) | c.charCodeAt(0);
    }
    return number;
}