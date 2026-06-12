import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffect } from "./effect";
import { reactive, ReactiveFlag } from "./reactive";

class RefImpl {
  private _value: any;
  private _rawValue: any;
  private dep = new Set()
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffect(this.dep)
    }

  }
}
function trackRefValue(ref) {
  isTracking() && trackEffects(ref.dep)
}
function convert(value) {
  return isObject(value) ? reactive(value) : value
}
Object.defineProperty(RefImpl.prototype, ReactiveFlag.IS_REF, {
  value: true
})

export function isRef(ref) {
  return !!(ref && ref[ReactiveFlag.IS_REF])
}
export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}

export function ref(value) {
  return new RefImpl(value)
}
export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key) {
      return unref(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)

      }
    }
  })
}