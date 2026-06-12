**scheduler = 调度器**

作用：**控制 effect 触发更新时，什么时候执行、怎么执行、以什么方式执行**。

- 不使用 scheduler → **数据一变，effect 立刻同步执行**
- 使用 scheduler → **effect 不再直接执行，而是交给 scheduler 决定何时执行**



### 1. ReactiveEffect 类里加 scheduler

```
class ReactiveEffect {
  private _fn: () => void
  public scheduler?: () => void // 加这行

  constructor(fn, scheduler?) { // 接收 scheduler
    this._fn = fn
    this.scheduler = scheduler // 存起来
  }

  run() {
    activeEffect = this
    this._fn()
    activeEffect = null
  }
}
```

### 2. effect 函数接收 options（scheduler）

```typescript
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  const runner = _effect.run.bind(_effect)
  _effect.run()
  return runner
}
```

### 3. trigger 里判断 scheduler（最重要）

```
export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (!dep) return

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler() // 有 scheduler 就走它
    } else {
      effect.run() // 没有就正常执行
    }
  }
}
```

#### 测试用例

```typescript
 // 👇 这就是你要的 scheduler 测试（必写）
  it("should support scheduler", () => {
    const obj = reactive({ foo: 1 });
    let dummy;
    // 用来判断 scheduler 是否被调用
    let schedulerRunTimes = 0;

    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        // 调度器
        scheduler() {
          schedulerRunTimes++;
        },
      }
    );

    // 1. 初始化时，scheduler 不执行，fn 执行
    expect(dummy).toBe(1);
    expect(schedulerRunTimes).toBe(0);

    // 2. 修改响应式数据 → 触发 trigger
    obj.foo = 2;

    // 3. 关键：不会自动执行 fn，而是执行 scheduler
    expect(dummy).toBe(1); // 数据没变
    expect(schedulerRunTimes).toBe(1); // scheduler 执行了

    // 4. 手动调用 runner，才会执行 fn
    runner();
    expect(dummy).toBe(2);
  });
```







]]