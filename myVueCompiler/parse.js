function parse(template, options) {
  const stack = []
  let root
  let currentParent
  let inVPre = false
  let inPre = false

  // https://juejin.cn/post/6981237992056684551
  // 属性：如 id="app" id=app
  const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
  // Unicode合法字符集范围匹配
  const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
  // 标签名：一系列合法字符串集合
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
  // 可带命名空间的标签 xxx:xxx 或 xxx
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`
  // 开始标签： <xxx:xxx 或 <xxx
  const startTagOpen = new RegExp(`^<${qnameCapture}`)
  // 标签结束符： />
  const startTagClose = /^\s*(\/?)>/
  // 匹配 </xxx>
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

  const reCache = {}

  const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
  }
  const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
  const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g

  // TODO
  function closeElement(element) {
    trimEndingWhitespace(element)
    if (!inVPre && !element.processed) {
      element = processElement(element, options)
    }

    // TODO some if
    if (!stack.length && element !== root) {

    }
  }

  // TODO
  function processElement(el, options) {}

  // TODO
  function trimEndingWhitespace(el) {
    if (!inPre) {
      let lastNode
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ''
      ) {
        el.children.pop()
      }
    }
  }

  const isPlainTextElement = makeMap('script, style, textarea', true)

  function parseHTML(html, {}) {
    const stack = []
    let index = 0
    let last, lastTag
    while (html) {
      last = html
      // 非最后一个 tag，并且非 script、style、textarea 标签
      if (!lastTag || !isPlainTextElement(lastTag)) {
        let textEnd = html.indexOf('<')
        if (textEnd === 0) {
          // TODO End tag
          const endTagMatch = html.match(endTag)
          if (endTagMatch) {
            const curIndex = index
            advance(endTagMatch[0].length )
            parseEndTag(endTagMatch[1], curIndex, index)
            continue
          }

          // TODO start tag
          const startTagMatch = parseStartTag()
          if (startTagMatch) {
            handleStartTag(startTagMatch)
            if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
              advance(1)
            }
            continue
          }
        }
      }
    }
  }

  // 解析开始标签及其属性
  // <div id="app">测试parseStartTag</div>
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1], // div
        attrs: [],
        start: index
      }
      advance(start[0].length) // start[0] 为匹配到的 < ，游标向前走1位
      let end, attr
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      // 如果匹配到开始标签的闭合（ 形如：> ），则返回 match 对象
      if (end) {
        match.unarySlash = end[1]
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag() {
    const tagName = match.tagName
    // 自闭合标签
    const unarySlash = match.unarySlash

    // if (expectHTML) {
    //   if (lastTag === 'p' && )
    // }
  }

  function parseEndTag(tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      pos = 0
    }

    if (pos >= 0) {
      for (let i = stack.length - 1; i >= pos; i--) {
        // 标签不匹配警告
        if (i > pos || !tagName) {
          options.warn(`tag <${stack[i].tag}> has no matching end tag.`, {
            start: stack[i].start,
            end: stack[i].end
          })
        }
        if (options.end) {
          options.end(stack[i].tag, start, end)
        }
      }

      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }

  }

  // 移动游标，并剪切模板
  function advance (n) {
    index += n
    html = html.substring(n)
  }


  // 创造map, 用于判断字段是否存在于已知的map中
  function makeMap(str, expectsLowerCase) {
    const list = str.split(',')
    const map = Object.create(null)
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true
    }
    return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
  }

}
