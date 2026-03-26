# Pot-App OpenAI OCR 插件

基于 OpenAI 兼容接口的 Pot-App 文字识别插件。

## 功能说明

- 支持通过 OpenAI 兼容 API 进行图片文字识别
- 支持主接口与备用接口配置
- 支持多语言图片文本识别
- 适用于 Pot-App 的外部 OCR 插件安装方式

## 使用方法

1. 下载或获取插件文件 `plugin.com.pot-app.openai-ocr.potext`
2. 打开 `Pot` → `偏好设置` → `服务设置` → `翻译`
3. 选择 `添加外部插件` → `安装外部插件`
4. 选择 `plugin.com.pot-app.openai-ocr.potext` 文件
5. 安装成功后，将插件添加到服务列表即可使用

## 插件配置

安装后，你需要根据所使用的平台填写以下配置：

- `Preset`：接口预设，可选 OpenAI Compatible / SiliconFlow
- `API URL`：接口地址，默认是 `https://api.openai.com`
- `API Key`：你的接口密钥
- `Model`：要使用的模型名称，例如 `gpt-4o`
- `Backup API URL`：备用接口地址，可选
- `Backup API Key`：备用接口密钥，可选
- `Backup Model`：备用模型名称，可选

## 仓库内容

- `main.js`：插件主逻辑
- `info.json`：插件元信息与配置项定义
- `icon.png`：插件图标
- `plugin.com.pot-app.openai-ocr.potext`：打包后的插件文件

## 安装说明

- 本仓库同时包含源码和已打包的 `.potext` 插件文件
- 若你只想使用插件，可直接安装仓库中的 `.potext` 文件
- 若你想继续开发或修改插件，可基于本仓库源码进行维护

## 许可证

本项目使用仓库内的 `LICENSE` 许可证。
