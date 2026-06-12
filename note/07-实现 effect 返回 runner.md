##### runner 就是一个永久绑定了 this 的副作用执行函数

##### 它是 effect.run() 方法的副本，可以被外部随时手动调用

```
//测试
it('runner', () => {
    let foo = 10
    const runner = effect(() => {
      foo++;
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })
})
```

```
class ReactiveEffect {
  private _fn: () => void
  constructor(fn: () => void) {
    this._fn = fn
  }
  run() {
    // 标记当前正在运行的 effect，供 track 收集依赖
    activeEffect = this
    const res = this._fn()
    // 执行完清空，避免无关的 get 误收集
    activeEffect = null
    return res
  }
}

export function effect(fn: () => void) {
  // 创建 effect 实例并首次执行（触发 track 收集）
  let _effect = new ReactiveEffect(fn)
  const runner = _effect.run.bind(_effect)
  _effect.run()
  return runner
}
```

