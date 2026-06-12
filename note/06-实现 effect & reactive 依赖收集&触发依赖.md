 tsconfig.js中lib中增加``` "lib":["DOM","es6"]```



```
// 定义一个类：代表一个「响应式副作用」
// 简单说：就是一个需要在数据变化时重新执行的函数
class ReactiveEffect {
  // 私有变量：存储用户传入的函数
  private _fn: () => void

  // 构造函数：接收一个函数并保存
  constructor(fn: () => void) {
    this._fn = fn
  }

  // 执行副作用函数的方法
  run() {
    // 1. 把当前实例赋值给全局 activeEffect
    // 作用：告诉 track 现在正在收集哪个依赖
    activeEffect = this

    // 2. 执行用户传入的原始函数，并返回结果
    const res = this._fn()

    // 3. 执行完清空全局标记
    activeEffect = null

    // 返回执行结果
    return res
  }
}

// 全局变量：记录**当前正在运行**的 ReactiveEffect 实例
// 依赖收集时，就是把这个变量存起来
let activeEffect: ReactiveEffect | null = null

// 全局的「依赖地图」：存储所有对象的所有依赖关系
// 结构：
// targetMap (WeakMap) => {
//   目标对象: depsMap (Map) => {
//     key: dep (Set) => [effect1, effect2...]
//   }
// }
---------------------------------------------------------
/** 
 targetMap  (第一层：存所有对象)
   ↓
{
  【对象A】: depsMap (第二层：存对象的所有key)
        ↓
      {
        【key1】: dep (第三层：存所有用到它的函数)
              ↓
            [ effect1, effect2... ]

        【key2】: dep
              ↓
            [ effect3 ]
      }
}


 */
----------------------------------------------------------
let targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>()

// ==================== 依赖收集 track ====================
// 作用：当**读取数据**时，把当前 effect 存进依赖地图
export function track(target: object, key: string | symbol) {
  // 如果没有正在运行的 effect，不收集
  if (!activeEffect) return

  // 1. 从 targetMap 中取出当前对象的依赖 Map
  let depsMap = targetMap.get(target)

  // 2. 如果没有，就创建一个新的 Map 存进去
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))

  // 3. 从依赖 Map 中取出当前 key 对应的依赖 Set
  let dep = depsMap.get(key)

  // 4. 如果没有，就创建一个新的 Set
  if (!dep) depsMap.set(key, (dep = new Set()))

  // 5. 把当前正在运行的 effect 添加到依赖里
  dep.add(activeEffect)
}

// ==================== 触发更新 trigger ====================
// 作用：当**修改数据**时，把这个 key 对应的所有 effect 全部执行一遍
export function trigger(target: object, key: string | symbol) {
  // 1. 取出当前对象的依赖 Map
  let depsMap = targetMap.get(target)

  // 没有依赖，直接返回
  if (!depsMap) return

  // 2. 取出当前 key 对应的依赖 Set
  let dep = depsMap.get(key)

  // 3. 如果有依赖，遍历执行所有 effect
  if (dep) {
    for (const effect of dep) {
      effect.run()
    }
  }
}

// ==================== 入口函数 effect ====================
// 用户调用的 API：把一个函数变成响应式函数
export function effect(fn: () => void) {
  // 创建 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)

  // 立即执行一次（执行时会触发 track 收集依赖）
  _effect.run()
}
```

active.ts

```
import { trigger, track } from "./effect"
export function reactive<T extends object>(target: T) {
  return new Proxy(target, {
    get(target, key) {
      const res = Reflect.get(target, key)
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  })
}
```

effect.test.ts

```
import { effect } from "../effect";
import { reactive } from "../reactive";

describe('effect', () => {
  it.skip("happy path", () => {
    const user = reactive({
      age: 10
    })
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    user.age++
    expect(user.age).toBe(12)
  })
})
```

active.test.ts

```
import { reactive } from "../reactive"

describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
  })
})
```

