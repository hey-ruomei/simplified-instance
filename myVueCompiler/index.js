function createCompiler (template, options) {
  // 模板解析，通过正则等方式将用户传入的模板转换成 AST
  const ast = parse(template.trim(), options)

  // 优化阶段，遍历 AST ，找出其中的静态节点，并打上标记，用于后续的 DOM diff 优化
  if (options.optimize !== false) {
    optimize(ast, options)
  }

  // 代码生成阶段，将 AST 转换成渲染函数
  const code = generate(ast, options)

  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}
