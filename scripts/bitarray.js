/*
 * Loosely based on: https://github.com/kig/bitview.js
 */

// base64url characters 
const ENCODING_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');

// length in bits
EncodableBitArray = function(length) {
    let byteLength = Math.ceil(length / 8);

    this.length = length;
    this.buffer = new ArrayBuffer(byteLength);
    this.u8 = new Uint8Array(this.buffer);
  };

EncodableBitArray.prototype.getLength = function() {
    return this.length;
}

EncodableBitArray.prototype.getBit = function(idx) {
    if (idx > this.length) {
        return 0;
    }
    let byte = this.u8[idx >>> 3];
    let mask = 0x80 >>> (idx & 0x7);
    return byte & mask ? 1 : 0;
}

EncodableBitArray.prototype.setBit = function(idx, val) {
    let mask = 0x80 >>> (idx & 0x7);
    if (val) {
        this.u8[idx >>> 3] |= mask;
    } else {
        mask ^= 0x7;
        this.u8[idx >>> 3] &= mask;
    }
}

EncodableBitArray.prototype.toBinaryString = function() {
    let str = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
        str[i] = this.getBit(i);
    }
    return str.join('');
}

EncodableBitArray.prototype.toBase64 = function() {
    // let strLen = Math.ceil(this.length / 6);
    // let str = [];

    // // To make it easier to follow the logic, process u8 in chunks of 3 bytes each. 3 bytes = 24 bits = 4 base64 characters
    // for (let i = 0; i < this.u8.byteLength; i += 3) {
    //     let chunk = this.u8[i] << 16;
    //     if (i+1 < this.u8.byteLength) {
    //         chunk |= this.u8[i+1] << 8;
    //     }
    //     if (i+2 < this.u8.byteLength) {
    //         chunk |= this.u8[i+2];
    //     }

    //     // Read 4 6-bit characters out of the 24-bit chunk
    //     for (let off = 18; off >= 0 && str.length < strLen; off -= 6) {
    //         let charBits = (chunk & (0b111111 << off)) >>> off;
    //         str.push(ENCODING_CHARS[charBits]);
    //     }
    // }

    // return str.join('');

    let strLen = Math.ceil(this.length / 6);
    let str = [];
    for (let charIdx = 0; charIdx < strLen; charIdx++) {
        let charBits = 0;
        for (const offset of Array(6).keys()) {
            let bit = this.getBit(charIdx * 6 + offset);
            charBits |= bit << (5-offset);
        }
        str.push(ENCODING_CHARS[charBits]);
    }
    return str.join('')
}

function bitArrayFromBase64(str) {
    let charToBits = function(c) {
        for (let i = 0; i < ENCODING_CHARS.length; i++) {
            if (c == ENCODING_CHARS[i]) {
                return i;
            }
        }
        throw "Not a base64url character: " + c;
    };
    let chars = str.split('');
    let bitArray = new EncodableBitArray(chars.length * 6);
    for (let c = 0; c < chars.length; c++) {
        let charBits = charToBits(chars[c]);
        for (let offset = 5; offset >= 0; offset--) {
            if (charBits & (1 << offset)) {
                bitArray.setBit(c * 6 + (5-offset), 1);
            }
        }
    }
    return bitArray;
}
