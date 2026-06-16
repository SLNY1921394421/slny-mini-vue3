import { shapeFlags } from "./shapeFlags"

export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    setupState: {},
    shapeflag: getShapeflag(type)
  }
  if (typeof children === 'string') {
    vnode.shapeflag |= shapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeflag |= shapeFlags.ARRAY_CHILDREN
  }
  return vnode
}
function getShapeflag(type) {
  return typeof type === 'string' ?
    shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT
}