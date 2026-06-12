**stop()**

作用：**停止当前 effect 的响应式**

让 effect **不再因为数据变化而自动执行**

= **解除依赖收集 + 取消自动更新**

------

# 二、**stop 核心原理**

1. effct 执行时，会收集它**依赖了哪些属性**（dep）
2. 同时，每个 dep 也会记录**有哪些 effect 依赖它**（反向收集）
3. **stop () 就是把 effect 从所有依赖的 dep 中删除**
4. 删除后，数据更新就**再也找不到这个 effect 了**

测试用例

```
it('stop', () => {
  let foo = 10
  const runner = effect(() => {
    foo++
  })

  expect(foo).toBe(11)

  // 调用 stop
  stop(runner)

  // 触发响应式更新（但 effect 已停止，不会执行）
  trigger({}, 'dummy') // 随便触发一次，模拟数据变化

  // foo 应该保持不变
  expect(foo).toBe(11)

  // 手动调用 runner 仍然可以执行
  runner()
  expect(foo).toBe(12)
})
```



```
class ReactiveEffect {
  private _fn: () => void
  public scheduler: () => void
  // ========== 新增 1：支持 stop 需要的属性 ==========
  public deps: Set<ReactiveEffect>[] = [] // 存储所有依赖集合
  public active = true // 是否激活（stop 后变为 false）

  constructor(fn: () => void, scheduler?: () => void) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    // ========== 新增 2：stop 后不收集依赖，但仍可手动执行 ==========
    if (!this.active) {
      return this._fn()
    }

    activeEffect = this
    const res = this._fn()
    activeEffect = null
    return res
  }

  // ========== 新增 3：stop 核心方法 ==========
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

// ========== 新增 4：清空 effect 所有依赖 ==========
function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

let activeEffect: ReactiveEffect | null = null
let targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>()

export function track(target: object, key: string | symbol) {
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

  dep.add(activeEffect)
  // ========== 新增 5：双向记录（effect 记住自己属于哪些 dep）==========
  activeEffect.deps.push(dep)
}

export function trigger(target: object, key: string | symbol) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return

  let dep = depsMap.get(key)
  if (!dep) return

  for (const effect of dep) {
    // ========== 新增 6：只执行激活的 effect ==========
    if (effect.active) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  }
}

export function effect(fn: () => void, options: any = {}) {
  const _effect = new ReactiveEffect(fn)
  
  // ========== 新增 7：把 stop 挂到 runner 上（和 Vue 一致）==========
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  _effect.run()
  return runner
}

// ========== 新增 8：对外 stop 方法 ==========
export function stop(runner: any) {
  runner.effect.stop()
}
```

