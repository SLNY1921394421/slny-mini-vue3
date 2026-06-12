

# readonly 是什么？（人话定义）

**readonly = 只读的响应式对象**

- **能依赖收集（track）**
- **不能修改（set 时直接报错 / 拦截）**
- **深层只读（递归）**
- 和 `reactive` 共用一套 `track/trigger` 体系

------

# 二、readonly 核心原理

1. 基于 **Proxy** 实现
2. **get**：正常返回值 + 执行 `track` 收集依赖
3. **set**：**禁止修改**，返回 false 或抛错
4. 递归处理子对象，实现**深度只读**

reactive.ts

```
export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw'
}

export function isReactive(value) {
  if (!value) return false
  if (value[ReactiveFlag.IS_READONLY]) {
    return isReactive(value[ReactiveFlag.RAW])
  }
  return !!value[ReactiveFlag.IS_REACTIVE]
}
```

baseHandlers.ts

```
function createGetter(isReadOnly = false) {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadOnly
    }
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadOnly
    }
    if (key === ReactiveFlag.RAW) {
      return target
    }
    const res = Reflect.get(target, key)
    if (!isReadOnly) {
      track(target, key)
    }
    return res
  }
}
```

