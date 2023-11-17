function MyPromise (excutor) {
  // 储存 promise 状态
  this.promiseState = 'pending'
  // 储存 promise 的返回值
  this.promiseResult = null
  // 储存异步回调函数列表
  this.callbackList = []

  const resolve = (val) => {
    // promise 状态仅能改变一次
    if (this.promiseState !== 'pending') return
    this.promiseState = 'fulfilled'
    this.promiseResult = val
    for(let callback of this.callbackList){
      callback.onResolved(val);
    }

  }
  const reject = (err) => {
    if (this.promiseState !== 'pending') return
    this.promiseState = 'rejected'
    this.promiseResult = err
    for(let callback of this.callbackList){
      callback.onRejected(err);
    }
  }

  try {
    excutor(resolve, reject)
  } catch (err) {
    // 抛出错误时 promise 状态会从 pending 变为 rejected
    reject(err)
  }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
  const self = this
  // onResolved 及 onRejected 都是可选参数，给定默认值
  if (typeof onRejected !== 'function') {
    onRejected = err => {
      throw err
    }
  }
  if (typeof onResolved !== 'function') {
    onResolved = val => val
  }
  // 调用 then 方法会返回新的 Promise
  return new MyPromise((resolve, reject) => {
    const handleCallback = (cb) => {
      try {
        // 根据回调的返回结果确定 then 方法中新 promise 的返回结果
        const result = cb(self.promiseResult)
        if (res instanceof MyPromise) {
          res.then(val => {
            resolve(val)
          }, err => reject(err))
        } else {
          // 返回结果不是 promise
          resolve(result)
        }
      } catch {
        reject(err)
      }
    }
    // 调用回调函数
    if (this.promiseState === 'fulfilled') {
      handleCallback(onResolved)
    }
    if (this.promiseState === 'rejected') {
      handleCallback(onRejected)
    }
    if (this.promiseState === 'pending') {
      this.callbackList.push({
        onResolved:() => {
          handleCallback(onResolved)
        },
        onRejected:() => {
          handleCallback(onRejected)
        }
      })
    }
  })
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}

MyPromise.prototype.resolve = function (val) {
  return new MyPromise(resolve, reject) {
    if (val instanceof MyPromise) {
      val.then(val => {
        resolve(val)
      }, err => {
        reject(err)
      })
    } else {
      resolve(val)
    }
  }
}
MyPromise.prototype.reject = function (err) {
  return new MyPromise((resolve, reject) => {
    reject(err)
  })
}

MyPromise.prototype.all = function (promiseList) {
  let count = 0
  let res = []
  const len = promiseList.length
  return new MyPromise((res, reject) => {
    for (let i = 0; i < len; i++) {
      promiseList[i].then(val => {
        count++
        res[i] = val
        if (count === len) {
          resolve(res)
        }
      }, err => reject(err))
    }
  })
}

MyPromise.prototype.race = function (promiseList) {
  const len = promiseList.length
  return new MyPromise((res, reject) => {
    for (let i = 0; i < len; i++) {
      promiseList[i].then(val => {
        resolve(val)
      }, err => reject(err))
    }
  })
}
