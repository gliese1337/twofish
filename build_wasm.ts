import wabt from 'wabt';
import fs from 'fs';

async function compile() {
  const WABT = await wabt();
  const mod = WABT.parseWat('wasm.wat', fs.readFileSync('./src/wasm.wat'));
  const b64 = Buffer.from(mod.toBinary({}).buffer).toString("base64");
  fs.writeFileSync(
    './src/wasm.ts',
    `export default WebAssembly.compile(new Uint8Array(Array.from(atob("${b64}"), c => c.codePointAt(0)) as number[]));`);
}

compile();