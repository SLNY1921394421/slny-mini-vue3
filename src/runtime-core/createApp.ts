import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
  const vnode = createVnode(rootComponent)
  return {
    mount(rootContainer) {
      render(vnode, rootContainer)
    }
  }
}