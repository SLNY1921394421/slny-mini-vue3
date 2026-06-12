import { isReactive, reactive, readonly } from "../reactive"
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { })
})

afterAll(() => {
  jest.spyOn(console, 'warn').mockRestore()
})



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

  it('should make nested objects reactive', () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})