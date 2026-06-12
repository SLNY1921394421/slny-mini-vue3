effect.ts

```
function isTracking() {
  return shouldTrack && activeEffect !== null
}

class ReactiveEffect的run加上
run() {
    // 每次 run 都开启收集
    shouldTrack = true
    activeEffect = this
  }
track最前面判断
if (!isTracking()) return
```





bf

```

/**
 effect runner /scheduler/stop 
 /readonly/isReactive /isReadonly/ 嵌套对象 
 /shallowReadonly/isProxy /ref/isRef /unref/proxyRefs /computed
 */
const enum ReactiveFlag {
  IS_READONLY = '__v_isReadonly',
  IS_Reactive = '__v_isReactive',
  RAW = '__v_Raw'
}
let shouldTack = false
export function reactive(target) {
  return createActiveObject(target, mutableHandles)
}
let activeEffect = null
let targetMap = new WeakMap()
function track(target, key) {
  if (!activeEffect || isTracking()) return
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
  activeEffect.deps.push(dep)
}
function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (dep) {
    for (const effect of dep) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }

    }
  }
}
class ReactiveEffect {
  private _fn: any;
  private scheduler;
  public isActive = true
  public deps = []
  constructor(fn, scheduler) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    if (!this.isActive) {
      return this._fn()
    }
    shouldTack = true
    activeEffect = this
    this._fn()
    activeEffect = null
  }
  stop() {
    if (this.isActive) {
      cleanupEffect(this)
      this.isActive = false
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach(dep => {
    dep.delete(effect)
  });
  effect.deps.length = 0
}
export function effect(fn, options?) {
  let _effect = new ReactiveEffect(fn, options?.scheduler)
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  runner()
  return runner
}
export function stop(runner) {
  runner.effect.stop()
}
export function readonly(target) {
  return createActiveObject(target, readonlyHandlers)
}
const mutableHandles = {
  get: createGetter(),
  set: createSetter()
}
const readonlyHandlers = {
  get: createGetter(true),
  set(target, key, value) {
    console.warn(`${target}is readonly`)
    return false
  }
}
function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly
    }
    if (key === ReactiveFlag.IS_Reactive) {
      return !isReadonly
    }
    if (key === ReactiveFlag.RAW) {
      return target
    }
    let res = Reflect.get(target, key)
    if (!isReadonly) { track(target, key) }
    return res
  }
}
function createSetter() {
  return function set(target, key, value) {
    let res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}
function createActiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers)
}
function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY]
}
function isReactive(value) {
  return !!value[ReactiveFlag.IS_Reactive]
}
function isTracking() {
  return shouldTack && activeEffect !== null
}
```

