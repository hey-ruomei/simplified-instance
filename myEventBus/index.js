class EventBus {
  constructor() {
    // 事件中心初始化
    this.eventMap = {}
    // 订阅者id
    this.cbId = 0
  }

  // 订阅事件（on）
  subscribe(eventName, cb) {
    // 初始化事件对应的订阅者对象
    // 用object而不是list，方便后续取消订阅等操作
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = {}
    }
    // 每次订阅事件都会执行订阅者id自增
    const id = this.cbId++
    // 保存事件对应的订阅者回调
    this.eventMap[eventName][id] = cb

    // 每一次订阅事件，都生成一个唯一的取消订阅函数
    const unSubscribe = () => {
      delete this.eventMap[eventName][id]

      // 如果这个事件订阅者空了，直接整个对象移除
      if (!Object.keys(this.eventMap[eventName]).length) {
        delete this.eventMap[eventName]
      }
    }

    // 订阅完成后返回取消订阅函数
    return { unSubscribe }
  }

  // 仅订阅一次 (once)
  subscribeOnce(eventName, cb) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = {}
    }

    // 添加仅订阅一次的id标识
    const id = 'once' + this.cbId++
    this.eventMap[eventName][id] = cb

    // 每一次订阅事件，都生成一个唯一的取消订阅函数
    const unSubscribe = () => {
      delete this.eventMap[eventName][id]

      // 如果这个事件订阅者空了，直接整个对象移除
      if (!Object.keys(this.eventMap[eventName]).length) {
        delete this.eventMap[eventName]
      }
    }

    // 订阅完成后返回取消订阅函数
    return { unSubscribe }

  }

  // 发布事件（emit）
  // 可向订阅者传递参数
  publish(eventName, ...args) {
    // 事件订阅者回调列表
    const cbList = this.eventMap[eventName]
    if (!cbList) return

    // 触发所有订阅者回调
    for (let id in cbList) {
      cbList[id](...args)
    }
  }

  // 清除事件
  clear(eventName) {
    // 调用clear时参数为空，默认清除所有事件
    if (!eventName) {
      this.eventMap = {}
      return
    }

    delete this.eventMap[eventName]
  }
}
