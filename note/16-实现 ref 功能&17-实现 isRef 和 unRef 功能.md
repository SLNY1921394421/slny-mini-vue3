ref.ts

```
// 1. 导入工具方法
import { hasChanged, isObject } from "../shared";
// 导入依赖收集、触发更新
import { isTracking, trackEffects, triggerEffect } from "./effect";
// 导入 reactive 和 标记
import { reactive, ReactiveFlag } from "./reactive";

// 2. ref 核心类（真正的 ref 对象）
class RefImpl {
  private _value: any;       // 响应式的值（对象会变成 reactive）
  private _rawValue: any;    // 原始值（用来对比是否变化）
  private dep = new Set()    // 依赖容器：存储所有 effect

  // 构造函数：创建 ref 时执行
  constructor(value) {
    this._rawValue = value   // 保存用户传入的原始值
    this._value = convert(value) // 把值转成响应式
  }

  // 3. getter：访问 .value 时触发
  get value() {
    trackRefValue(this)     // 收集依赖
    return this._value      // 返回内部值
  }

  // 4. setter：修改 .value 时触发
  set value(newValue) {
    // 判断值是否真的改变
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue    // 更新原始值
      this._value = convert(newValue) // 更新响应式值
      triggerEffect(this.dep)     // 触发所有依赖更新
    }
  }
}

// 5. 收集 ref 依赖（核心）
function trackRefValue(ref) {
  isTracking() && trackEffects(ref.dep)
}

// 6. 转换函数：对象 → reactive，基础类型不变
function convert(value) {
  return isObject(value) ? reactive(value) : value
}

// 7. 给所有 ref 打标记：__v_isRef = true
Object.defineProperty(RefImpl.prototype, ReactiveFlag.IS_REF, {
  value: true
})

// 8. 判断是否是 ref
export function isRef(ref) {
  return !!(ref && ref[ReactiveFlag.IS_REF])
}

// 9. 解包 ref：是 ref 就返回 .value，否则返回自身
export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}

// 10. 对外 API：创建 ref
export function ref(value) {
  return new RefImpl(value)
}
```

effect.ts重构一下

```
export function track(target: object, key: string | symbol) {
  // 没有正在运行的 effect，不收集依赖
  if (!isTracking()) return

  // 1. 找对象对应的 depsMap，没有就新建
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 2. 找属性对应的 dep（effect 集合），没有就新建
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  trackEffects(dep)

}
export function trackEffects(dep) {
  // 3. 把当前 effect 加入依赖集合
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target: object, key: string | symbol) {
  // 1. 找对象对应的 depsMap
  let depsMap = targetMap.get(target)
  if (!depsMap) return

  // 2. 找属性对应的所有依赖
  let dep = depsMap.get(key)
  triggerEffect(dep)

}
export function triggerEffect(dep) {
  if (!dep) return

  // 3. 遍历并执行所有 effect
  for (const effect of dep) {
    if (effect.active) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }

  }
}
```







测试用例

```

import { effect } from "../effect"
import { isReactive } from "../reactive"
import { isRef, ref, unref } from "../ref"

// 分组测试 ref 功能
describe("ref", () => {
  // 1. 基础功能：创建 ref
  it("should create a ref", () => {
    const r = ref(100)
    expect(r.value).toBe(100)
  })

  // 2. 响应式：修改 .value 能触发 effect
  it("should be reactive", () => {
    const r = ref(0)
    let dummy

    effect(() => {
      dummy = r.value
    })

    expect(dummy).toBe(0)
    r.value = 1
    expect(dummy).toBe(1)
  })

  // 3. 传入对象 → 自动变成 reactive
  it("should convert object to reactive", () => {
    const r = ref({ count: 1 })
    expect(isReactive(r.value)).toBe(true)
  })

  // 4. isRef 判断 ref
  it("should work with isRef", () => {
    const r = ref(1)
    expect(isRef(r)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(null)).toBe(false)
  })

  // 5. unref 自动解包
  it("should work with unref", () => {
    const r = ref(123)
    expect(unref(r)).toBe(123)
    expect(unref(456)).toBe(456)
  })

  // 6. 值没变化 → 不触发更新
  it("should not trigger when value not changed", () => {
    const r = ref(1)
    let dummy

    effect(() => {
      dummy = r.value
    })

    r.value = 1 // 赋值一样
    expect(dummy).toBe(1) // 没变
  })
})
```

