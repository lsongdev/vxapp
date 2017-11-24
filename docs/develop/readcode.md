# 看

> Talk is cheap. Show me the code. - Linus Torvalds

阅读源码是程序员必备技能，而 vxapp 源码只有两个 JavaScript 文件，分别是库的核心文件 `/index.js` 以及打包的 CLI 工具 `/bin/vxapp.js`，请确保都浏览一遍以便大概了解整个库运作流程。

## 核心文件

文件由导出的四大部分构成，分别是 `App` 类、`Page` 类和 `$Run` 函数，以及一个「桩」：`'VXAPP_CONFIG_STUB'`。

`App` 类和小程序的 `App()` 相关，是配置小程序的类，内部的代码基本就是在实例上添加一些方便的 API。

`Page` 类和小程序的 `Page()` 相关，是配置页面的类，内部的代码基本就是在实例上添加一些方便的 API。

`$Run` 函数是供库初始化组件的方法，将小程序使用函数初始化转化为使用更为自然的类/组件初始化的代码书写方式的关键。

「桩」`'VXAPP_CONFIG_STUB'` 是供配置打包时 Babel 插件识别的标志，请不要修改或者删除。

## CLI 工具

CLI 工具主要通过解析命令行来运行项目初始化/项目构建等功能。

对于 HTML 文件的处理，CLI 工具基本只是更改后缀名为 `.wxml`，另外会做一些模版嵌入的合并工作。

对于 CSS 文件的处理，CLI 工具基本只是更改后缀名为 `.wxss`，另外使用一些 PostCSS 插件对 CSS 进行处理。

对于 JavsScript 文件的处理，CLI 工具会识别 ECMAScript 代码，转换为类 node 风格（比如，import 转化为 require）。

CLI 工具更多的作用是将目前项目结构转化为符合小程序要求的项目结构，包括提取出小程序要求的 `app.json`、给 App 类和 Page 类添加启动代码等。

还有一个就是将「桩」`'VXAPP_CONFIG_STUB'` 替换成供小程序启动和使用的全局配置。这也是为什么在上一节强调这个「桩」的原因。