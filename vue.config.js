module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        "productName": "图片压缩",
        "directories": { // 输出文件夹
          "output": "dist"
        },
        "nsis": {
          "oneClick": false, // 是否一键安装
          "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          "allowToChangeInstallationDirectory": true, // 允许修改安装目录
          "installerIcon": "src/assets/icon.ico",// 安装图标
          "uninstallerIcon": "src/assets/icon.ico",//卸载图标
          "installerHeaderIcon": "src/assets/icon.ico", // 安装时头部图标
          "createDesktopShortcut": true, // 创建桌面图标
          "createStartMenuShortcut": true,// 创建开始菜单图标
          "shortcutName": "compress-img" // 图标名称
        },
        "win": {
          "icon": "src/assets/icon.ico",
          "target": [
            {
              "target": "nsis",
              "arch": [
                "x64"
              ]
            }
          ]
        }
      }
    }
  }
}
