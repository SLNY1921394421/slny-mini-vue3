1.初始化
```
yarn init -y
// 集成tsc
tsc --init
// 安装typescript
yarn add typescript --dev
// 添加jest
yarn add jest @types/jest --dev
// 在tsconfig.js中的type加”jest“
type: ["jest"]
//package.json中配置jest
"scripts": {
    "test": "jest"
  },
// 安装jest的babel 
yarn add --dev babel-jest @babel/core @babel/preset-env
yarn add --dev @babel/preset-typescript
// 新建babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};
```

