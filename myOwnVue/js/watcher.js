class Watcher {
  constructor(vm, key, cb) {
		// vm为Vue实例
		this.vm = vm
		// key为data中的属性
		this.key = key
		// 数据更新后的回调
		this.cb = cb		// 观察者设置为Dep.target
		Dep.target = this
		// DONE 更新视图的时候比较一下，如果没变化，就跳过
		// 此处的vm[key]已经触发了get方法，已经调用dep.addSub(Dep.target)完毕
		this.oldValue = vm[key]
		// DONE Dep.target已添加到观察者列表中，可以清空了
		Dep.target = null
	}
	// 主要就是封装观察者回调函数
	update() {
		let newValue = this.vm[this.key]
		if (newValue === this.oldValue) return
		this.cb(newValue)
	}
}