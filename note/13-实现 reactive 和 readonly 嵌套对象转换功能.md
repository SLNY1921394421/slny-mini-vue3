测试用例

```
it("nested reactive", () => {
  const original = {
    nested: { foo: 1 },
    arr: [{ bar: 2 }]
  }
  const observed = reactive(original)

  expect(isReactive(observed.nested)).toBe(true)
  expect(isReactive(observed.arr)).toBe(true)
  expect(isReactive(observed.arr[0])).toBe(true)
})
```

baseHandler.ts

```
unction createGetter(isReadOnly = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)

    if (!isReadOnly) {
      track(target, key)
    }

    // ✅ 核心修复：嵌套对象自动转 reactive / readonly
    if (typeof res === 'object' && res !== null) {
      return isReadOnly ? readonly(res) : reactive(res)
    }

    return res
  }
```

