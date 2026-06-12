import { processComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}
export function patch(vnode, container) {
  if (typeof vnode === 'object') {
    processComponent(vnode, container)
  } else if (typeof vnode === 'string') {
    processElement(vnode, container)
  }
}
function processElement(vnode, container) {
  const { type, props, children } = vnode
  const el = document.createElement(type)
  if (children) {
    for (const v of children) {
      patch(v, container)
    }
  }
  if (props) {
    for (const key in props) {
      const val = props[key]
      el.setAttribute(key, val)
    }
  }
  container.append(el)

}