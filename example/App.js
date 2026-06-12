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