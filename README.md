## 重要声明

- 本项目是借鉴[postcss-px2rem](https://www.npmjs.com/package/postcss-px2rem)的基础上进行的二次开发。
- 基于media媒体查询进行不同屏幕分辨率适配方案
- 基本用法与postcss-px2rem一致
- 使用方法
```json


    //增加vue.config.js文件配置css
    css: {
        loaderOptions: {
            postcss: {
                plugins: [
                    require('postcss-media2px')({
                        defaultUnit: "device-width",// 还可以通过其他方式
                        ratios: [
                            {
                                min: 1300,
                                ratio: 0.6
                            }, {
                                min: 1300,
                                max: 1400,
                                ratio: 0.7
                            }, {
                                min: 1400,
                                max: 1600,
                                ratio: 1
                            }, {
                                max: 1600,
                                ratio: 1.2
                            }
                        ]
                    })
                ]
            }

        }
    }


```
