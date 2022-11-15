// 对传入的data数据进行拦截，使其变为响应式的数据
class Observer {
	constructor(data) {
		this.walk(data)
	}
	// 遍历data转为响应式
	walk(data) {
		// 非对象型数据不需要监听
		if (!data || typeof data !== 'object') return
		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
		})
	}
	// 响应式转换
	defineReactive(obj, key, value) {
		// value传入walk后会做是否是对象的判断
		// 是对象的话会继续进行响应式转换
		this.walk(value)
		// 保存this
		const observerInstance = this
		// 创建Dep对象
		let dep = new Dep()
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,

			// 获取值时触发依赖收集
			get() {
				// 同一时间，只有一个依赖目标在处理，Dep.target是全局唯一的
				Dep.target && dep.addSub(Dep.target)
				return value
			},
			set(newValue) {
				if (newValue === value) return
				// 设置新值
				value = newValue
				// 进行赋值处理时，如果newValue是对象，对象里面的属性也需要转换为响应式
				observerInstance.walk(newValue)
				// 触发通知，更新视图
				dep.notify()
			}
		})
	}
}