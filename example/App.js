import { h } from '../lib/2026-mini-vue3.esm.js'
window.self = null
export default {
  render() {
    window.self = this
    return h("div",
      {
        id: "root",
        class: ["red", "blue"],
        onClick() {
          console.log('onclick...')
        },
        onMousedown() {
          console.log('onMousedown')
        }
      },
      // string
      // 'hello, mini-vue'
      // array
      [h("p", { class: 'red' }, 'hi'), h("p", { class: "blue" }, `hello ${this.msg}`)]
    )
  },
  setup() {
    return {
      msg: 'mini-vue3'
    }
  }
}