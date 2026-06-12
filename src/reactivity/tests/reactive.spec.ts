import { isReactive, isReadonly, reactive, shallowReadonly } from "../reactive"

describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
  })
  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)

  })
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