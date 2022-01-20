const fs = require('fs')
const path = require('path')
const { getAst, getDeps, getCode } = require('./parser')
class Compiler {
  constructor(options = {}) {
    // webpack配置对象
    this.options = options
    // 所有依赖容器
    this.modules = []
  }
  // 启动webpack打包
  run() {
    // 1.读取入口文件内容
    const filePath = this.options.entry
    // 第一次构建，得到入口文件的信息
    const fileInfo = this.build(filePath)

    this.modules.push(fileInfo)

    this.modules.forEach((fileInfo) => {
      // 取出当前文件的所有依赖
      const deps = fileInfo.deps
      for (const relativePath in deps) {
        // 依赖文件的绝对路径
        const absolutePath = deps[relativePath]
        // 对依赖文件进行处理
        const fileInfo = this.build(absolutePath)
        // 将处理后的结果添加到modules中，后面遍历就会遍历它～
        this.modules.push(fileInfo)
      }
    })

    // 将依赖整理成更好的依赖关系图
    /*
      {
        'index.js': {
          code: 'xxx',
          deps: {'add.js': 'xxx'}
        },
        'add.js': {
          code: 'xxx',
          deps: {}
        }
      }
    */
    const depsGraph = this.modules.reduce((graph, module) => {
      return {
        ...graph,
        [module.filePath]: {
          code: module.code,
          deps: module.deps
        }
      }
    }, {})
    console.log(depsGraph);
    this.generate(depsGraph)
  }
  // 开始构建
  build(filePath) {
    const ast = getAst(filePath)
    const deps = getDeps(ast, filePath)
    const code = getCode(ast)

    return {
      // 文件路径
      filePath,
      // 当前文件的所有依赖
      deps,
      // 当前文件解析后的代码
      code
    }
  }
  // 生成输出资源
  generate(depsGraph) {
    const bundle = `
      (function(depsGraph) {
        // 为了加载入口文件
        function require(module){
          // 定义模块内部的require函数
          function localRequire(relativePath){
            // 为了找到要引入模块的绝对路径，通过require加载
            return require(depsGraph[module].deps[relativePath])
          }

          // 定义暴露对象(将来模块暴露的内容)
          var exports = {}

          (function(require, exports, code) {
            eval(code)
          })(localRequire, exports, depsGraph[module].code)

          // 作为require函数的返回值，后面的require函数能够得到暴露的内容
          return exports
        }
        // 加载入口文件
        require('${this.options.entry}')

      })(${JSON.stringify(depsGraph)})
    `
    // 生成输出文件的绝对路径 
    const filePath = path.resolve(this.options.output.path, this.options.output.filename)
    // 写入文件
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }

}
module.exports = Compiler
