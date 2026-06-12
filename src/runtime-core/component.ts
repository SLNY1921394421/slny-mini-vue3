import { patch } from "./render"

export function processComponent(vnode, container) {
  mountComponent(vnode, container)
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}
function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  patch(subTree, container)
}
function setupComponent(instance) {
  // initProps()
  // initSlot()
  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const component = instance.type
  const setupResult = component.setup()
  handleSetupResult(instance, setupResult)
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentRender(instance)
}
function finishComponentRender(instance) {
  const component = instance.type
  instance.render = component.render
}
function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    vnode
  }
  return instance
}

