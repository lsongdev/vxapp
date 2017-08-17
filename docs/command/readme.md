# 命令

## 新建项目

运行

```bash
vxapp new weixin-app
```

则会在当前目录生成一个 `weixin-app` 的项目目录并初始化。

## 初始化项目

在项目根目录运行

```bash
vxapp init
```

则会在当前目录初始化项目。

## 构建项目

在项目根目录运行

```bash
vxapp build
```

则会将当前项目打包。

所有打包好的文件会放在 `build` 目录下。

如需要在微信 web 开发者工具中添加项目，则将项目目录设置为 `build` 即可。

## 监测文件变化

在项目根目录运行

```bash
vxapp build --watch
```

则会监测 `src` 目录的文件变化并实时编译。

## 注意

如果没有使用全局安装（也并不推荐），那么命令中的 `vxapp` 要替换成 `./node_modules/.bin/vxapp`。