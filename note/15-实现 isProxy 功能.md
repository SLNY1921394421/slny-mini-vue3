# 实现 `isProxy` 功能（超级简单，1 分钟搞定）

`isProxy` 的作用只有一句话：

**判断一个对象是不是 `reactive` / `readonly` / `shallowReadonly` 创建的代理对象**

## 一、直接在 `reactive.ts` 里加代码

就在你现有的 `isReactive`、`isReadonly` 下面加：
```
// 已经有的
export function isReactive(value) {
  return !!(value && value[ReactiveFlag.IS_REACTIVE])
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlag.IS_READONLY])
}

// ======================
// 新增：isProxy
// ======================
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
```
### 原理

- `isReactive` → 检查是不是 `reactive`
- `isReadonly` → 检查是不是 `readonly / shallowReadonly`
- **`isProxy` = 满足其中一个就返回 true**

完美对应 Vue3 源码逻辑！

## 二、完整测试用例（直接复制可用）


```
import { reactive, readonly, shallowReadonly, isProxy } from '../reactive'

describe('isProxy', () => {
  it('should return true for reactive', () => {
    const obj = reactive({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return true for readonly', () => {
    const obj = readonly({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return true for shallowReadonly', () => {
    const obj = shallowReadonly({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return false for plain object', () => {
    const obj = {}
    expect(isProxy(obj)).toBe(false)
  })
})
```