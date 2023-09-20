import 'mocha';
import { expect } from 'chai';
import { makeSession, encrypt, decrypt } from '../src';
import vectors from './testvectors';

function fromHex(str: string) {
  const l = str.length / 2;
  const out = new Uint8Array(l);
  for (let i = 0; i < l; i++) {
    out[i] = parseInt(str.substr(2*i, 2), 16);
  }
  return out;
}

function toHex(buf: Uint8Array) {
  return [...buf].map(n => {
    const h = n.toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('').toUpperCase();
}

const cbuf = new Uint8Array(16);
const obuf = new Uint8Array(16);

for (const { keysize, tests } of vectors) {
  describe(`Keysize=${keysize}`, () => {
    for (const { key, pt, ct } of tests) {
      const skey = makeSession(fromHex(key));
      const buf = fromHex(pt);
      it(`Should roundtrip ${pt} with key ${key} in a single buffer`, () => {
        encrypt(buf, 0, buf, 0, skey);
        expect(toHex(buf)).to.eql(ct);
        decrypt(buf, 0, buf, 0, skey);
        expect(toHex(buf)).to.eql(pt);
      });
  
      it(`Should roundtrip ${pt} with key ${key} in multiple buffers`, () => {
        encrypt(buf, 0, cbuf, 0, skey);
        expect(toHex(cbuf)).to.eql(ct);
        decrypt(cbuf, 0, obuf, 0, skey);
        expect(toHex(obuf)).to.eql(pt);
      });
    }
  });
}