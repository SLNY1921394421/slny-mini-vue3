安装rollup

```
yarn add rollup
```

项目中添加rollu.config.js ，安装@rollup/plugin-typescript

```
yarn add -D @types/rollup__plugin-typescript
```



```
import typeScript from '@rollup/plugin-typescript'
export default {
	input: './src/index.ts',// src/index.ts整个文件人出口
	outPut: [
	//cjs--commonjs
	//esm
	
		{
			format: 'cjs',
			file: 'lib/2026-mini-vue3.cjs.js'
		},
		{
		format: 'esm',
		file: 'lib/2016-mini-vue3-.esm.js'
		}
	],
	// 安装@rollup/plugin-typescript
	plugins: [trpescript()]
}

export default {
  input: './src/index.js',
  output: [
    {
      format: 'cjs',
      file: './lib/2026-mini-vue3.cjs.js'
    },
    {
      format: 'esm',
      file: './lib/2026-mini-vue3.esm.js'
    }
  ]
}
```

pack.json中加配置

```
"scripts": {
	"build": "rollup -c rollup.config.js"
}
```

添加tslib

```
yarn add tslib --dev
```

tsconfig修改

```
"module": 'esnext'
```

src/index.ts

```
export * from './runtime-core'
```

runtime-core/index

```
export { createApp } from './createApp';
export { h } from './h'
```

h.ts

```
import { createVnode } from "./vnode";

export function h(type, props?, children?) {
  return createVnode(type, props, children)
}
```

main.js

```
import App from "./App";
import { createApp } from '../lib/2026-mini-vue3.esm'
const rootContainer = document.querySelector('#root')
createApp(App).mount(rootContainer)
```

h.ts

```
import { } from '../lib/2026-mini-vue3.esm'
export default {
  render() {
    return h('div', `hello ${this.msg}`)
  },
  setup(props) {
    return {
      msg: 'mini-vue'
    }
  }
}
```

package.json

```
"main": "lib/2026-mini-vue3.cjs.js",
"module": "lib/2026-mini-vue3.esm.js",
```







