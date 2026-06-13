// ESM 标准导入，不能用 require
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

// 读取 package.json
const pkgUrl = new URL('./package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(fileURLToPath(pkgUrl), 'utf-8'))
export default {
  // 源码是 TS，入口改成 index.ts
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'esm',
      file: pkg.module
    }
  ],
  plugins: [typescript()]
};