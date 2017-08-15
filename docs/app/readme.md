# 程序与页面

根据[小程序文档][小程序文档]，一个小程序由 `App()` 注册，而一个页面则由 `Page()` 注册。

而在 `vxapp` 框架中，则实现了使用类来定义注册过程以及注册后的行为。

换句话说，你完全可以使用面向对象的思想来组织你的小程序：一个小程序就是一个实例，每一个页面也是一个实例。你甚至可以直接定义一个空类就完成了一个页面的创建！

通常情况下，使用 `vxapp init` 会初始化好一个模版项目，已经包含了一个 `App` 衍生类和一个 `Page` 衍生类，分别定义在 `app.js` 和 `pages/index/index.js` 中。

来看看 `app.js` 的内容：

```javascript
import $ from '@mtfe/vxapp';

export default class extends $.App {
  static config = {
    pages: [
      "pages/index/index",
    ],
    window: {
      navigationBarBackgroundColor: 'black',
      navigationBarTextStyle: 'white',
      navigationBarTitleText: $.config.libName,
      backgroundColor: 'grey',
      backgroundTextStyle: "#333"
    }
  }
  // your code here
}
```

通过衍生 `vxapp.App` 类，我们定义了一个属于自己的 `App` 子类。

注意 `static config = {}` 这个类静态对象。这个对象将会原封不动地被复制到 `app.json` 中。

> 关于 `app.json` 的作用请参阅微信小程序文档[配置][配置]一节。简单来说就是帮助微信完成小程序初始化的配置文件。

在对象里面有两个需要注意的地方。

1. `config.pages` 数组控制了小程序的页面。上面的初始化代码已经拥有一个页面了。
1. `$.config.libName`。在小程序中，只要引入了 `vxapp`，则可以直接使用 `vxapp.config` 来读取相关的全局配置变量。全局配置变量请查阅[配置打包][配置打包]一节。

再来看看 `pages/index/index.js` 的内容：

```javascript
import $ from '@mtfe/vxapp';

export default class Index extends $.Page {
  initData() {
    return { name: $.config.libName };
  }
}
```

非常简单地从 `vxapp.Page` 衍生出一个子类 `Index`。再次注意在这里也是可以直接读取 `vxapp.config` 的值。

`initData` 是一个触发框架动作的特殊函数，并不是 `Index` 页面需要的函数。详细请参阅[initData][initData]。

`vxapp` 框架对[组件][组件]的使用没有任何影响，请根据微信官方文档正常使用。

[小程序文档]: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/app.html
[配置]: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/config.html
[配置打包]: ../directory/config.md
[initData]: Page.md#initdata
[组件]: https://mp.weixin.qq.com/debug/wxadoc/dev/component