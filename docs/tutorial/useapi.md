# API 的使用

基本页面写好了，但是怎么从首页跳转到自己写的页面呢？

你可以直接使用腾讯提供的 `wx.navigateTo` 或 `<navigator open-type="navigateTo"/>`，这里就不累述了。

另外一个方法是可以使用 vxapp 提供的 API。

在首页 `pages/index/index.html` 中，添加：

```javascript
<button bindtap="gotoGreet">跳转</button>
```

然后在 `pages/index/index.js` 的类中，添加一个方法：

```javascript
  gotoGreet() {
    const app = getApp()
    app.goto('/pages/greet/index')
  }
```

执行 `vxapp build`，使用微信开发者工具打开，会发现首页多了一个按钮，点击按钮进去就是上一节新建的页面了。

在页面上的输入框输入内容，可以看到内容同步显示在上面的文本中。

下一节，来看看怎么[使用样式](style.md)。