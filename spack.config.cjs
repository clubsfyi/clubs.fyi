const { config } = require('@swc/core/spack');

module.exports = config({
  entry:{ web:__dirname + '/src/index.js' },
  module:{},
  options:{
    jsc:{
      minify:{
        compress:{
          dead_code:true,
          unused:true
        },
        mangle:true
      },
      target:'es2020'
    },
    minify:true
  },
  output:{
    name:'index.js',
    path:__dirname + '/public'
  }
});
