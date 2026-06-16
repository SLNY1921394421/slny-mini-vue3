import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { shapeFlags } from "./shapeFlags";

export function render(vnode, container) {
  patch(vnode, container);
}
// 后续递归处理
function patch(vnode, container) {
  const { shapeflag } = vnode
  if (shapeflag & shapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeflag & shapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }

}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, props, shapeflag } = vnode;
  if (shapeflag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeflag & shapeFlags.ARRAY_CHILDREN) {
    // children.forEach(v => {
    // 	patch(v, el);
    // })
    mountChildren(children, el)
  }

  for (const key in props) {
    const val = props[key];
    const isOn = key => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val);
    }
  }
  container.append(el);
}

function mountChildren(initialVnode, container) {
  return initialVnode.forEach(v => {
    patch(v, container);
  })
}


function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initialVnode.el = subTree
}

