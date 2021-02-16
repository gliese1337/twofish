type SessionKey = [sbox: Uint8Array, subkeys: Uint32Array];

// S-boxes
const P0 = new Uint8Array([
  0xA9, 0x67, 0xB3, 0xE8, 0x04, 0xFD, 0xA3, 0x76, 0x9A, 0x92, 0x80, 0x78, 0xE4, 0xDD, 0xD1, 0x38,
  0x0D, 0xC6, 0x35, 0x98, 0x18, 0xF7, 0xEC, 0x6C, 0x43, 0x75, 0x37, 0x26, 0xFA, 0x13, 0x94, 0x48,
  0xF2, 0xD0, 0x8B, 0x30, 0x84, 0x54, 0xDF, 0x23, 0x19, 0x5B, 0x3D, 0x59, 0xF3, 0xAE, 0xA2, 0x82,
  0x63, 0x01, 0x83, 0x2E, 0xD9, 0x51, 0x9B, 0x7C, 0xA6, 0xEB, 0xA5, 0xBE, 0x16, 0x0C, 0xE3, 0x61,
  0xC0, 0x8C, 0x3A, 0xF5, 0x73, 0x2C, 0x25, 0x0B, 0xBB, 0x4E, 0x89, 0x6B, 0x53, 0x6A, 0xB4, 0xF1,
  0xE1, 0xE6, 0xBD, 0x45, 0xE2, 0xF4, 0xB6, 0x66, 0xCC, 0x95, 0x03, 0x56, 0xD4, 0x1C, 0x1E, 0xD7,
  0xFB, 0xC3, 0x8E, 0xB5, 0xE9, 0xCF, 0xBF, 0xBA, 0xEA, 0x77, 0x39, 0xAF, 0x33, 0xC9, 0x62, 0x71,
  0x81, 0x79, 0x09, 0xAD, 0x24, 0xCD, 0xF9, 0xD8, 0xE5, 0xC5, 0xB9, 0x4D, 0x44, 0x08, 0x86, 0xE7,
  0xA1, 0x1D, 0xAA, 0xED, 0x06, 0x70, 0xB2, 0xD2, 0x41, 0x7B, 0xA0, 0x11, 0x31, 0xC2, 0x27, 0x90,
  0x20, 0xF6, 0x60, 0xFF, 0x96, 0x5C, 0xB1, 0xAB, 0x9E, 0x9C, 0x52, 0x1B, 0x5F, 0x93, 0x0A, 0xEF,
  0x91, 0x85, 0x49, 0xEE, 0x2D, 0x4F, 0x8F, 0x3B, 0x47, 0x87, 0x6D, 0x46, 0xD6, 0x3E, 0x69, 0x64,
  0x2A, 0xCE, 0xCB, 0x2F, 0xFC, 0x97, 0x05, 0x7A, 0xAC, 0x7F, 0xD5, 0x1A, 0x4B, 0x0E, 0xA7, 0x5A,
  0x28, 0x14, 0x3F, 0x29, 0x88, 0x3C, 0x4C, 0x02, 0xB8, 0xDA, 0xB0, 0x17, 0x55, 0x1F, 0x8A, 0x7D,
  0x57, 0xC7, 0x8D, 0x74, 0xB7, 0xC4, 0x9F, 0x72, 0x7E, 0x15, 0x22, 0x12, 0x58, 0x07, 0x99, 0x34,
  0x6E, 0x50, 0xDE, 0x68, 0x65, 0xBC, 0xDB, 0xF8, 0xC8, 0xA8, 0x2B, 0x40, 0xDC, 0xFE, 0x32, 0xA4,
  0xCA, 0x10, 0x21, 0xF0, 0xD3, 0x5D, 0x0F, 0x00, 0x6F, 0x9D, 0x36, 0x42, 0x4A, 0x5E, 0xC1, 0xE0,
]);

const P1 = new Uint8Array([
  0x75, 0xF3, 0xC6, 0xF4, 0xDB, 0x7B, 0xFB, 0xC8, 0x4A, 0xD3, 0xE6, 0x6B, 0x45, 0x7D, 0xE8, 0x4B,
  0xD6, 0x32, 0xD8, 0xFD, 0x37, 0x71, 0xF1, 0xE1, 0x30, 0x0F, 0xF8, 0x1B, 0x87, 0xFA, 0x06, 0x3F,
  0x5E, 0xBA, 0xAE, 0x5B, 0x8A, 0x00, 0xBC, 0x9D, 0x6D, 0xC1, 0xB1, 0x0E, 0x80, 0x5D, 0xD2, 0xD5,
  0xA0, 0x84, 0x07, 0x14, 0xB5, 0x90, 0x2C, 0xA3, 0xB2, 0x73, 0x4C, 0x54, 0x92, 0x74, 0x36, 0x51,
  0x38, 0xB0, 0xBD, 0x5A, 0xFC, 0x60, 0x62, 0x96, 0x6C, 0x42, 0xF7, 0x10, 0x7C, 0x28, 0x27, 0x8C,
  0x13, 0x95, 0x9C, 0xC7, 0x24, 0x46, 0x3B, 0x70, 0xCA, 0xE3, 0x85, 0xCB, 0x11, 0xD0, 0x93, 0xB8,
  0xA6, 0x83, 0x20, 0xFF, 0x9F, 0x77, 0xC3, 0xCC, 0x03, 0x6F, 0x08, 0xBF, 0x40, 0xE7, 0x2B, 0xE2,
  0x79, 0x0C, 0xAA, 0x82, 0x41, 0x3A, 0xEA, 0xB9, 0xE4, 0x9A, 0xA4, 0x97, 0x7E, 0xDA, 0x7A, 0x17,
  0x66, 0x94, 0xA1, 0x1D, 0x3D, 0xF0, 0xDE, 0xB3, 0x0B, 0x72, 0xA7, 0x1C, 0xEF, 0xD1, 0x53, 0x3E,
  0x8F, 0x33, 0x26, 0x5F, 0xEC, 0x76, 0x2A, 0x49, 0x81, 0x88, 0xEE, 0x21, 0xC4, 0x1A, 0xEB, 0xD9,
  0xC5, 0x39, 0x99, 0xCD, 0xAD, 0x31, 0x8B, 0x01, 0x18, 0x23, 0xDD, 0x1F, 0x4E, 0x2D, 0xF9, 0x48,
  0x4F, 0xF2, 0x65, 0x8E, 0x78, 0x5C, 0x58, 0x19, 0x8D, 0xE5, 0x98, 0x57, 0x67, 0x7F, 0x05, 0x64,
  0xAF, 0x63, 0xB6, 0xFE, 0xF5, 0xB7, 0x3C, 0xA5, 0xCE, 0xE9, 0x68, 0x44, 0xE0, 0x4D, 0x43, 0x69,
  0x29, 0x2E, 0xAC, 0x15, 0x59, 0xA8, 0x0A, 0x9E, 0x6E, 0x47, 0xDF, 0x34, 0x35, 0x6A, 0xCF, 0xDC,
  0x22, 0xC9, 0xC0, 0x9B, 0x89, 0xD4, 0xED, 0xAB, 0x12, 0xA2, 0x0D, 0x52, 0xBB, 0x02, 0x2F, 0xA9,
  0xD7, 0x61, 0x1E, 0xB4, 0x50, 0x04, 0xF6, 0xC2, 0x16, 0x25, 0x86, 0x56, 0x55, 0x09, 0xBE, 0x91,
]);

const P = [P0, P1];

const BLOCK_SIZE = 16;
const ROUNDS = 16;
const SK_STEP = 0x02020202;
const SK_BUMP = 0x01010101;
const SK_ROTL = 9;

const OUTPUT_WHITEN = BLOCK_SIZE / 4;
const ROUND_SUBKEYS = OUTPUT_WHITEN + BLOCK_SIZE / 4 // 2*(# rounds)

const GF256_FDBK_2 = Math.floor(0x169 / 2);
const GF256_FDBK_4 = Math.floor(0x169 / 4);
const RS_GF_FDBK = 0x14D;

function lfsr1(x) { return x >> 1 ^ ((x & 0x01) !== 0 ? GF256_FDBK_2 : 0); }
function lfsr2(x) { return x >> 2 ^ ((x & 0x02) !== 0 ? GF256_FDBK_2 : 0) ^ ((x & 0x01) !== 0 ? GF256_FDBK_4 : 0); }

function mxX(x) { return x ^ lfsr2(x); }
function mxY(x) { return x ^ lfsr1(x) ^ lfsr2(x); }

function b0(x) { return x & 0xFF; }
function b1(x) { return x >>> 8 & 0xFF; }
function b2(x) { return x >>> 16 & 0xFF; }
function b3(x) { return x >>> 24 & 0xFF; }

const chooseB = [b0, b1, b2, b3];

const [MDS0, MDS1, MDS2, MDS3] = (function() {
  const l0 = new Uint32Array(256);
  const l1 = new Uint32Array(256);
  const l2 = new Uint32Array(256);
  const l3 = new Uint32Array(256);
  const m1 = [0, 0];
  const mX = [0, 0];
  const mY = [0, 0];
  for (let i = 0; i < 256; i++) {
    let j = P0[i] & 0xFF;
    m1[0] = j;
    mX[0] = mxX(j) & 0xFF;
    mY[0] = mxY(j) & 0xFF;

    j = P1[i] & 0xFF;
    m1[1] = j;
    mX[1] = mxX(j) & 0xFF;
    mY[1] = mxY(j) & 0xFF;

    l0[i] = m1[1] | mX[1] << 8 | mY[1] << 16 | mY[1] << 24;
    l1[i] = mY[0] | mY[0] << 8 | mX[0] << 16 | m1[0] << 24;
    l2[i] = mX[1] | mY[1] << 8 | m1[1] << 16 | mY[1] << 24;
    l3[i] = mX[0] | m1[0] << 8 | mY[0] << 16 | mX[0] << 24;
  }

  return [l0, l1, l2, l3];
}());

function rsMDSEncode(k0: number, k1: number) {
  for (let i = 0; i < 4; i += 1) {
    const b = k1 >>> 24 & 0xFF;
    const g2 = (b << 1 ^ ((b & 0x80) !== 0 ? RS_GF_FDBK : 0)) & 0xFF;
    const g3 = b >>> 1 ^ ((b & 0x01) !== 0 ? RS_GF_FDBK >>> 1 : 0 ) ^ g2;
    k1 = k1 << 8 ^ g3 << 24 ^ g2 << 16 ^ g3 << 8 ^ b;
  }
  k1 ^= k0;
  for (let i = 0; i < 4; i += 1) {
    const b = k1 >>> 24 & 0xFF;
    const g2 = (b << 1 ^ ((b & 0x80) !== 0 ? RS_GF_FDBK : 0)) & 0xFF;
    const g3 = b >>> 1 ^ ((b & 0x01) !== 0 ? RS_GF_FDBK >>> 1 : 0 ) ^ g2;
    k1 = k1 << 8 ^ g3 << 24 ^ g2 << 16 ^ g3 << 8 ^ b;
  }
  return k1;
}

function f32(k64Cnt: number, x: number, k32: Uint32Array) {
  let lB0 = b0(x);
  let lB1 = b1(x);
  let lB2 = b2(x);
  let lB3 = b3(x);
  const k0 = k32[0];

  switch (k64Cnt & 3) {
    case 0:  /* 256 bits of key */
      const k3 = k32[3];
      lB0 = P1[lB0] & 0xFF ^ b0(k3);
      lB1 = P0[lB1] & 0xFF ^ b1(k3);
      lB2 = P0[lB2] & 0xFF ^ b2(k3);
      lB3 = P1[lB3] & 0xFF ^ b3(k3);
      /* falls through */

    case 3: /* 192 bits of key */
      const k2 = k32[2];
      lB0 = P1[lB0] & 0xFF ^ b0(k2);
      lB1 = P1[lB1] & 0xFF ^ b1(k2);
      lB2 = P0[lB2] & 0xFF ^ b2(k2);
      lB3 = P0[lB3] & 0xFF ^ b3(k2);
      /* falls through */

    case 2: /* 128 bits of key */
      const k1 = k32[1];
      return  MDS0[P0[P0[lB0] & 0xFF ^ b0(k1)] & 0xFF ^ b0(k0)] ^
              MDS1[P0[P1[lB1] & 0xFF ^ b1(k1)] & 0xFF ^ b1(k0)] ^
              MDS2[P1[P0[lB2] & 0xFF ^ b2(k1)] & 0xFF ^ b2(k0)] ^
              MDS3[P1[P1[lB3] & 0xFF ^ b3(k1)] & 0xFF ^ b3(k0)];

    default:
      return  MDS0[P0[lB0] & 0xFF ^ b0(k0)] ^
              MDS1[P0[lB1] & 0xFF ^ b1(k0)] ^
              MDS2[P1[lB2] & 0xFF ^ b2(k0)] ^
              MDS3[P1[lB3] & 0xFF ^ b3(k0)];
  }
}

function fe32(sBox: Uint8Array, x: number, R: number) {
  return sBox[2 * chooseB[R%4](x)] ^
         sBox[2 * chooseB[(R+1)%4](x) + 1] ^
         sBox[0x200 + 2 * chooseB[(R+2)%4](x)] ^
         sBox[0x200 + 2 * chooseB[(R+3)%4](x) + 1];
}

function xorBuffers(a: Uint8Array, b: Uint8Array, out: Uint8Array) {
  for (let i = 0; i < a.length; i += 1) {
    out[i] = (a[i] ^ b[i]) & 0xFF;
  }
}

function expandKey(aKey: Uint8Array): [Uint8Array, Uint32Array] {
  let keyLength = aKey.length;
  if (keyLength > 32) {
    aKey = aKey.subarray(0, 32);
  } else {
    const mod = keyLength % 8;
    if (mod > 0) {
      const tmpKey = new Uint8Array(keyLength + (8 - mod));
      tmpKey.set(aKey);
      aKey = tmpKey;
    }
  }
  keyLength = aKey.length;

  let offset = 0;
  const k64Cnt = keyLength / 8;
  const k32e = new Uint32Array(k64Cnt);
  const k32o = new Uint32Array(k64Cnt);
  const sBoxKey = new Uint32Array(k64Cnt);

  for (let i = 0, j = k64Cnt - 1; i < 4 && offset < keyLength; i++, j--) {
    k32e[i] = aKey[offset++] & 0xFF | (aKey[offset++] & 0xFF) << 8 | (aKey[offset++] & 0xFF) << 16 | (aKey[offset++] & 0xFF) << 24;
    k32o[i] = aKey[offset++] & 0xFF | (aKey[offset++] & 0xFF) << 8 | (aKey[offset++] & 0xFF) << 16 | (aKey[offset++] & 0xFF) << 24;
    sBoxKey[j] = rsMDSEncode(k32e[i], k32o[i]);
  }

  const subkeyCnt = ROUND_SUBKEYS + 2 * ROUNDS;
  const subKeys = new Uint32Array(subkeyCnt);
  for (let i = 0, q = 0; i < subkeyCnt; i += 2, q += SK_STEP) {
    let A = f32(k64Cnt, q, k32e);
    let B = f32(k64Cnt, q + SK_BUMP, k32o);
    B = B << 8 | B >>> 24;
    A += B;
    subKeys[i] = A;
    A += B;
    subKeys[i + 1] = A << SK_ROTL | A >>> 32 - SK_ROTL;
  }

  const k0 = sBoxKey[0];
  const k1 = sBoxKey[1];
  const k2 = sBoxKey[2];
  const k3 = sBoxKey[3];

  const sBox = new Uint8Array(1024);
  for (let i = 0; i < 256; i += 1) {
    let lB0 = i;
    let lB1 = i;
    let lB2 = i;
    let lB3 = i;

    switch (k64Cnt & 3) {
      case 0: /* 256 bits of key */
        lB0 = P1[lB0] & 0xFF ^ b0(k3);
        lB1 = P0[lB1] & 0xFF ^ b1(k3);
        lB2 = P0[lB2] & 0xFF ^ b2(k3);
        lB3 = P1[lB3] & 0xFF ^ b3(k3);
        /* falls through */

      case 3: /* 192 bits of key */
        lB0 = P1[lB0] & 0xFF ^ b0(k2);
        lB1 = P1[lB1] & 0xFF ^ b1(k2);
        lB2 = P0[lB2] & 0xFF ^ b2(k2);
        lB3 = P0[lB3] & 0xFF ^ b3(k2);
        /* falls through */

      case 2: /* 128 bits of key */
        lB0 = MDS0[P0[P0[lB0] & 0xFF ^ b0(k1)] & 0xFF ^ b0(k0)];
        lB1 = MDS1[P0[P1[lB1] & 0xFF ^ b1(k1)] & 0xFF ^ b1(k0)];
        lB2 = MDS2[P1[P0[lB2] & 0xFF ^ b2(k1)] & 0xFF ^ b2(k0)];
        lB3 = MDS3[P1[P1[lB3] & 0xFF ^ b3(k1)] & 0xFF ^ b3(k0)];
        break;

      default:
        lB0 = MDS0[P0[lB0] & 0xFF ^ b0(k0)];
        lB1 = MDS1[P0[lB1] & 0xFF ^ b1(k0)];
        lB2 = MDS2[P1[lB2] & 0xFF ^ b2(k0)];
        lB3 = MDS3[P1[lB3] & 0xFF ^ b3(k0)];
        break;
    }
    
    sBox[2 * i] =             lB0;
    sBox[2 * i + 1] =         lB1;
    sBox[0x200 + 2 * i] =     lB2;
    sBox[0x200 + 2 * i + 1] = lB3;
  }

  return [sBox, subKeys];
}

function blockEncrypt(plain: Uint8Array, io: number, cipher: Uint8Array, oo: number, [sBox, sKey]: SessionKey) {
  let x0 = plain[io++] & 0xFF |
        (plain[io++] & 0xFF) << 8 |
        (plain[io++] & 0xFF) << 16 |
        (plain[io++] & 0xFF) << 24;

  let x1 = plain[io++] & 0xFF |
        (plain[io++] & 0xFF) << 8 |
        (plain[io++] & 0xFF) << 16 |
        (plain[io++] & 0xFF) << 24;

  let x2 = plain[io++] & 0xFF |
        (plain[io++] & 0xFF) << 8 |
        (plain[io++] & 0xFF) << 16 |
        (plain[io++] & 0xFF) << 24;

  let x3 = plain[io++] & 0xFF |
        (plain[io++] & 0xFF) << 8 |
        (plain[io++] & 0xFF) << 16 |
        (plain[io++] & 0xFF) << 24;
  
  let k = ROUND_SUBKEYS;

  x0 ^= sKey[0];
  x1 ^= sKey[1];
  x2 ^= sKey[2];
  x3 ^= sKey[3];

  for (let R = 0; R < ROUNDS; R += 2) {
    let t0 = fe32(sBox, x0, 0);
    let t1 = fe32(sBox, x1, 3);
    
    x2 ^= t0 + t1 + sKey[k++];
    x2 = x2 >>> 1 | x2 << 31;
    x3 = x3 << 1 | x3 >>> 31;
    x3 ^= t0 + 2 * t1 + sKey[k++];
    
    t0 = fe32(sBox, x2, 0);
    t1 = fe32(sBox, x3, 3);

    x0 ^= t0 + t1 + sKey[k++];
    x0 = x0 >>> 1 | x0 << 31;
    x1 = x1 << 1 | x1 >>> 31;
    x1 ^= t0 + 2 * t1 + sKey[k++];
  }

  x2 ^= sKey[OUTPUT_WHITEN];
  x3 ^= sKey[OUTPUT_WHITEN + 1];
  x0 ^= sKey[OUTPUT_WHITEN + 2];
  x1 ^= sKey[OUTPUT_WHITEN + 3];

  const clen = cipher.length;
  if (oo + BLOCK_SIZE < clen) {
    cipher[oo++] = x2;
    cipher[oo++] = x2 >>> 8;
    cipher[oo++] = x2 >>> 16;
    cipher[oo++] = x2 >>> 24;
    cipher[oo++] = x3;
    cipher[oo++] = x3 >>> 8;
    cipher[oo++] = x3 >>> 16;
    cipher[oo++] = x3 >>> 24;
    cipher[oo++] = x0;
    cipher[oo++] = x0 >>> 8;
    cipher[oo++] = x0 >>> 16;
    cipher[oo++] = x0 >>> 24;
    cipher[oo++] = x1;
    cipher[oo++] = x1 >>> 8;
    cipher[oo++] = x1 >>> 16;
    cipher[oo++] = x1 >>> 24;
  } else {
    if (oo === clen) return; cipher[oo++] = x2;
    if (oo === clen) return; cipher[oo++] = x2 >>> 8;
    if (oo === clen) return; cipher[oo++] = x2 >>> 16;
    if (oo === clen) return; cipher[oo++] = x2 >>> 24;
    if (oo === clen) return; cipher[oo++] = x3;
    if (oo === clen) return; cipher[oo++] = x3 >>> 8;
    if (oo === clen) return; cipher[oo++] = x3 >>> 16;
    if (oo === clen) return; cipher[oo++] = x3 >>> 24;
    if (oo === clen) return; cipher[oo++] = x0;
    if (oo === clen) return; cipher[oo++] = x0 >>> 8;
    if (oo === clen) return; cipher[oo++] = x0 >>> 16;
    if (oo === clen) return; cipher[oo++] = x0 >>> 24;
    if (oo === clen) return; cipher[oo++] = x1;
    if (oo === clen) return; cipher[oo++] = x1 >>> 8;
    if (oo === clen) return; cipher[oo++] = x1 >>> 16;
    if (oo === clen) return; cipher[oo++] = x1 >>> 24;
  }
}

function blockDecrypt(cipher: Uint8Array, io: number, plain: Uint8Array, oo: number, [sBox, sKey]: SessionKey) {
  let x2 = cipher[io++] & 0xFF |
          (cipher[io++] & 0xFF) << 8 |
          (cipher[io++] & 0xFF) << 16 |
          (cipher[io++] & 0xFF) << 24;

  let x3 = cipher[io++] & 0xFF |
          (cipher[io++] & 0xFF) << 8 |
          (cipher[io++] & 0xFF) << 16 |
          (cipher[io++] & 0xFF) << 24;

  let x0 = cipher[io++] & 0xFF |
          (cipher[io++] & 0xFF) << 8 |
          (cipher[io++] & 0xFF) << 16 |
          (cipher[io++] & 0xFF) << 24;

  let x1 = cipher[io++] & 0xFF |
          (cipher[io++] & 0xFF) << 8 |
          (cipher[io++] & 0xFF) << 16 |
          (cipher[io++] & 0xFF) << 24;

  let k = ROUND_SUBKEYS + 2 * ROUNDS - 1;

  x2 ^= sKey[OUTPUT_WHITEN];
  x3 ^= sKey[OUTPUT_WHITEN + 1];
  x0 ^= sKey[OUTPUT_WHITEN + 2];
  x1 ^= sKey[OUTPUT_WHITEN + 3];

  for (let R = 0; R < ROUNDS; R += 2) {
    let t0 = fe32(sBox, x2, 0);
    let t1 = fe32(sBox, x3, 3);

    x1 ^= t0 + 2 * t1 + sKey[k--];
    x1 = x1 >>> 1 | x1 << 31;
    x0 = x0 << 1 | x0 >>> 31;
    x0 ^= t0 + t1 + sKey[k--];

    t0 = fe32(sBox, x0, 0);
    t1 = fe32(sBox, x1, 3);

    x3 ^= t0 + 2 * t1 + sKey[k--];
    x3 = x3 >>> 1 | x3 << 31;
    x2 = x2 << 1 | x2 >>> 31;
    x2 ^= t0 + t1 + sKey[k--];
  }

  x0 ^= sKey[0];
  x1 ^= sKey[1];
  x2 ^= sKey[2];
  x3 ^= sKey[3];

  const plen = plain.length;
  if (oo + BLOCK_SIZE < plen) {
    plain[oo++] = x0;
    plain[oo++] = x0 >>> 8;
    plain[oo++] = x0 >>> 16;
    plain[oo++] = x0 >>> 24;
    plain[oo++] = x1;
    plain[oo++] = x1 >>> 8;
    plain[oo++] = x1 >>> 16;
    plain[oo++] = x1 >>> 24;
    plain[oo++] = x2;
    plain[oo++] = x2 >>> 8;
    plain[oo++] = x2 >>> 16;
    plain[oo++] = x2 >>> 24;
    plain[oo++] = x3;
    plain[oo++] = x3 >>> 8;
    plain[oo++] = x3 >>> 16;
    plain[oo++] = x3 >>> 24;
  } else {
    if (oo === plen) return; plain[oo++] = x0;
    if (oo === plen) return; plain[oo++] = x0 >>> 8;
    if (oo === plen) return; plain[oo++] = x0 >>> 16;
    if (oo === plen) return; plain[oo++] = x0 >>> 24;
    if (oo === plen) return; plain[oo++] = x1;
    if (oo === plen) return; plain[oo++] = x1 >>> 8;
    if (oo === plen) return; plain[oo++] = x1 >>> 16;
    if (oo === plen) return; plain[oo++] = x1 >>> 24;
    if (oo === plen) return; plain[oo++] = x2;
    if (oo === plen) return; plain[oo++] = x2 >>> 8;
    if (oo === plen) return; plain[oo++] = x2 >>> 16;
    if (oo === plen) return; plain[oo++] = x2 >>> 24;
    if (oo === plen) return; plain[oo++] = x3;
    if (oo === plen) return; plain[oo++] = x3 >>> 8;
    if (oo === plen) return; plain[oo++] = x3 >>> 16;
    if (oo === plen) return; plain[oo++] = x3 >>> 24;
  }
}

function encrypt(sessionKey: SessionKey, plainText: Uint8Array, cipherText: Uint8Array) {
  for (let offset = 0; offset < plainText.length; offset += 16) {
    blockEncrypt(plainText, offset, cipherText, offset, sessionKey);
  }
}

function decrypt(sessionKey: SessionKey, cipherText: Uint8Array, plainText: Uint8Array) {
  for (let offset = 0; offset < cipherText.length; offset += 16) {
    blockDecrypt(cipherText, offset, plainText, offset, sessionKey);
  }
}

function normalizeIV(IV: Uint8Array) {
  if (IV.length === BLOCK_SIZE) return IV;
  
  let vector = new Uint8Array(BLOCK_SIZE);
  vector.set(IV.subarray(0, BLOCK_SIZE));
  
  return vector;
}

function encryptCBC(sessionKey: SessionKey, IV: Uint8Array, plainText: Uint8Array, cipherText: Uint8Array) {
  const loops = Math.ceil(plainText.length / BLOCK_SIZE);
  let vector = normalizeIV(IV);

  let pos = 0;
  const buffer1 = new Uint8Array(BLOCK_SIZE);
  for (let index = 0; index < loops; index++) {
    let cBuffer = plainText.subarray(pos, pos + BLOCK_SIZE);
    if (cBuffer.length < BLOCK_SIZE) {
      const tmpCBuffer = new Uint8Array(BLOCK_SIZE);
      tmpCBuffer.set(cBuffer);
      cBuffer = tmpCBuffer;
    }

    xorBuffers(cBuffer, vector, buffer1);
    const buffer2 = cipherText.subarray(pos, BLOCK_SIZE);
    blockEncrypt(buffer1, 0, buffer2, 0, sessionKey);

    vector = buffer2;
    pos += BLOCK_SIZE;
  }
}

function decryptCBC(sessionKey: SessionKey, IV: Uint8Array, cipherText: Uint8Array, plainText: Uint8Array) {
  const loops = Math.ceil(cipherText.length / BLOCK_SIZE);
  let vector = normalizeIV(IV);

  let pos = 0;
  const buffer1 = new Uint8Array(BLOCK_SIZE);
  for (let index = 0; index < loops; index++) {
    let cBuffer = cipherText.subarray(pos, pos + BLOCK_SIZE);
    if (cBuffer.length < BLOCK_SIZE) {
      const tmpCBuffer = new Uint8Array(BLOCK_SIZE);
      tmpCBuffer.set(cBuffer);
      cBuffer = tmpCBuffer;
    }

    blockDecrypt(cBuffer, 0, buffer1, 0, sessionKey);
    xorBuffers(buffer1, vector, plainText.subarray(pos, pos + BLOCK_SIZE));

    vector = cBuffer;
    pos += BLOCK_SIZE;
  }
}