const fs = require('fs');
const { join } = require('path');
const Readable = require('stream').Readable;
const Handlebars = require('handlebars');

class Bigpipe extends Readable {
  constructor(props) {
    super(props);
    this.appContext = props.appContext;
    this.templatePath = props.templatePath;
    this.publicPath = props.publicPath;
    this.layout = '';
    this.pagelets = [];
    this.pageletsNum = 0;
  }

  _read() {}

  // 配置好后渲染主逻辑
  async render() {
    // 输出html骨架
    this.push(this.layout);

    // 所有块完成后，关闭流
    await Promise.all(this.wrap(this.pagelets))

    // 结束传输
    this.done();
  }

  //将proxy，包装成Promise
  wrap(pagelets) {
    return pagelets.map((pagelet, idx) => {
      // 返回一个promise，模板拼接好输出到页面中即resolve
      return new Promise((resolve, reject) => {
        (async () => {
          let data = null,
              tpl = function() {},
              tplHtml = '';

          // 等待数据获取
          data = await pagelet.getData()
          
          // 获取hbs模板
          tpl = this.getHtmlTemplate(pagelet.tpl);

          // 将数据拼接好后返回模板字符串，并清除换行符
          tplHtml = this.clearEnter(tpl(data));

          // 以script输出到页面中
          this.push(`
            <script>
              renderFlush("#${pagelet.id}","${tplHtml}")
            </script>
          `)

          this.pageletsNum--;

          resolve()
        })()
      })
    })
  }

  // 获取骨架并转成字符串
  getHtmlTemplate(realPath) {
    let tplPath = join(this.templatePath, realPath);
    let tplSource = fs.readFileSync(tplPath).toString();
    
    // 编译模板
    return Handlebars.compile(tplSource);
  }

  // 清除模板字符串的换行符
  clearEnter(html) {
    return html.replace(/[\r\n]/g,"")
  }

  // 设置html骨架
  defineLayout(realPath) {
    let layoutPath = join(this.publicPath, realPath)
    
    this.layout = fs.readFileSync(layoutPath).toString();
  }

  // 设置模板配置
  definePagelets(pagelets) {
    if (Array.isArray(pagelets)) {
      this.pagelets = this.pagelets.concat(pagelets);
    } else {
      if (typeof pagelets === 'object') {
        this.pagelets.push(pagelets)
      }
    }

    this.pageletsNum = this.pagelets.length;
  }

  // 关闭stream
  done() {
    if (this.pageletsNum === 0) {
      this.push('</body></html>');
      this.push(null)
    }
  }
}

module.exports = Bigpipe;
