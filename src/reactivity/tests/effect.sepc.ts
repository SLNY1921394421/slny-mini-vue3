import { effect, trigger, stop } from "../effect";
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
  it('runner', () => {
    let foo = 10
    const runner = effect(() => {
      foo++;
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })
  it("should support scheduler", () => {
    const obj = reactive({ foo: 1 });
    let dummy;
    // 用来判断 scheduler 是否被调用
    let schedulerRunTimes = 0;

    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        // 调度器
        scheduler() {
          schedulerRunTimes++;
        },
      }
    );

    // 1. 初始化时，scheduler 不执行，fn 执行
    expect(dummy).toBe(1);
    expect(schedulerRunTimes).toBe(0);

    // 2. 修改响应式数据 → 触发 trigger
    obj.foo = 2;

    // 3. 关键：不会自动执行 fn，而是执行 scheduler
    expect(dummy).toBe(1); // 数据没变
    expect(schedulerRunTimes).toBe(1); // scheduler 执行了

    // 4. 手动调用 runner，才会执行 fn
    runner();
    expect(dummy).toBe(2);
  });
  it('stop1', () => {
    let foo = 10
    const runner = effect(() => {
      foo++
    })

    expect(foo).toBe(11)

    // 调用 stop
    stop(runner)


    // 触发响应式更新（但 effect 已停止，不会执行）
    trigger({}, 'dummy') // 随便触发一次，模拟数据变化

    // foo 应该保持不变
    expect(foo).toBe(11)

    // 手动调用 runner 仍然可以执行
    runner()
    expect(foo).toBe(12)
  })
  it('stop', () => {
    let dummy;
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop++
    expect(dummy).toBe(2)
  })
})