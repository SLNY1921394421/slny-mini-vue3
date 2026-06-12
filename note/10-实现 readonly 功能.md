新建basehandlers.ts

```
// basehandlers.ts
import { track, trigger } from "./effect"

const get = createGetter()
const readonlyGet = createGetter(true)

function createGetter(isReadOnly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    // ✅ 修正：只有非只读才收集依赖
    if (!isReadOnly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
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
```

reactive.ts

```
import { mutableHandlers, readonlyHandlers } from "./basehandlers"

export function reactive<T extends object>(target: T) {
  return createActiveObject(target, mutableHandlers)
}
export function readonly(target) {
  return createActiveObject(target, readonlyHandlers)
}
function createActiveObject(target, basehandlers) {
  return new Proxy(target, basehandlers)
}
```

测试用例

```
import { readonly } from "../reactive"

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    // 1. 创建 readonly 对象
    const wrapped = readonly(original)

    // 2. 期望：和原对象不是同一个
    expect(wrapped).not.toBe(original)

    // 3. 期望：可以读取值
    expect(wrapped.foo).toBe(1)
  })

  // 重点：readonly 核心 —— 不能被修改！
  it('warn when set', () => {
    const wrapped = readonly({ foo: 1 })

    // 尝试修改 → 应该失败/警告
    wrapped.foo = 2

    // 期望：值还是原来的，没有被改掉
    expect(wrapped.foo).toBe(1)
  })
})
```

//bf

```
export function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      let res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, value) {
      let res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  })
}
let activeEffect = null
let targetMap = new WeakMap()
function track(target: any, key: string | symbol) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }

}
function trigger(target: any, key: string | symbol) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (dep) {
    for (const effect of dep) {
      if (effect.scheduler) {
        effect.scheduler(effect)
      } else {
        effect.run()
      }
    }
  }
}
export function effect(fn, options: any = {}) {
  let _effect = new ReactiveEffect(fn, options.scheduler)
  let runner = _effect.run.bind(_effect)
  runner()
  runner.effect = _effect
  return runner
}
class ReactiveEffect {
  private _fn: any
  public scheduler?: any
  public deps = []
  constructor(fn, scheduler?) {
    this.scheduler = scheduler
    this._fn = fn
  }
  run() {
    cleanupEffect(this)
    activeEffect = this
    const res = this._fn()
    activeEffect = null
    return res
  }
}

export function stop(runner) {
  cleanupEffect(runner.effect)
}
function cleanupEffect(effect) {
  effect.deps.forEach(dep => dep.delete(effect))
  effect.deps.length = 0
}
```

