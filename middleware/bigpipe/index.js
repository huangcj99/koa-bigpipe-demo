const { resolve } = require('path')
const Bigpipe = require('./lib/bigpipe')

module.exports = createBigPipeReadable

function createBigPipeReadable (
  templatePath = resolve(__dirname, '../../template'),  // 模板根目录
  publicPath = resolve(__dirname, '../../../../public') // html根目录
) {

  return async function initBigPipe(ctx, next) {
    if (ctx.createBigpipe) return next()

    ctx.createBigpipe = function () {
      ctx.type = 'html';

      return new Bigpipe({
        appContext: ctx,
        templatePath: templatePath,
        publicPath: publicPath
      })
    }

    return next()
  }
}
