class Compiler {
	constructor(vm) {
		this.vm = vm
		this.el = vm.$el
		// 编译模板
		this.compiler(this.el)
	}
	compiler(el) {
		// 获取子节点
		let childNodes = [...el.childNodes]
		childNodes.forEach(node => {
			// 根据不同的节点类型进行编译
			// 文本类型节点
			if (this.isTextNode(node)) {
				this.compileText(node)
			} else if (this.isElementNode(node)) {
				// 元素节点
				this.compileElement(node)
			}
			// 存在子节点则进行递归
			if (node.childNodes && node.childNodes.length) {
				this.compiler(node)
			}
		})
	}
	// 编译文本节点简易实现
	// 用正则获取{{}}中的变量
	compileText(node) {
		let reg = /\{\{(.+?)\}\}/
		let val = node.textContent
		// 判断是否有{{}}
		if (reg.test(val)) {
			// 获取{{}}中的变量
			let key = RegExp.$1.trim()
			// 替换node中的内容，并重新赋值回去
			node.textContent = val.replace(reg, this.vm[key])
			// 编译完文本后创建观察者，下次数据更新后执行视图修改操作
			new Watcher(this.vm, key, newValue => {
				node.textContent = newValue
			})
		}
	}
	// 编译元素节点（目前仅处理指令）
	compileElement(node) {
		// 获取元素上的所有属性进行遍历
		![...node.attributes].forEach(attr => {
			let attrName = attr.name
			// 判断是否是v-开头的指令
			if (this.isDirective(attrName)) {
				// 剔除属性名中的v-
				attrName = attrName.substr(2)
				// 获取指令值: v-text=“msg”中的msg
				let key = attr.value
				// DONE update更新视图内容				
				this.update(node, key, attrName)
			}
		})
	}
	isDirective(attr) {
		return attr.startsWith('v-')
	}
	// 元素的更新方法节点，不同的指令对应不同的更新处理
	update(node, key, attrName) {
		let updateFn = this[attrName + 'Update']
		updateFn && updateFn(node, key, this.vm[key], this.vm)
	}
	// v-text对应的更新方法
	textUpdater(node, key, value, vm) {
		node.textContent = value
		// 编译完文本节点后创建观察者，下次数据更新后执行视图修改操作
		new Watcher(vm, key, newValue => {
			node.textContent = newValue
		})
	}
	// v-model对应的更新方法
	modelUpdate(node, key, value, vm) {
		node.value  = value
		// 创建观察者，下次数据更新后执行视图修改操作
		new Watcher(vm, key, newValue => {

			node.value = newValue
		})
		// 双向绑定，input数据修改后更改data中的数据
		node.addEventListener('input', () => {
			vm[key] = node.value
		})
	}
	// 判断是否是元素节点
	isElementNode(node) {
		return node.nodeType === 1
	}
	// 判断是否是文本节点
	isTextNode(node) {
		return node.nodeType === 3
	}
}