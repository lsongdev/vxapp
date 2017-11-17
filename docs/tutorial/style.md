# 使用样式

首先，在页面所在的目录（现在是 `src/pages/greet`）下新建一个文件 `index.css`，然后填入如下内容：

```css
.section {
  input {
    border-bottom: 1px solid red;
    margin: 10rpx;
    padding: 5px;
  }
}
```

如你所见，跟你所预料的 CSS 写法几乎是没有两样的，实际上编译也只是把 `.css` 改名成 `.wxss` 而已（至少现阶段是如此）。

> 具体的 WXSS 文档请参阅 [微信小程序文档][微信小程序文档]

[微信小程序文档]: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxss.html

现在执行 `vxapp build`，再在开发者工具中查看一下，可以发现输入框样式已经变了。Bravo！