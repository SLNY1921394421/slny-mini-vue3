import { } from '../lib/2026-mini-vue3.esm'
export default {
  render() {
    return h('div', `hello ${this.msg}`)
  },
  setup(props) {
    return {
      msg: 'mini-vue'
    }
  }
}