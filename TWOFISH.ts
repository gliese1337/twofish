import { M00, M01, M02, M03, M10, M11, M12, M13, M20, M21, M22, M23, M30, M31, M32, M33, P8x8, P_00, P_01, P_02, P_03, P_04, P_10, P_11, P_12, P_13, P_14, P_20, P_21, P_22, P_23, P_24, P_30, P_31, P_32, P_33, P_34 } from './TABLE';

/* The structure for key information */
type KeyInstance = {
	direction: boolean;			 /* Key used for encrypting or decrypting? */
	keyLen: number; /* Length of the key */
	keyMaterial: string;     /* Raw key data in ASCII */

	/* Twofish-specific parameters: */
	keySig: number;					/* set to VALID_SIG by makeKey() */
	numRounds: number;				/* number of rounds in cipher */
	key32: Uint32Array;	/* actual key bits, in dwords */
	sboxKeys: Uint32Array;/* key bits used for S-boxes */
	subKeys: Uint32Array;	/* round subkeys, input/output whitening bits */
};

const	ROL = (x: number, n: number) => ((x << (n & 0x1F)) | (x >> (32-(n & 0x1F))));
const	ROR = (x: number, n: number) => ((x >> (n & 0x1F)) | (x << (32-(n & 0x1F))));

// #if LittleEndian
// const Bswap = x => x		/* NOP for little-endian machines */
// const ADDR_XOR	= 0;		/* NOP for little-endian machines */
const Bswap = (x: number) => ((ROR(x,8) & 0xFF00FF00) | (ROL(x,8) & 0x00FF00FF));
//const ADDR_XOR = 3;		/* convert byte address in dword */

/*	Macro for extracting bytes from dwords */
const byte = (x: number, N: 0|1|2|3) => (x >>> (8*N)) & 0xff;

const numRounds = 16;

/*
+*****************************************************************************
* Function Name:	ParseHexDword
* Function:			Parse ASCII hex nibbles and fill in key/iv dwords
* Arguments:		bit			=	# bits to read
*					srcTxt		=	ASCII source
*					d			=	ptr to dwords to fill in
*					dstTxt		=	where to make a copy of ASCII source
*									(NULL ok)
* Return:			Zero if no error.  Nonzero --> invalid hex or length
* Notes:  Note that the parameter d is a DWORD array, not a byte array.
*	This routine is coded to work both for little-endian and big-endian
*	architectures.  The character stream is interpreted as a LITTLE-ENDIAN
*	byte stream, since that is how the Pentium works, but the conversion
*	happens automatically below. 
-****************************************************************************/
function ParseHexDword(bits: number, srcTxt: string, d: Uint32Array) {
	d.fill(0, 0, Math.ceil(bits / 32)); /* first, zero the field */

	const nibbles = bits >>> 2;
	for (let i = 0; i < nibbles; i++) {	/* parse one nibble at a time */
		const c = srcTxt.charCodeAt(i); /* case out the hexadecimal characters */
		let b: number;
		if ((c >= 48) && (c <= 57))
			b = c - 48;
		else if ((c >= 97) && (c <= 102))
			b = c - 87;
		else if ((c >= 65) && (c <= 70))
			b = c - 55;
		else
			return 1;
		/* works for big and little endian! */
		d[i >>> 3] |= b << (4*((i^1)&7));		
	}

	return 0;
}


/*
+*****************************************************************************
* Function Name:	f32
* Function:			Run four bytes through keyed S-boxes and apply MDS matrix
* Arguments:		x			=	input to f function
*					k32			=	pointer to key dwords
*					keyLen		=	total key length (k32 --> keyLey/2 bits)
*
* Return:			The output of the keyed permutation applied to x.
*
* Notes:
*	This function is a keyed 32-bit permutation.  It is the major building
*	block for the Twofish round function, including the four keyed 8x8 
*	permutations and the 4x4 MDS matrix multiply.  This function is used
*	both for generating round subkeys and within the round function on the
*	block being encrypted.  
*
*	This version is fairly slow and pedagogical, although a smartcard would
*	probably perform the operation exactly this way in firmware.   For
*	ultimate performance, the entire operation can be completed with four
*	lookups into four 256x32-bit tables, with three dword xors.
*
*	The MDS matrix is defined in TABLE.H.  To multiply by Mij, just use the
*	macro Mij(x).
-****************************************************************************/

const f32b = new Uint8Array(4);
const f32w = new Uint32Array(f32b.buffer);

function f32(x: number, k32: Uint32Array, keyLen: number): number {	
	/* Run each byte thru 8x8 S-boxes, xoring with key byte at each stage. */
	/* Note that each byte goes through a different combination of S-boxes.*/

	f32w[0] = Bswap(x); /* make b[0] = LSB, b[3] = MSB */
	let b0 = f32b[0];
	let b1 = f32b[1];
	let b2 = f32b[2];
	let b3 = f32b[3];
	switch (((keyLen + 63)/64) & 3) {
		case 0:		/* 256 bits of key */
			const k3 = k32[3];
			b0 = P8x8[P_04][b0] ^ byte(k3, 0);
			b1 = P8x8[P_14][b1] ^ byte(k3, 1);
			b2 = P8x8[P_24][b2] ^ byte(k3, 2);
			b3 = P8x8[P_34][b3] ^ byte(k3, 3);
			/* fall thru, having pre-processed b[0]..b[3] with k32[3] */
		case 3:		/* 192 bits of key */
			const k2 = k32[2];
			b0 = P8x8[P_03][b0] ^ byte(k2, 0);
			b1 = P8x8[P_13][b1] ^ byte(k2, 1);
			b2 = P8x8[P_23][b2] ^ byte(k2, 2);
			b3 = P8x8[P_33][b3] ^ byte(k2, 3);
			/* fall thru, having pre-processed b[0]..b[3] with k32[2] */
		case 2:		/* 128 bits of key */
			const k0 = k32[0];
			const k1 = k32[1];
			b0 = P8x8[P_00][P8x8[P_01][P8x8[P_02][b0] ^ byte(k1, 0)] ^ byte(k0, 0)];
			b1 = P8x8[P_10][P8x8[P_11][P8x8[P_12][b1] ^ byte(k1, 1)] ^ byte(k0, 1)];
			b2 = P8x8[P_20][P8x8[P_21][P8x8[P_22][b2] ^ byte(k1, 2)] ^ byte(k0, 2)];
			b3 = P8x8[P_30][P8x8[P_31][P8x8[P_32][b3] ^ byte(k1, 3)] ^ byte(k0, 3)];
	}

	/* Now perform the MDS matrix multiply. */
	return	((M00(b0) ^ M01(b1) ^ M02(b2) ^ M03(b3))	  ) ^
			((M10(b0) ^ M11(b1) ^ M12(b2) ^ M13(b3)) <<  8) ^
			((M20(b0) ^ M21(b1) ^ M22(b2) ^ M23(b3)) << 16) ^
			((M30(b0) ^ M31(b1) ^ M32(b2) ^ M33(b3)) << 24) ;
}

/*
+*****************************************************************************
* Function Name:	RS_MDS_Encode
* Function:			Use (12,8) Reed-Solomon code over GF(256) to produce
*					a key S-box dword from two key material dwords.
* Arguments:		k0	=	1st dword
*					k1	=	2nd dword
*
* Return:			Remainder polynomial generated using RS code
*
* Notes:
*	Since this computation is done only once per reKey per 64 bits of key,
*	the performance impact of this routine is imperceptible. The RS code
*	chosen has "simple" coefficients to allow smartcard/hardware implementation
*	without lookup tables.
*
-****************************************************************************/

/* Reed-Solomon code parameters: (12,8) reversible code
	g(x) = x**4 + (a + 1/a) x**3 + a x**2 + (a + 1/a) x + 1
   where a = primitive root of field generator 0x14D */
const	RS_GF_FDBK = 0x14D;		/* field generator */

function RS_MDS_Encode(k0: number, k1: number): number {
	let r = k1;
	for (let j = 0; j < 4; j++)	{		/* shift one byte at a time */
		const b  = (r >> 24) & 0xff;
		const g2 = ((b << 1) ^ ((b & 0x80) ? RS_GF_FDBK : 0 )) & 0xFF;	
		const g3 = ((b >> 1) & 0x7F) ^ ((b & 1) ? RS_GF_FDBK >> 1 : 0 ) ^ g2;
		r = (r << 8) ^ (g3 << 24) ^ (g2 << 16) ^ (g3 << 8) ^ b;
	}
	
	r ^= k0;			/* merge in 32 more key bits */
	for (let j = 0; j < 4; j++)	{		/* shift one byte at a time */
		const b  = (r >> 24) & 0xff;
		const g2 = ((b << 1) ^ ((b & 0x80) ? RS_GF_FDBK : 0 )) & 0xFF;	
		const g3 = ((b >> 1) & 0x7F) ^ ((b & 1) ? RS_GF_FDBK >> 1 : 0 ) ^ g2;
		r = (r << 8) ^ (g3 << 24) ^ (g2 << 16) ^ (g3 << 8) ^ b;
	}

	return r;
}

/*
+*****************************************************************************
* Function Name:	reKey
* Function:			Initialize the Twofish key schedule from key32
* Arguments:		key			=	ptr to keyInstance to be initialized
*
* Return:			TRUE on success
*
* Notes:
*	Here we precompute all the round subkeys, although that is not actually
*	required.  For example, on a smartcard, the round subkeys can 
*	be generated on-the-fly	using f32()
*
-****************************************************************************/

/* for computing subkeys */
const SK_STEP = 0x02020202;
const SK_BUMP = 0x01010101;
const SK_ROTL = 9;

function reKey(key: KeyInstance) {
	const keyLen	  = key.keyLen;
	const subkeyCnt = ROUND_SUBKEYS + 2*key.numRounds;
  
	const k64Cnt=(keyLen+63)/64;		/* round up to next multiple of 64 bits */

	const k32e = new Uint32Array(k64Cnt);
  const k32o = new Uint32Array(k64Cnt);

	for (let i=0;i<k64Cnt;i++) {	/* split into even/odd key dwords */
		k32e[i]=key.key32[2*i  ];
		k32o[i]=key.key32[2*i+1];
		/* compute S-box keys using (12,8) Reed-Solomon code over GF(256) */
		key.sboxKeys[k64Cnt-1-i] = RS_MDS_Encode(k32e[i], k32o[i]); /* reverse order */
	}

	for (let i=0;i<subkeyCnt/2;i++) {					/* compute round subkeys for PHT */
		const A = f32(i*SK_STEP, k32e, keyLen);	/* A uses even key dwords */
		let B = f32(i*SK_STEP + SK_BUMP, k32o, keyLen);	/* B uses odd  key dwords */
		B = ROL(B,8);
		key.subKeys[2*i  ] = A+  B;			/* combine with a PHT */
		key.subKeys[2*i+1] = ROL(A+2*B, SK_ROTL);
	}
}

/*
+*****************************************************************************
* Function Name:	makeKey
* Function:			Initialize the Twofish key schedule
* Arguments:		key			=	ptr to keyInstance to be initialized
*					direction	=	DIR_ENCRYPT or DIR_DECRYPT
*					keyLen		=	# bits of key text at *keyMaterial
*					keyMaterial	=	ptr to hex ASCII chars representing key bits
*
* Return:			TRUE on success
*					else error code (e.g., BAD_KEY_DIR)
*
* Notes:
*	This parses the key bits from keyMaterial.  No crypto stuff happens here.
*	The function reKey() is called to actually build the key schedule after
*	the keyMaterial has been parsed.
*
-****************************************************************************/
function makeKey(key: KeyInstance, direction: boolean, keyLen: number, keyMaterial: string) {
	key.direction	= direction;	/* set our cipher direction */
	key.keyLen		= (keyLen+63) & ~63;		/* round up to multiple of 64 */
	key.numRounds	= 16;
  key.key32 = new Uint32Array(8);
		
	if (ParseHexDword(keyLen, keyMaterial, key.key32))
		return 1;

	reKey(key);			/* generate round subkeys */
  return 0;
}

/*
+*****************************************************************************
* Function Name:	cipherInit
* Function:			Initialize the Twofish cipher in a given mode
* Arguments:		cipher		=	ptr to cipherInstance to be initialized
*					mode		=	MODE_ECB, MODE_CBC, or MODE_CFB1
*					IV			=	ptr to hex ASCII test representing IV bytes
*
* Return:			TRUE on success
*					else error code (e.g., BAD_CIPHER_MODE)
*
-****************************************************************************/
int cipherInit(cipherInstance *cipher, BYTE mode,CONST char *IV) {
	int i;
	if ((mode != MODE_ECB) && (IV))	{ /* parse the IV */
		if (ParseHexDword(BLOCK_SIZE,IV,cipher->iv32,NULL))
			return BAD_IV_MAT;
		for (i=0;i<BLOCK_SIZE/32;i++)	/* make byte-oriented copy for CFB1 */
			((DWORD *)cipher->IV)[i] = Bswap(cipher->iv32[i]);
	}

	cipher->mode		=	mode;

	return TRUE;
}

/*
+*****************************************************************************
* Function Name:	blockEncrypt
* Function:			Encrypt block(s) of data using Twofish
* Arguments:		cipher		=	ptr to already initialized cipherInstance
*					key			=	ptr to already initialized keyInstance
*					input		=	ptr to data blocks to be encrypted
*					inputLen	=	# bits to encrypt (multiple of blockSize)
*					outBuffer	=	ptr to where to put encrypted blocks
*
* Return:			# bits ciphered (>= 0)
*					else error code (e.g., BAD_CIPHER_STATE, BAD_KEY_MATERIAL)
*
* Notes: The only supported block size for ECB/CBC modes is BLOCK_SIZE bits.
*		 If inputLen is not a multiple of BLOCK_SIZE bits in those modes,
*		 an error BAD_INPUT_LEN is returned.  In CFB1 mode, all block 
*		 sizes can be supported.
*
-****************************************************************************/
int blockEncrypt(cipherInstance *cipher, keyInstance *key,CONST BYTE *input,
				int inputLen, BYTE *outBuffer) {
	int   i,n,r;					/* loop variables */
	DWORD x[BLOCK_SIZE/32];			/* block being encrypted */
	DWORD t0,t1,tmp;				/* temp variables */
	int	  rounds=key->numRounds;	/* number of rounds */
	BYTE  bit,ctBit,carry;			/* temps for CFB */

	if (cipher->mode == MODE_CFB1) {	/* use recursion here to handle CFB, one block at a time */
		cipher->mode = MODE_ECB;	/* do encryption in ECB */
		for (n=0;n<inputLen;n++) {
			blockEncrypt(cipher,key,cipher->IV,BLOCK_SIZE,(BYTE *)x);
			bit	  = 0x80 >> (n & 7);/* which bit position in byte */
			ctBit = (input[n/8] & bit) ^ ((((BYTE *) x)[0] & 0x80) >> (n&7));
			outBuffer[n/8] = (outBuffer[n/8] & ~ bit) | ctBit;
			carry = ctBit >> (7 - (n&7));
			for (i=BLOCK_SIZE/8-1;i>=0;i--) {
				bit = cipher->IV[i] >> 7;	/* save next "carry" from shift */
				cipher->IV[i] = (cipher->IV[i] << 1) ^ carry;
				carry = bit;
			}
		}
		cipher->mode = MODE_CFB1;	/* restore mode for next time */
		return inputLen;
	}

	/* here for ECB, CBC modes */
	for (n=0;n<inputLen;n+=BLOCK_SIZE,input+=BLOCK_SIZE/8,outBuffer+=BLOCK_SIZE/8) {
		for (i=0;i<BLOCK_SIZE/32;i++) {	/* copy in the block, add whitening */
			x[i]=Bswap(((DWORD *)input)[i]) ^ key->subKeys[INPUT_WHITEN+i];
			if (cipher->mode == MODE_CBC)
				x[i] ^= Bswap(cipher->iv32[i]);
		}

		for (r=0;r<rounds;r++) {			/* main Twofish encryption loop */
			t0	 = f32(    x[0]   ,key->sboxKeys,key->keyLen);
			t1	 = f32(ROL(x[1],8),key->sboxKeys,key->keyLen);

			x[3] = ROL(x[3],1);
			x[2]^= t0 +   t1 + key->subKeys[ROUND_SUBKEYS+2*r  ]; /* PHT, round keys */
			x[3]^= t0 + 2*t1 + key->subKeys[ROUND_SUBKEYS+2*r+1];
			x[2] = ROR(x[2],1);

			if (r < rounds-1) {						/* swap for next round */
				tmp = x[0]; x[0]= x[2]; x[2] = tmp;
				tmp = x[1]; x[1]= x[3]; x[3] = tmp;
			}
		}

		for (i=0;i<BLOCK_SIZE/32;i++) {	/* copy out, with whitening */
			((DWORD *)outBuffer)[i] = Bswap(x[i] ^ key->subKeys[OUTPUT_WHITEN+i]);
			if (cipher->mode == MODE_CBC)
				cipher->iv32[i] = ((DWORD *)outBuffer)[i];
		}
	}

	return inputLen;
}

/*
+*****************************************************************************
* Function Name:	blockDecrypt
* Function:			Decrypt block(s) of data using Twofish
*
* Arguments:		cipher		=	ptr to already initialized cipherInstance
*					key			=	ptr to already initialized keyInstance
*					input		=	ptr to data blocks to be decrypted
*					inputLen	=	# bits to encrypt (multiple of blockSize)
*					outBuffer	=	ptr to where to put decrypted blocks
*
* Return:			# bits ciphered (>= 0)
*					else error code (e.g., BAD_CIPHER_STATE, BAD_KEY_MATERIAL)
*
* Notes: The only supported block size for ECB/CBC modes is BLOCK_SIZE bits.
*		 If inputLen is not a multiple of BLOCK_SIZE bits in those modes,
*		 an error BAD_INPUT_LEN is returned.  In CFB1 mode, all block 
*		 sizes can be supported.
*
-****************************************************************************/
int blockDecrypt(cipherInstance *cipher, keyInstance *key,CONST BYTE *input,
				int inputLen, BYTE *outBuffer) {
	int   i,n,r;					/* loop counters */
	DWORD x[BLOCK_SIZE/32];			/* block being encrypted */
	DWORD t0,t1;					/* temp variables */
	int	  rounds=key->numRounds;	/* number of rounds */
	BYTE  bit,ctBit,carry;			/* temps for CFB */

	if (cipher->mode == MODE_CFB1) {	/* use blockEncrypt here to handle CFB, one block at a time */
		cipher->mode = MODE_ECB;	/* do encryption in ECB */
		for (n=0;n<inputLen;n++) {
			blockEncrypt(cipher,key,cipher->IV,BLOCK_SIZE,(BYTE *)x);
			bit	  = 0x80 >> (n & 7);
			ctBit = input[n/8] & bit;
			outBuffer[n/8] = (outBuffer[n/8] & ~ bit) |
							 (ctBit ^ ((((BYTE *) x)[0] & 0x80) >> (n&7)));
			carry = ctBit >> (7 - (n&7));
			for (i=BLOCK_SIZE/8-1;i>=0;i--) {
				bit = cipher->IV[i] >> 7;	/* save next "carry" from shift */
				cipher->IV[i] = (cipher->IV[i] << 1) ^ carry;
				carry = bit;
			}
		}
		cipher->mode = MODE_CFB1;	/* restore mode for next time */
		return inputLen;
	}

	/* here for ECB, CBC modes */
	for (n=0;n<inputLen;n+=BLOCK_SIZE,input+=BLOCK_SIZE/8,outBuffer+=BLOCK_SIZE/8) {
		for (i=0;i<BLOCK_SIZE/32;i++)	/* copy in the block, add whitening */
			x[i]=Bswap(((DWORD *)input)[i]) ^ key->subKeys[OUTPUT_WHITEN+i];

		for (r=rounds-1;r>=0;r--) {			/* main Twofish decryption loop */
			t0	 = f32(    x[0]   ,key->sboxKeys,key->keyLen);
			t1	 = f32(ROL(x[1],8),key->sboxKeys,key->keyLen);

			DebugDump(x,"",r+1,2*(r&1),0,1,0);/* make format compatible with optimized code */
			x[2] = ROL(x[2],1);
			x[2]^= t0 +   t1 + key->subKeys[ROUND_SUBKEYS+2*r  ]; /* PHT, round keys */
			x[3]^= t0 + 2*t1 + key->subKeys[ROUND_SUBKEYS+2*r+1];
			x[3] = ROR(x[3],1);

			if (r) {								/* unswap, except for last round */
				t0   = x[0]; x[0]= x[2]; x[2] = t0;	
				t1   = x[1]; x[1]= x[3]; x[3] = t1;
			}
		}
		/* make final output match encrypt initial output */

		for (i=0;i<BLOCK_SIZE/32;i++) {	/* copy out, with whitening */
			x[i] ^= key->subKeys[INPUT_WHITEN+i];
			if (cipher->mode == MODE_CBC) {
				x[i] ^= Bswap(cipher->iv32[i]);
				cipher->iv32[i] = ((DWORD *)input)[i];
			}
			((DWORD *)outBuffer)[i] = Bswap(x[i]);
		}
	}

	return inputLen;
}