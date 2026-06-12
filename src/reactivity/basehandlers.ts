// basehandlers.ts
import { isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlag, readonly } from "./reactive"

const get = createGetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

/**
 * @param isReadonly 是否只读
 * @param shallow 是否浅层（不递归）
 */
function createGetter(isReadOnly = false, shallow = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadOnly
    }
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadOnly
    }
    if (key === ReactiveFlag.RAW) {
      return target
    }
    const res = Reflect.get(target, key, receiver)

    if (!isReadOnly) {
      track(target, key)
    }
    if (shallow) return res
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set: createSetter()
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    return true
  }
}
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: readonlyHandlers.set
}