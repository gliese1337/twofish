Twofish-TS
==========

This is a decently-performant, memory-efficient TypeScript implementation of the Twofish block encryption algorithm, validated with the test vectors from https://www.schneier.com/wp-content/uploads/2015/12/ecb_ival.txt

The module has the following exports:

```ts
export declare type Session;
export declare function makeSession(key: Uint8Array): Session;
export declare function encrypt(input: Uint8Array, io: number, output: Uint8Array, oo: number, session: Session): void;
export declare function decrypt(input: Uint8Array, io: number, output: Uint8Array, oo: number, session: Session): void;
```

`makeSession` uses an encryption key to generate the key-dependent S-boxes and expanded key schedule for the Twofish algorithm. This is the only function which performs any dynamic allocation, and it must be called before `encrypt` or `decrypt` to produce a `Session` object. Keys may be 8, 16, 24, or 32 bits. Longer keys will be automatically truncate to 32 bits, and non-multiple-of-8 keys will be padded with 0 bytes.

`encrypt` and `decrypt` act on 16-byte blocks, reading from `input` starting at index `io` and writing to `output` starting at index `oo`. The `input` and `output` may be safely aliased. An in-place round trip for a single block may therefore be performed as follows:

```ts
const block = new Uint8Array(16);
// put data in block
const session = makeSession(key);
encrypt(block, 0, block, 0, session);
decrypt(block, 0, block, 0, session);
```

Of course, you can also use separate inputs and output

```ts
const in_block = new Uint8Array(16);
const cipher_block = new Uint8Array(16);
const out_block = new Uint8Array(16);
// put data in in_block
const session = makeSession(key);
encrypt(in_block, 0, cipher_block, 0, session);
decrypt(cipher_block, 0, out_block, 0, session);
//in_block[i] === out_block[i] for 0 < i < 16 
```

If the input buffer does not have 16 bytes left after the specified starting index, encryption will implicitly read additional padding zeroes. Decryption will throw an error.
If the output buffer does not have 16 bytes left after the specified starting index, encryption and decryption will both throw an error.

```ts
encrypt(buf, 0, new Uint8Array(16), 2, skey); // throws Error("Insufficient space to write ciphertext block.")
decrypt(buf, 0, new Uint8Array(16), 2, skey); // throws Error("Insufficient space to write plaintext block.");
decrypt(buf, 2, new Uint8Array(16), 0, skey); // throws Error("Incomplete ciphertext block.");
```

Note that this module *only* implements the basic block encryption algorithm. It is intended to provide the core block cipher to be plugged into a larger encryption algorithm, such as Cipher Block Chaining (CBC) or Counter mode (CTR) encryption.