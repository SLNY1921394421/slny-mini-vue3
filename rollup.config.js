// ESM 标准导入，不能用 require
import typescript from '@rollup/plugin-typescript';

export default {
  // 源码是 TS，入口改成 index.ts
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: './lib/2026-mini-vue3.cjs.js'
    },
    {
      format: 'esm',
      file: './lib/2026-mini-vue3.esm.js'
    }
  ],
  plugins: [typescript()]
};