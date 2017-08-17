# 目录结构

## src

存放源码的目录。

## src/app.js

小程序的入口文件。

## src/app.css

小程序的总样式表。

## src/pages

存放不同小程序页面的目录。

在此目录下应该将每一个页面组织在一个子目录中。例如主页的所有代码放在目录 `src/pages/index` 下。

## src/scripts

存放一些公共代码文件比如 `utils.js` 等，或者自定义的 `.js` 文件。

## src 下其他自定义目录

可以自定义其他目录以更好组织项目，比如使用 `layouts` 存放 HTML 文件的模版，`images` 存放图片资源等。

## config

存放不同环境的配置文件的目录，你可以自己加入任意的配置文件。

每个配置文件均应为 `.js` 文件，且应该会导出为一个普通对象（plain object），可以使用 ES2015 风格或者 Node 风格。

```javascript
// Node style
exports.libName = 'vxapp'

// ESM style
export default {
  libName: 'vxapp'
}
```

## config/default.js

默认的配置文件。

## config/dev.env.js

dev 环境的配置文件。

## config/prod.env.js

prod 环境的配置文件。

## build

小程序构建之后的代码存放目录，一般不需要理会。