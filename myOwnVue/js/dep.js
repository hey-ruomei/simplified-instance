class Dep {
	constructor() {
		// 储存观察者（订阅者）
		this.subs = []
	}
	// 添加观察者
	addSub(sub) {
		// DONE 拥有update方法的watcher才推入观察者列表
		if (sub && sub.update) {
			this.subs.push(sub)
		}
	}
	// 通知
	notify() {
		this.subs.forEach(sub => {
			sub.update()
		})
	}
}