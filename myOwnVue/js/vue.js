class Vue {
  constructor(options) {
    // 获取new Vue时传入的对象
    this.$options = options || {}
    // 获取el
    this.$el = 
      typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el
    // 获取data
    this.$data = options.data || {}
    // DONE 调用_proxyData处理data中的属性，以使this.xxx能访问到this.data.xxx
    this._proxyData(this.$data)
    // DONE 使用Observer把data中的属性处理成响应式
    new Observer(this.$data)
    // TODO 编译模板
    new Compiler(this)
  }
  // 将data中的属性注册到Vue实例
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      // 数据劫持
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          // get函数的定义，使的读取this[key]会返回this.data[key]
          return data[key]
        },
        set(newValue) {
          // 设置的新值没有发生改变直接跳过
          if (newValue === data[key]) return
          data[key] = newValue
        }
      })
        
    })

  }
}