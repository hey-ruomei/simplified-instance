const template = '<ul class="list"><li>列表1</li><li>列表2</li></ul>'
// 期望输出
const vnode = {
  "tagName": "ul",
  "children": [
      {
          "tagName": "li",
          "children": [
              "列表1"
          ],
          "attributes": {}
      },
      {
          "tagName": "li",
          "children": [
              "列表2"
          ],
          "attributes": {}
      }
  ],
  "attributes": {
      "class": "\"list\""
  }
}

function generateVNode (template) {
  let stack = []
  let word = ''
  for (let i = 0; i < template.length; i++) {
    let char = template[i]
    // 标签开始
    if (char === '<') {
      if (word.trim()) {
        stack.push(word.trim())
      }
      word = char
    // 标签结束
    } else if (char === '>') {
      word += char
      word = word.trim
      if (word) {
        const tagName = word.slice(1, -1).split(' ')[0]
        // 结束标签
        if (tagName[0] === '/') {
          const endTag = tagName.slice(1)
          let node = {
            tagName: endTag,
            children: [],
            attributes: {}
          }
          while (stack.length) {
            const tag = stack.pop()
            // 找到了对应的开始标签
            if (typeof tag === 'string' && tag.slice(1, -1).split(' ')[0].trim() === endTag.trim()) {
              node = parseAttribute(node, tag)
              break
            } else {
              // 从数组前面插入
              node.children.unshift(tag)
            }
          }

          if (getType(node) === 'Array') {
            stack.push(...node)
          } else {
            stack.push(node)
          }
        } else {
          stack.push(word)
        }
      }
      word = ''
    // 中间内容
    } else {
      word += char
    }
  }
}
function parseAttribute (node, rawTag) {
  const tag = rawTag.slice(1, -1)

  let inQuotes = false
  let attr = ''
  const attributes = []
  for (const char of tag) {
    if (char === ' ') {
      if (inQuotes) {
        attr += char
      } else {
        attr.trim() && attributes.push(attr.trim())
        attr = ''
      }
    } else {
      attr += char
      if (char === '"') {
        inQuotes = !inQuotes
      }
    }
  }
  attr.trim() && attributes.push(attr.trim())
  for (const attr of attributes) {
    if (attr.indexOf('=') === -1) continue
    const key = attr.split('=')[0]
    const value = attr.split('=')[1]
    node.attributes[key] = value
  }
  return node

}

function getType (target) {
  // [Object Array] => Array
  return Object.prototype.toString.call(target).slice(8, -1)
}
