import 'mocha';
import { expect } from 'chai';
import { TwoFish } from '../src';

describe(`Error tests`, () => {
  const buf = new Uint8Array([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

  it(`Should error if there isn't enough space for the ciphertext`, async () => {
    try {
      const skey = await TwoFish.init(new Uint8Array([1,2,3,4,5,6,7,8]));
      skey.encrypt(buf, 0, new Uint8Array(16), 2);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Insufficient space to write ciphertext block.");
    }
  });

  it(`Should error if there isn't enough space for the plaintext`, async () => {
    try {
      const skey = await TwoFish.init(new Uint8Array([1,2,3,4,5,6,7,8]));
      skey.decrypt(buf, 0, new Uint8Array(16), 2);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Insufficient space to write plaintext block.");
    }
  });

  it(`Should error if the ciphertext is incomplete`, async () => {
    try {
      const skey = await TwoFish.init(new Uint8Array([1,2,3,4,5,6,7,8]));
      skey.decrypt(buf, 7, new Uint8Array(16), 0);
      throw new Error("Should've errored");
    } catch (e) {
      expect((e as Error).message).to.eql("Incomplete ciphertext block.");
    }
  });
});