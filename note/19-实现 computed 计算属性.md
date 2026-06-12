# **computed 实现**（基于你的 effect + ref）

# 一、先讲 computed 原理（10 秒懂）

computed 就是：

1. **带缓存的 effect**
2. 依赖不变 → **直接返回缓存**
3. 依赖变了 → **重新计算**
4. 用起来像 `ref`（有 `.value`）



# 二、完整 computed.ts 代码（直接新建）
```
// 导入 effect 核心类（用来监听依赖变化）
import { ReactiveEffect } from "./effect"

// computed 内部实现类（计算属性的本体）
class ComputedRefImpl {
  // 保存用户传入的计算函数：() => count.value + 1
  private _getter: any

  // 保存创建出来的 effect（依赖变化会通知它）
  private _effect: ReactiveEffect

  // 缓存标志：
  // true  = 需要重新计算（数据脏了）
  // false = 使用缓存（数据干净）
  private dirty: boolean = true

  // 缓存上一次的计算结果
  private _value: any

  // 构造函数：创建 computed 时执行
  constructor(getter) {
    // 1. 把用户的计算函数存起来
    this._getter = getter

    // 2. 创建一个 ReactiveEffect
    // 第一个参数：getter 计算函数
    // 第二个参数：scheduler（依赖变化时触发的回调）
    this._effect = new ReactiveEffect(getter, () => {
      // 当依赖变化时：
      // 如果当前不是脏的，才标记成脏的
      if (!this.dirty) {
        this.dirty = true
      }
    })
  }

  // 访问 computed.value 时触发
  get value() {
    // 如果是脏的 → 重新计算
    if (this.dirty) {
      // 标记为干净（下次用缓存）
      this.dirty = false

      // 执行 effect.run() → 执行 getter，收集依赖，返回结果
      this._value = this._effect.run()
    }

    // 返回缓存的值
    return this._value
  }
}

// 对外 API：使用方式 computed(() => { ... })
export function computed(getter) {
  return new ComputedRefImpl(getter)
}
```
# 四、单元测试
```
import { computed } from "../computed";
import { reactive } from "../reactive"

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({ age: 1 });
    const age = computed(() => {
      return user.age
    });
    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
})
```