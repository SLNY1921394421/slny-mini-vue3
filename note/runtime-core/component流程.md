```
1. 执行 createApp(App)
   └─ 返回 { mount } 实例对象

2. 执行 实例.mount('#app')
   ├─ 执行 createVnode(App)
   │   └─ 创建 组件VNode（type = 组件对象）
   └─ 执行 render(vnode, #app)
       └─ 执行 patch(vnode, #app)
           ├─ 判断：vnode.type 不是字符串，是对象
           └─ 执行 processComponent(vnode, #app)
               └─ 执行 mountComponent(vnode, #app)
                   ├─ 执行 createComponentInstance(vnode)
                   │   └─ 创建组件实例 instance
                   ├─ 执行 setupComponent(instance)
                   │   ├─ 注释预留：initProps()、initSlot()（未实现）
                   │   └─ 执行 setupStatefulComponent(instance)
                   │       ├─ 取出 instance.type（组件配置）
                   │       ├─ 取出组件内 setup 函数
                   │       ├─ 执行 setup() → 得到 setupResult
                   │       └─ 执行 handleSetupResult(setupResult, instance)
                   │           ├─ 判断：setupResult 是 object
                   │           ├─ 给 instance 挂载 setupState
                   │           └─ 执行 finishComponentSetup(instance)
                   │               ├─ 取出 instance.type（组件配置）
                   │               └─ 把组件 render 赋值给 instance.render
                   └─ 执行 setupRenderEffect(instance, #app)
                       ├─ 执行 instance.render() → 得到元素VNode（type = 字符串）
                       └─ 执行 patch(subTree, #app) 【二次进入patch】
                           ├─ 判断：vnode.type 是字符串
                           └─ 执行 processElement(subTree, #app)
                               ├─ 执行 document.createElement(vnode.type) → 创建真实DOM el
                               ├─ 解构 vnode.props、vnode.children
                               ├─ 判断 children 类型
                               │   ├─ 若为 string：执行 el.textContent = 文本
                               │   └─ 若为 Array：执行 mountChildren(children, container)
                               │       └─ children.forEach 遍历每一个子VNode
                               │           └─ 循环执行 patch(v, container) 【递归渲染子节点】
                               ├─ 遍历 props：for...in 循环
                               │   └─ 执行 el.setAttribute(key, val) 绑定属性
                               └─ 执行 container.append(el) → DOM挂载到页面
```

# 完整调用链路（分步 + 代码 + 变量变化）

## 第 1 步：启动入口 `createApp(App).mount('#app')`

### 1.1 执行 `createApp(App)`

执行代码：

ts









```
// createApp.ts
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 后面才会进到这里
    }
  }
}
```

- 入参 `rootComponent = App`（组件对象，包含 `setup`、`render`）
- **返回值**：一个拥有 `mount` 方法的对象
- 目前只拿到对象，**还没执行任何渲染逻辑**

### 1.2 执行 `.mount('#app')`

调用返回对象上的 `mount` 方法，入参 `rootContainer = #app` 真实 DOM 容器。

进入 `mount` 内部：

ts









```
mount(rootContainer) {
  // ① 创建根组件 VNode
  const vnode = createVnode(rootComponent)
  // ② 启动渲染
  render(vnode, rootContainer)
}
```

#### 1.2.1 执行 `createVnode(App)`

代码：

ts









```
// vnode.ts
export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children
  }
  return vnode
}
```

- 入参：`type = App`（组件对象），`props=undefined`，`children=undefined`

- 生成

  根组件 VNode

  ：

  js

  

  

  

  

  ```
  vnode = {
    type: App,   // 重点：type 是【对象】
    props: undefined,
    children: undefined
  }
  ```

#### 1.2.2 执行 `render(vnode, #app)`

代码：

ts









```
// render.ts
export function render(vnode, container) {
  patch(vnode, container)
}
```

- 直接转发，调用 `patch(vnode, #app容器)`
- 进入**第 2 步：patch 第一次分流**

------

## 第 2 步：第一次 patch（根组件 VNode，type 为对象）

执行 `patch(vnode, container)`：

ts









```
// render.ts
export function patch(vnode, container) {
  // 判断 vnode.type 类型
  if (vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}
```

- 当前 `vnode.type = App`（对象）
- 命中第二个分支：执行 `processComponent(vnode, container)`

### 2.1 执行 `processComponent`

ts









```
// component.ts
export function processComponent(vnode, container) {
  mountComponent(vnode, container)
}
```

直接进入组件挂载核心函数 `mountComponent`。

### 2.2 执行 `mountComponent(vnode, container)`

ts









```
function mountComponent(vnode, container) {
  // 1. 创建组件实例
  const instance = createComponentInstance(vnode)
  // 2. 初始化组件
  setupComponent(instance)
  // 3. 执行 render 并递归渲染
  setupRenderEffect(instance, container)
}
```

分三小步依次执行。

#### 2.2.1 执行 `createComponentInstance(vnode)`

ts









```
function createComponentInstance(vnode) {
  const component = {
    type: vnode.type,
    vnode
  }
  return component
}
```

- 入参：根组件 VNode

- 生成

  组件实例 instance

  （组件的全局上下文）：

  js

  

  

  

  

  ```
  instance = {
    type: App,    // 指向原始组件对象
    vnode: 根组件VNode
  }
  ```

#### 2.2.2 执行 `setupComponent(instance)`

ts









```
function setupComponent(instance) {
  // 预留：后续实现 props、插槽
  // initProps()
  // initSlot()
  setupStatefulComponent(instance)
}
```

直接调用 `setupStatefulComponent(instance)`。

##### 2.2.2.1 执行 `setupStatefulComponent(instance)`

ts









```
function setupStatefulComponent(instance) {
  const component = instance.type; // component = App
  const { setup } = component;     // 取出 App.setup 函数
  
  // 执行用户写的 setup()
  const setupResult = setup();

  handleSetupResult(setupResult, instance)
}
```

1. 取出组件上的 `setup` 并执行；
2. 你的 `setup` 返回：`{ msg: "mini-vue" }`；
3. `setupResult = { msg: "mini-vue" }`；
4. 调用 `handleSetupResult`。

##### 2.2.2.2 执行 `handleSetupResult(setupResult, instance)`

ts









```
function handleSetupResult(setupResult, instance) {
  if (typeof setupResult === 'object') {
    // 把 setup 返回对象挂载到实例
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
```

- 判断：

  ```
  setupResult
  ```

   是对象 → 给 

  ```
  instance
  ```

   新增属性：

  js

  

  

  

  

  ```
  instance.setupState = { msg: "mini-vue" }
  ```

- 继续调用 `finishComponentSetup(instance)`。

##### 2.2.2.3 执行 `finishComponentSetup(instance)`

ts









```
function finishComponentSetup(instance) {
  const Component = instance.type; // Component = App
  // 把组件的 render 函数挂载到实例
  instance.render = Component.render
}
```

- 等价于：`instance.render = App.render`

- 现在 

  ```
  instance
  ```

   完整结构：

  js

  

  

  

  

  ```
  instance = {
    type: App,
    vnode: 根组件VNode,
    setupState: { msg: "mini-vue" },
    render: App.render
  }
  ```

**组件初始化全部完成**。

#### 2.2.3 执行 `setupRenderEffect(instance, container)`

ts









```
function setupRenderEffect(instance, container) {
  // 执行实例上的 render 函数，生成内部 VNode 树
  const subTree = instance.render()
  // 递归 patch 渲染内部节点
  patch(subTree, container)
}
```

1. **执行 `instance.render()`**

   也就是执行 `App.render()`，它会通过 `h` 创建 VNode，最终得到：

   js

   

   

   

   

   ```
   subTree = {
     type: "div",       // 字符串！
     props: { id: "root" },
     children: [ p标签VNode1, p标签VNode2 ]
   }
   ```

   `subTree` 就是 div 元素的 VNode。

2. **再次调用 `patch(subTree, #app)`**

   进入**第 3 步：第二次 patch（元素 VNode）**

------

## 第 3 步：第二次 patch（元素 VNode，type 为字符串）

再次执行 `patch`：

ts









```
export function patch(vnode, container) {
  if (vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}
```

- 当前 `vnode.type = "div"`（字符串）
- 命中第一个分支：执行 `processElement(vnode, container)`

### 3.1 执行 `processElement(vnode, container)`

ts









```
export function processElement(vnode, container) {
  // 1. 创建真实 DOM
  const el = document.createElement(vnode.type)
  const { props, children } = vnode

  // 2. 处理子节点
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(children, container)
  }

  // 3. 遍历属性，设置到 DOM
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  // 4. DOM 挂载到父容器
  container.append(el)
}
```

逐行拆解：

#### 3.1.1 创建真实 DOM

```
el = document.createElement("div")
```

得到真实 `<div>` 标签。

#### 3.1.2 解析 props 并设置属性

```
props = { id: "root" }
```

循环执行：

```
el.setAttribute("id", "root")
```

此时 DOM：`<div id="root"></div>`

#### 3.1.3 处理 children（数组）

```
children` 是数组 `[pVNode1, pVNode2]
```

进入分支：`mountChildren(children, container)`

##### 3.1.3.1 执行 `mountChildren(children, container)`

ts









```
function mountChildren(children, container) {
  children.forEach(v => {
    // 每一个子 VNode 再次走 patch
    patch(v, container)
  })
}
```

循环遍历两个 p 标签 VNode，**逐个递归调用 patch**：

1. 第一个 p VNode：`type="p"`（字符串）

   → 再次走 `patch` → `processElement`

   → 创建 `<p class="text1">`、设置文本、append

2. 第二个 p VNode：`type="p"`（字符串）

   → 同上，创建 `<p class="text2">`、设置文本、append

#### 3.1.4 把 div 挂载到页面容器

```
container.append(el)
```

将完整的 div + 内部 p 标签，挂载到页面 `#app` 容器。

------

# 最终收尾

1. 所有虚拟 VNode 全部转换成**真实浏览器 DOM**；
2. 节点逐层嵌套、挂载完成；
3. 页面渲染出完整内容，**整条流程结束**。

------

# 极简路线图（可直接背诵）

plaintext

```
createApp(App)
  → .mount(#app)
    → createVnode(App) 【组件VNode，type=对象】
    → render → patch
      → processComponent → mountComponent
        → createComponentInstance 建实例
        → setupComponent → 执行setup → 存setupState
        → finishComponentSetup → 挂载render
        → setupRenderEffect
          → 执行render() 【产出元素VNode，type=字符串】
          → 再次 patch
            → processElement
              → 创建真实DOM → 绑属性 → 递归子节点 → 挂载页面
```

# 关键区分再强调

1. **第一次 patch**：type = 组件对象 → 走**组件流程**（跑 setup、render）
2. **第二次 / 多次 patch**：type = 标签字符串 → 走**元素流程**（建真实 DOM）
3. 整个框架的核心：**patch 靠 type 类型分流**，串联起组件和原生元素两套逻辑。