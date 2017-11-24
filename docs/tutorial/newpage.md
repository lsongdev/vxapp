# 新建页面

在 `pages` 目录下新建一个 `greet` 目录，然后在目录下分别新建 `index.html` 和 `index.js`。

index.html 代码如下：

```html
<view class="section">
  <text>Hello! {{name}}</text>
</view>
<view class="section">
  <input bindinput="bindNameInput" placeholder="please input your name" auto-focus/>
</view>
```

index.js 代码如下：

```javascript
import $ from '@mtfe/vxapp';

export default class Greet extends $.Page {
  initData() {
    return { name: '' };
  }

  bindNameInput(e) {
    this.setData({
      name: e.detail.value
    })
  }
}
```

代码很简单（我们假设你懂 React、Vue 或 Angular 😃）。页面上有一行文字和一个输入框，在输入框中输入的文字会同步到文字中。

最后在 `src/app.js` 里把页面添加上。

```javascript
    pages: [
      "pages/index/index",
      "pages/greet/index",
    ],
```

好的，一个基本的页面就这样完成了。

使用 `vxapp build` 编译出代码，然后用微信小程序开发者工具打开根目录下的 `build` 目录，就可以看见标准的小程序结构了。

下一节，[API 的使用](useapi.md)。