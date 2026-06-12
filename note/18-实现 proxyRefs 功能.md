

proxyRefs

```
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
```

测试用例

```

import { effect } from "../effect"
import { isReactive, reactive } from "../reactive"
import { isRef, proxyRefs, ref, unref } from "../ref"

// 分组测试 ref 功能
describe("ref", () => {
  // 1. 基础功能：创建 ref
  it("should create a ref", () => {
    const r = ref(100)
    expect(r.value).toBe(100)
  })

  // 2. 响应式：修改 .value 能触发 effect
  it("should be reactive", () => {
    const r = ref(0)
    let dummy

    effect(() => {
      dummy = r.value
    })

    expect(dummy).toBe(0)
    r.value = 1
    expect(dummy).toBe(1)
  })

  // 3. 传入对象 → 自动变成 reactive
  it("should convert object to reactive", () => {
    const r = ref({ count: 1 })
    expect(isReactive(r.value)).toBe(true)
  })

  // 4. isRef 判断 ref
  it("should work with isRef", () => {
    const r = ref(1)
    expect(isRef(r)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(null)).toBe(false)
  })

  // 5. unref 自动解包
  it("should work with unref", () => {
    const r = ref(123)
    expect(unref(r)).toBe(123)
    expect(unref(456)).toBe(456)
  })

  // 6. 值没变化 → 不触发更新
  it("should not trigger when value not changed", () => {
    const r = ref(1)
    let dummy

    effect(() => {
      dummy = r.value
    })

    r.value = 1 // 赋值一样
    expect(dummy).toBe(1) // 没变
  })


})
describe("proxyRefs", () => {
  // 1. get 操作：自动解包 ref
  it("proxyRefs get auto unwrap ref", () => {
    const count = ref(10);
    // 包装成 proxy
    const proxy = proxyRefs({ count });

    // 不用 .value！
    expect(proxy.count).toBe(10);
    expect(isRef(proxy.count)).toBe(false);
  });

  // 2. set 操作：自动修改 ref.value
  it("proxyRefs set auto update ref.value", () => {
    const count = ref(10);
    const proxy = proxyRefs({ count });

    // 直接赋值，自动修改 .value
    proxy.count = 20;

    expect(count.value).toBe(20);
    expect(proxy.count).toBe(20);
  });

  // 3. 普通属性不受影响
  it("proxyRefs normal value", () => {
    const proxy = proxyRefs({ name: "zhangsan" });

    expect(proxy.name).toBe("zhangsan");
    proxy.name = "lisi";
    expect(proxy.name).toBe("lisi");
  });

  // 4. 赋值为新 ref → 正常替换
  it("proxyRefs set to a new ref", () => {
    const proxy = proxyRefs({ count: ref(1) });

    // 赋值成新 ref
    proxy.count = ref(100);

    expect(isRef(proxy.count)).toBe(false); // get 自动解包
    expect(unref(proxy.count)).toBe(100);
  });

  // 5. 嵌套 reactive + ref 正常工作
  it("proxyRefs with reactive object", () => {
    const user = reactive({
      age: ref(18),
    });
    const proxy = proxyRefs(user);

    expect(proxy.age).toBe(18);
    proxy.age = 20;
    expect(user.age.value).toBe(20);
  });

  // 6. 响应式依然生效（effect 正常触发）
  it("proxyRefs should trigger effect", () => {
    const count = ref(0);
    const proxy = proxyRefs({ count });
    let dummy;

    effect(() => {
      dummy = proxy.count;
    });

    expect(dummy).toBe(0);
    proxy.count = 5;
    expect(dummy).toBe(5);
  });
});
```

