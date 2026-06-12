import { extend } from "../shared";

let reactiveEffect;
let shouldTrack;


export class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    reactiveEffect = this

    const result = this._fn()
    shouldTrack = false

    return result
  }
  stop() {
    // this.deps.forEach((dep: any) => {
    // 	dep.delete(this)
    // })
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop()
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  });
  effect.deps.length = 0;
}


export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop;
  // Object.assign(_effect, options)
  extend(_effect, options)
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 收集依赖
const targetMap = new Map();

export function track(target, key) {
  if (!isTracking()) return
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

  trackEffects(dep);
  // const deps = depsMap.get(key)
}

export function trackEffects(dep) {
  if (dep.has(reactiveEffect)) return;

  dep.add(reactiveEffect)
  reactiveEffect.deps.push(dep)
}

export function isTracking() {
  return reactiveEffect && shouldTrack !== undefined
}

// 触发依赖
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key)
  triggerEffect(dep);
}

export function triggerEffect(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run();
    }
  }
};

export function stop(runner) {
  runner.effect.stop()
}