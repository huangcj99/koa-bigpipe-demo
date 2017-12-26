const { resolve } = require('path');
const Koa = require('koa');
const createBigpipeMiddlewary = require('koa-bigpipe-middlewary');

const app = new Koa();

app.use(createBigpipeMiddlewary(
  templatePath = resolve(__dirname, './template'),
  publicPath = resolve(__dirname, './view')
));

app.use((ctx) => {
  let bigpipe = ctx.body = ctx.createBigpipe();

  //
  bigpipe.defineLayout('/bigpipe.html');
  bigpipe.definePagelets([
    {
      id: 'A',
      tpl: '/article.handlebars',
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b40c0c77d0361b500e5'
    },
    {
      id: 'C',
      tpl: '/article.handlebars',
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b28c0c77d0361b500e4'
    },
    {
      id: 'B',
      tpl: '/article.handlebars',
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b28c0c77d0361b500e4'
    }
  ]);

  bigpipe.render();
})

app.on('error', function(err) {
  console.log(err);
})

app.listen(9000, () => {
  console.log('启动');
});
