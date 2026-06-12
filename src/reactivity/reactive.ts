import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./basehandlers"
export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw',
  IS_REF = '__v_isRef'
}

export function reactive<T extends object>(target: T) {
  return createActiveObject(target, mutableHandlers)
}
export function readonly(target) {
  return createActiveObject(target, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createActiveObject(target, shallowReadonlyHandlers)
}

export function isReactive(value) {
  if (!value) return false
  if (value[ReactiveFlag.IS_READONLY]) {
    return isReactive(value[ReactiveFlag.RAW])
  }
  return !!value[ReactiveFlag.IS_REACTIVE]
}
export function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
function createActiveObject(target, basehandlers) {
  return new Proxy(target, basehandlers)
}