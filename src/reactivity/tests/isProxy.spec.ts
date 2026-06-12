import { reactive, readonly, shallowReadonly, isProxy } from '../reactive'

describe('isProxy', () => {
  it('should return true for reactive', () => {
    const obj = reactive({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return true for readonly', () => {
    const obj = readonly({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return true for shallowReadonly', () => {
    const obj = shallowReadonly({})
    expect(isProxy(obj)).toBe(true)
  })

  it('should return false for plain object', () => {
    const obj = {}
    expect(isProxy(obj)).toBe(false)
  })
})