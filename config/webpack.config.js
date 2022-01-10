const path = require( 'path' )

module.exprots = {
  entry: 'src/index.js',
  output: {
    path: path.resolve( __dirname, '../dist' ),
    filename: 'main.js'
  }
}