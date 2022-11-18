function eventMixins (Vue) {
  // 订阅事件
  Vue.prototype.$on = function (event, fn) {
    // DONE 这里的写法，不加个分号在前面，会报vm cannot access before initialization
    // 因为语法解析会将const vm = xxx后面的一行内容都当成是变量声明 VariableDeclarator 中的 MemberExpression
    // 加了分号后则 vm 的声明和后面的条件表达式就得以分开，该行变成了独立的表达式声明 ExpressionStatement
    // https://astexplorer.net/ 把代码贴进去看看解析结果
    // https://juejin.cn/post/6844904035271573511
    const vm = this
    ;(vm._event[event] || (vm._event[event] = [])).push(fn)
    return vm
  }

  // 取消订阅
  Vue.prototype.$off = function(event, fn) {
    const vm = this
    // 未传递参数的情况下，默认清除所有事件订阅
    if (!arguments.length) {
      vm._event = Object.create(null)
    }

    // 订阅的事件对应回调列表为空
    const cbs = vm._event[event]
    if (!cbs) return vm

    // 未传入回调，将订阅的事件列表全部清空
    if (!fn) {
      vm._event[event] = null
      console.log(`${event}事件取消订阅`)
      return vm
    }

    // 传入了回调，仅删除传入的回调函数
    let cb
    let i = cbs.length
    while(i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  // 仅订阅一次
  Vue.prototype.$once = function(event, fn) {
    const vm = this
    // 重新封装回调函数
    // 执行回调并且取消订阅
    const on = function() {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
  }

  // 发布
  Vue.prototype.$emit = function(event) {
    const vm = this
    cbs = vm._event[event]
    if (!cbs) {
      console.log(`${event}事件取消订阅成功`)
      return vm
    }
    for (let i = 0; i < cbs.length; i++) {
      // DONE 留意这个arguments，需要去除传入的第一个事件名字符串参数
      const args = Array.from(arguments).slice(1)
      cbs[i].apply(vm, args)
    }
    return vm
  }
}
