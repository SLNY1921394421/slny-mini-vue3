要实现 `shallowReadonly`，核心就是：**只读 + 不递归（不把内层对象再变成 readonly）**。下面我直接把你现有代码改好，包含：

1. `createGetter` 增加 `shallow` 参数
2. 新增 `shallowReadonlyHandlers`
3. 导出 `shallowReadonly`
4. 给你对应的测试用例



## 一、改造 `baseHandlers.ts`（关键）

### 1）给 `createGetter` 加 `shallow` 参数

```
// baseHandlers.ts
import { ReactiveFlag, reactive, readonly } from './reactive'
import { track, trigger } from './effect'
import { isObject } from '../shared/index'

// 四种 get
const get = createGetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true) // 只读 + 浅层

/**
 * @param isReadonly 是否只读
 * @param shallow 是否浅层（不递归）
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly
    }
    if (key === ReactiveFlag.RAW) {
      return target
    }

    const res = Reflect.get(target, key, receiver)

    // 只读不收集依赖
    if (!isReadonly) {
      track(target, key)
    }

    // 浅层：直接返回，不递归代理
    if (shallow) {
      return res
    }

    // 深层：对象/数组继续 reactive/readonly
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set: createSetter()
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    return true
  }
}

// shallowReadonly 处理器：set 和 readonly 一样，get 用 shallowReadonlyGet
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: readonlyHandlers.set
}
```


## 二、在 `reactive.ts` 里实现 `shallowReadonly`

```
// reactive.ts
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

export const ReactiveFlag = {
  IS_REACTIVE: '__v_isReactive',
  IS_READONLY: '__v_isReadonly',
  RAW: '__v_raw'
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlag.IS_REACTIVE])
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlag.IS_READONLY])
}

export function reactive(target) {
  return createReactiveObject(target, mutableHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers)
}

// 新增：shallowReadonly
export function shallowReadonly(target) {
  return createReactiveObject(target, shallowReadonlyHandlers)
}

function createReactiveObject(target, baseHandler) {
  return new Proxy(target, baseHandler)
}
```


## 三、行为总结（和 readonly 对比）

- `readonly(obj)`：**深层只读**
  - 所有层级属性都不能改
  - 内层对象自动变成 readonly
- `shallowReadonly(obj)`：**浅层只读**
  - 仅**根属性**不能改
  - 内层对象**不代理、不改写**，可以正常修改

示例：

```
const state = shallowReadonly({
  foo: 1,
  nested: { bar: 2 }
})

state.foo = 10 // ❌ 警告，改不了
state.nested.bar = 20 // ✅ 可以改
```

## 四、测试用例（可直接放进 `reactive.spec.ts`）

```
import { shallowReadonly, isReadonly } from '../reactive'

describe('shallowReadonly', () => {
  it('should make root level readonly, but nested not', () => {
    const original = { foo: 1, nested: { bar: 2 } }
    const wrapped = shallowReadonly(original)

    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.nested)).toBe(false) // 关键：内层不是只读
  })

  it('should warn when setting root property', () => {
    console.warn = jest.fn()
    const wrapped = shallowReadonly({ foo: 1 })
    wrapped.foo = 2
    expect(console.warn).toHaveBeenCalled()
  })

  it('should NOT warn when setting nested property', () => {
    console.warn = jest.fn()
    const wrapped = shallowReadonly({ nested: { bar: 1 } })
    wrapped.nested.bar = 2
    expect(console.warn).not.toHaveBeenCalled()
  })
})
```