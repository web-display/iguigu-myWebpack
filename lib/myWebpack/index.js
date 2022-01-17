const fs = require( 'fs' )
const path = require( 'path' )
const babelParser = require( '@babel/parser' )
const traverse = require( '@babel/traverse' ).default
const {transformFromAst} = require('@babel/core')

function myWebpack( config ) {
  return new Compiler( config )
}
class Compiler {
  constructor ( options = {} ) {
    this.options = options

  }
  run() {
    // 1.读取入口文件内容
    const filePath = this.options.entry
    const file = fs.readFileSync( filePath, 'utf-8' )

    // 2.将其解析为ast抽象语法树
    const ast = babelParser.parse( file, {
      sourceType: 'module',//模块化方案：ES Module
    } )

    // 获取到文件的绝对路径
    const dirname = path.dirname( filePath )

    // 定义存储依赖的容器
    const deps = {}

    // 收集依赖
    traverse( ast, {
      // 内部会遍历ast中program.body，判断里面语句类型
      // 如果type:ImportDeclaration 就会出发当前函数
      ImportDeclaration( { node } ) {
        // 文件的相对路径：'./add.js'
        const relativePath = node.source.value
        // 生成给予入口文件的绝对路径
        const absolutePath = path.resolve( dirname, relativePath )
        deps[ relativePath ] = absolutePath
      }

    } )
    console.log( deps );
    // 编译代码：将代码中浏览器不能识别的语法进行编译
    const {code}=transformFromAst(ast,null,{
      presets:['@babel/preset-env']
    })
    console.log(code)
  }

}
module.exports = myWebpack