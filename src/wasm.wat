(module
  (memory (export "memory") 1)
  ;; sBox: [0, 4096) bytes
  ;; subKeys: [4096, 4256) bytes
  ;; x0...x3: [4256, 4272)

  (func $encrypt
    (local $t0 i32)
    (local $t1 i32)
    (local $k i32)
    (local $R i32)

    (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.load (i32.const 4096)))) ;; x0 = x0 ^ s[1024];
    (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.load (i32.const 4100)))) ;; x1 = x1 ^ s[1025];
    (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.load (i32.const 4104)))) ;; x2 = x2 ^ s[1026];
    (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.load (i32.const 4108)))) ;; x3 = x3 ^ s[1027];
    
    (local.set $k (i32.const 4128)) ;; let k = ROUND_SUBKEYS + 1024;
    (local.set $R (i32.const 0)) ;; for (let R = 0; R < ROUNDS; R += 2)
    (block
      (loop
        ;; t0 = s[x0 << 1 & 0x1FE]   ^ s[(x0 >>> 7 & 0x1FE) + 1] ^ s[0x200 + (x0 >>> 15 & 0x1FE)] ^ s[0x200 + (x0 >>> 23 & 0x1FE) + 1];
        (local.set $t0
          (i32.xor (i32.load (i32.and (i32.shl (i32.load (i32.const 4256)) (i32.const 1)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 7)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 15)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 23)) (i32.const 0x1FE))))))))
        
        ;; t1 = s[x1 >>> 23 & 0x1FE] ^ s[(x1 << 1 & 0x1FE) + 1]  ^ s[0x200 + (x1 >>> 7 & 0x1FE)]  ^ s[0x200 + (x1 >>> 15 & 0x1FE) + 1];
        (local.set $t1
          (i32.xor (i32.load (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 23)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shl (i32.load (i32.const 4260)) (i32.const 1)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 7)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 15)) (i32.const 0x1FE))))))))
        
        ;; x2 ^= t0 + t1 + s[k++];
        (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.add (i32.add (local.get $t0) (local.get $t1)) (i32.load (local.get $k)))))
        (local.set $k (i32.add (local.get $k) (i32.const 4)))
        
        ;; x2 = x2 >>> 1 | x2 << 31;
        (i32.store (i32.const 4264) (i32.or (i32.shr_u (i32.load (i32.const 4264)) (i32.const 1)) (i32.shl (i32.load (i32.const 4264)) (i32.const 31))))
        
        ;; x3 = x3 << 1 | x3 >>> 31;
        (i32.store (i32.const 4268) (i32.or (i32.shl (i32.load (i32.const 4268)) (i32.const 1)) (i32.shr_u (i32.load (i32.const 4268)) (i32.const 31))))
        
        ;; x3 ^= t0 + 2 * t1 + s[k++];
        (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.add (i32.add (local.get $t0) (i32.mul (local.get $t1) (i32.const 2))) (i32.load (local.get $k)))))
        (local.set $k (i32.add (local.get $k) (i32.const 4)))

        ;; t0 = s[x2 << 1 & 0x1FE]   ^ s[(x2 >>> 7 & 0x1FE) + 1] ^ s[0x200 + (x2 >>> 15 & 0x1FE)] ^ s[0x200 + (x2 >>> 23 & 0x1FE) + 1];
        (local.set $t0
          (i32.xor (i32.load (i32.and (i32.shl (i32.load (i32.const 4264)) (i32.const 1)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 7)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 15)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 23)) (i32.const 0x1FE))))))))

        ;; t1 = s[x3 >>> 23 & 0x1FE] ^ s[(x3 << 1 & 0x1FE) + 1]  ^ s[0x200 + (x3 >>> 7 & 0x1FE)]  ^ s[0x200 + (x3 >>> 15 & 0x1FE) + 1];
        (local.set $t1
          (i32.xor (i32.load (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 23)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shl (i32.load (i32.const 4268)) (i32.const 1)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 7)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 15)) (i32.const 0x1FE))))))))
        
        ;; x0 ^= t0 + t1 + s[k++];
        (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.add (i32.add (local.get $t0) (local.get $t1)) (i32.load (local.get $k)))))
        (local.set $k (i32.add (local.get $k) (i32.const 4)))
        
        ;; x0 = x0 >>> 1 | x0 << 31;
        (i32.store (i32.const 4256) (i32.or (i32.shr_u (i32.load (i32.const 4256)) (i32.const 1)) (i32.shl (i32.load (i32.const 4256)) (i32.const 31))))

        ;; x1 = x1 << 1 | x1 >>> 31;
        (i32.store (i32.const 4260) (i32.or (i32.shl (i32.load (i32.const 4260)) (i32.const 1)) (i32.shr_u (i32.load (i32.const 4260)) (i32.const 31))))
        
        ;; x1 ^= t0 + 2 * t1 + s[k++];
        (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.add (i32.add (local.get $t0) (i32.mul (local.get $t1) (i32.const 2))) (i32.load (local.get $k)))))
        (local.set $k (i32.add (local.get $k) (i32.const 4)))

        ;; Increment by 2 words and break when we hit 16 (64 bytes)
        (br_if 1
          (i32.eq
            (i32.const 64)
            (local.tee $R
              (i32.add (local.get $R) (i32.const 8)))))
        (br 0)
      )
    )

    (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.load (i32.const 4112)))) ;; x2 = x2 ^ s[1028];
    (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.load (i32.const 4116)))) ;; x3 = x3 ^ s[1029];
    (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.load (i32.const 4120)))) ;; x0 = x0 ^ s[1030];
    (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.load (i32.const 4124)))) ;; x1 = x1 ^ s[1031];
  )

  (func $decrypt    
    (local $t0 i32)
    (local $t1 i32)
    (local $k i32)
    (local $R i32)

    (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.load (i32.const 4112)))) ;; x2 = x2 ^ s[1028];
    (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.load (i32.const 4116)))) ;; x3 = x3 ^ s[1029];
    (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.load (i32.const 4120)))) ;; x0 = x0 ^ s[1030];
    (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.load (i32.const 4124)))) ;; x1 = x1 ^ s[1031];

    (local.set $k (i32.const 4252)) ;; let k = ROUND_SUBKEYS + 1024 + 2 * ROUNDS - 1;
    (local.set $R (i32.const 0)) ;; for (let R = 0; R < ROUNDS; R += 2)
    (block
      (loop
        ;; t0 = s[x2 << 1 & 0x1FE]   ^ s[(x2 >>> 7 & 0x1FE) + 1] ^ s[0x200 + (x2 >>> 15 & 0x1FE)] ^ s[0x200 + (x2 >>> 23 & 0x1FE) + 1];
        (local.set $t0
          (i32.xor (i32.load (i32.and (i32.shl (i32.load (i32.const 4264)) (i32.const 1)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 7)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 15)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4264)) (i32.const 23)) (i32.const 0x1FE))))))))
        
        ;; t1 = s[x3 >>> 23 & 0x1FE] ^ s[(x3 << 1 & 0x1FE) + 1]  ^ s[0x200 + (x3 >>> 7 & 0x1FE)]  ^ s[0x200 + (x3 >>> 15 & 0x1FE) + 1];
        (local.set $t1
          (i32.xor (i32.load (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 23)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shl (i32.load (i32.const 4268)) (i32.const 1)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 7)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4268)) (i32.const 15)) (i32.const 0x1FE))))))))

        ;; x1 ^= t0 + 2 * t1 + s[k--];
        (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.add (i32.add (local.get $t0) (i32.mul (local.get $t1) (i32.const 2))) (i32.load (local.get $k)))))
        (local.set $k (i32.sub (local.get $k) (i32.const 4)))

        ;; x1 = x1 >>> 1 | x1 << 31;
        (i32.store (i32.const 4260) (i32.or (i32.shr_u (i32.load (i32.const 4260)) (i32.const 1)) (i32.shl (i32.load (i32.const 4260)) (i32.const 31))))

        ;; x0 = x0 << 1 | x0 >>> 31;
        (i32.store (i32.const 4256) (i32.or (i32.shl (i32.load (i32.const 4256)) (i32.const 1)) (i32.shr_u (i32.load (i32.const 4256)) (i32.const 31))))

        ;; x0 ^= t0 + t1 + s[k--];
        (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.add (i32.add (local.get $t0) (local.get $t1)) (i32.load (local.get $k)))))
        (local.set $k (i32.sub (local.get $k) (i32.const 4)))

        ;; t0 = s[x0 << 1 & 0x1FE]   ^ s[(x0 >>> 7 & 0x1FE) + 1] ^ s[0x200 + (x0 >>> 15 & 0x1FE)] ^ s[0x200 + (x0 >>> 23 & 0x1FE) + 1];
        (local.set $t0
          (i32.xor (i32.load (i32.and (i32.shl (i32.load (i32.const 4256)) (i32.const 1)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 7)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 15)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4256)) (i32.const 23)) (i32.const 0x1FE))))))))

        ;; t1 = s[x1 >>> 23 & 0x1FE] ^ s[(x1 << 1 & 0x1FE) + 1]  ^ s[0x200 + (x1 >>> 7 & 0x1FE)]  ^ s[0x200 + (x1 >>> 15 & 0x1FE) + 1];
        (local.set $t1
          (i32.xor (i32.load (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 23)) (i32.const 0x1FE)))
            (i32.xor (i32.load (i32.add (i32.and (i32.shl (i32.load (i32.const 4260)) (i32.const 1)) (i32.const 0x1FE)) (i32.const 1)))
              (i32.xor (i32.load (i32.add (i32.const 0x200) (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 7)) (i32.const 0x1FE))))
                       (i32.load (i32.add (i32.const 0x201) (i32.and (i32.shr_u (i32.load (i32.const 4260)) (i32.const 15)) (i32.const 0x1FE))))))))

        ;; x3 ^= t0 + 2 * t1 + s[k--];
        (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.add (i32.add (local.get $t0) (i32.mul (local.get $t1) (i32.const 2))) (i32.load (local.get $k)))))
        (local.set $k (i32.sub (local.get $k) (i32.const 4)))
        
        ;; x3 = x3 >>> 1 | x3 << 31;
        (i32.store (i32.const 4268) (i32.or (i32.shr_u (i32.load (i32.const 4268)) (i32.const 1)) (i32.shl (i32.load (i32.const 4268)) (i32.const 31))))
        
        ;; x2 = x2 << 1 | x2 >>> 31;
        (i32.store (i32.const 4264) (i32.or (i32.shl (i32.load (i32.const 4264)) (i32.const 1)) (i32.shr_u (i32.load (i32.const 4264)) (i32.const 31))))
        
        ;; x2 ^= t0 + t1 + s[k--];
        (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.add (i32.add (local.get $t0) (local.get $t1)) (i32.load (local.get $k)))))
        (local.set $k (i32.sub (local.get $k) (i32.const 4)))

        ;; Increment by 2 words and break when we hit 16 (64 bytes)
        (br_if 1
          (i32.eq
            (i32.const 64)
            (local.tee $R
              (i32.add (local.get $R) (i32.const 8)))))
        (br 0)
      )
    )

    (i32.store (i32.const 4256) (i32.xor (i32.load (i32.const 4256)) (i32.load (i32.const 4096)))) ;; x0 = x0 ^ s[1024];
    (i32.store (i32.const 4260) (i32.xor (i32.load (i32.const 4260)) (i32.load (i32.const 4100)))) ;; x1 = x1 ^ s[1025];
    (i32.store (i32.const 4264) (i32.xor (i32.load (i32.const 4264)) (i32.load (i32.const 4104)))) ;; x2 = x2 ^ s[1026];
    (i32.store (i32.const 4268) (i32.xor (i32.load (i32.const 4268)) (i32.load (i32.const 4108)))) ;; x3 = x3 ^ s[1027];
  )

  (export "encrypt" (func $encrypt))
  (export "decrypt" (func $decrypt))
)