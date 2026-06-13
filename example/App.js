import { h } from '../lib/2026-mini-vue3.esm.js'
export default {
  render() {
    return h("div",
      {
        id: "root",
        class: ["red", "blue"]
      },
      // string
      // 'hello, mini-vue'
      // array
      [h("p", { class: 'red' }, 'hi'), h("p", { class: "blue" }, "mini-vue")]
    )
  },
  setup() {
    return {
      msg: 'mini-vue3'
    }
  }
}