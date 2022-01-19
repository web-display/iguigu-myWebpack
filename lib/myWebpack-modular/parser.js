const fs = require( 'fs' )
const path = require( 'path' )
const babelParser = require( '@babel/parser' )
const traverse = require( '@babel/traverse' ).default
const {transformFromAst} = require('@babel/core')

const parser = {
	// 将文件解析成ast
	getAst(filePath) {
		// 读取文件
		const file = fs.readFileSync( filePath, 'utf-8' )

    // 2.将其解析为ast抽象语法树
    const ast = babelParser.parse( file, {
      sourceType: 'module',//模块化方案：ES Module
    } )
		return ast
	},
	// 获取依赖
	getDeps(ast, filePath) {
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
		return deps
	},
	getCode(ast) {
		// 编译代码：将代码中浏览器不能识别的语法进行编译
		const {code} = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
		return code
	}
}
module.exports = parser