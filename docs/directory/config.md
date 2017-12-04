# 配置打包

## 基本概念

在 `config` 目录中定义一些需要的变量，则在打包后的小程序中就能够直接使用 `vxapp.config` 来取得这些变量的值。

变量是以文件为最小粒度来被打包，工具使用环境变量 `NODE_ENV` 来控制使用到的文件。

一个正常项目至少包括三个配置文件，分别是 `default.js`、`dev.env.js` 和 `prod.env.js`。

## 打包顺序

`default.js` 是必定会被包括的缺省配置文件，而代表运行环境的 `dev.env.js` 和 `prod.env.js` 则分别是在编码环境和生产环境中被包括。如果环境没有被指定，则是被默认为 `dev`。

变量从先到后被覆盖顺序是 `default.js` <- `[env].env.js` <- 其他。

比如，当 `NODE_DEV=prod` 时，则顺序被打包的文件是：`default.js`，`prod.env.js`。`prod.env.js` 导出的变量会覆盖 `default.js` 中的变量。在这里，`default.js` 默认被省略是因为肯定会被包括进去。

## 自定义配置

打包支持自定义配置文件。只要将配置文件的名字加入到 `NODE_ENV` 中，那么工具会自动地把配置文件包括进去。

比如，新增一个自定义的配置文件 `alipay.js`，那么运行 `NODE_DEV=prod,alipay` 的结果是 `default.js`、`prod.env.js` 和 `alipay.js` 会按顺序被读取运行并同时覆盖旧变量。

> `NODE_DEV=alipay` 的结果是 `default.js`、`dev.env.js` 和 `alipay.js` 被包括。还记得 `dev` 环境是默认的吗？

你甚至可以使用 `NODE_DEV=prod,weixinpay,alipay` 来包含更多的配置文件——只要牢记文件名的先后顺序决定了变量覆盖的先后顺序。