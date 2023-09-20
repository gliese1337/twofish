import 'mocha';
import { expect } from 'chai';
import { makeSession, encrypt, decrypt } from '../src';

describe(`Error tests`, () => {
  const skey = makeSession(new Uint8Array([1,2,3,4,5,6,7,8]));
  const buf = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

  it(`Should error if there isn't enough space for the ciphertext`, () => {
    try {
      encrypt(buf, 0, new Uint8Array(16), 2, skey);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Insufficient space to write ciphertext block.");
    }
  });

  it(`Should error if there isn't enough space for the plaintext`, () => {
    try {
      decrypt(buf, 0, new Uint8Array(16), 2, skey);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Insufficient space to write plaintext block.");
    }
  });

  it(`Should error if the ciphertext is incomplete`, () => {
    try {
      decrypt(buf, 7, new Uint8Array(16), 0, skey);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Incomplete ciphertext block.");
    }
  });
});