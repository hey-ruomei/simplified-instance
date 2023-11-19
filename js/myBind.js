// call
// 用于改变 fn 的 this 指向，并执行 fn 函数
Function.prototype.myCall = function (context) {
  if (context === undefined || context === null) {
    context = window // 指定为 null 和 undefined 的 this 值会自动指向全局对象
  } else {
    context = Object(context) // 值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的实例对象
  }
  // 调用fn.myCall(context, arguments)时，this 就是 fn
  if (typeof this !== Function) throw new Error('can not be involved')
  const fn = Symbol('fn')
  // 将 fn 挂在到 context 对象上，这样 fn 才可以访问到 context
  context[fn] = this
  const args = [...arguments].slice(1)
  const result = context[fn](...args)
  // 还原对象
  delete context[fn]
  return result
}

// apply
Function.prototype.myApply = function (context) {
  if (context === undefined || context === null) {
    context = window // 指定为 null 和 undefined 的 this 值会自动指向全局对象
  } else {
    context = Object(context) // 值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的实例对象
  }
  // 判断是否为类数组对象
  function isArrayLike(o) {
    if (
      o && // o 不是null、undefined等
      typeof o === 'object' && // o是对象
      isFinite(o.length) && // o.length是有限数值
      o.length >= 0 && // o.length为非负值
      o.length === Math.floor(o.length) && // o.length是整数
      o.length < Math.pow(2, 32)
    ) {
      return true
    }
    return false
  }

  // 调用fn.myCall(context, arguments)时，this 就是 fn
  if (typeof this !== Function) throw new Error('can not be involved')
  const fn = Symbol('fn')
  // 将 fn 挂在到 context 对象上，这样 fn 才可以访问到 context
  context[fn] = this
  let result
  if (!Array.isArray(args) && !isArrayLike(args)) {
    throw new Error('CreateListFromArrayLike called on non-object') // 第二个参数不为数组且不为类对象数组
  } else {
    args = Array.from(args) // 转为数组
    result = context[fn](...args)
  }
  // 还原对象
  delete context[fn]
  return result
}

// bind
// 需要返回绑定了新的 this 的 fn （未调用）
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new Error('Expected this is a function')
  }
  let self = this
  let args = [...arguments].slice(1)
  const fn = function (...innerArg) {
    const isNew = this instanceof fn // 返回的fn是否通过new调用
    return self.apply(isNew ? this : Object(context), args.concat(innerArg)) // new调用就绑定到this上,否则就绑定到传入的context上
  }
  // 复制原函数的prototype给fn，一些情况下函数没有prototype，比如箭头函数
  if (self.prototype) {
    fn.prototype = Object.create(self.prototype)
  }
  return fn // 返回拷贝的函数
}
