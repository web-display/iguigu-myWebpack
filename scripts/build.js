const myWebpack = require( '../lib/myWebpack-recursion' )
const config = require( '../config/webpack.config' )

const compiler = myWebpack( config )
// 开始打包
compiler.run()
