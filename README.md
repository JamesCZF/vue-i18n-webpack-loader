# vue-i18n-webpack-loader

## 简介
- 自动查找 包含中文 的字符串，并替换为vue-i18n的$t方法


```bash
npm i vue-i18n-webpack-loader -D
```
## 目前支持vue中的4种情况
```bash
目前支持Vue文件国际化4种情况：
1.模板标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
2.模板标签上的属性 placeholder,label placeholder="中文" => :placeholder="$t(key)" label="中文" => :label="$t(key)"
3.this.xx = '中文' => this.xx = this.$t('key')
4.表单校验中message中文
```

## 使用

- vue.config.js 中的配置loader

```js
// keyMaps为中文和国际化key的映射字典
//如下
{
  "登录": "04-002-002.1.1",
  "请输入验证码": "04-002-002.1.2",
  "新增分类": "04-002-002.2.1",
  "请输入分类名称": "04-002-002.2.2",
  "分类名称": "04-002-002.2.3"
}

module.exports = {
  chainWebpack: config => {
    config.module
      .rule("vue-file")
      .test(/\.vue$/)
      .use("vue-i18n-webpack-loader")
      .loader("vue-i18n-webpack-loader")
      .options({ keyMaps })
      .end();
  },
};
```
## 示例
```js
// 原始代码
<a-button>登录</a-button>
<a-input
  class="input"
  v-model="form.code"
  placeholder="请输入验证码"
  :maxLength="6"
/>
<a-form-model-item label="分类名称"></a-form-model-item>
//表单校验message提示
rules: {
  name: [
    {
      required: true,
      message: "请输入分类名称",
      trigger: "blur"
    }
  ],
}
  //vue方法中
  onClick() {
    this.title = '新增分类'
  }
```
```js
// 处理后
<a-button>{{ $t("04-002-002.1.1")}}</a-button>
<a-input
  class="input"
  v-model="form.code"
  :placeholder="$t('04-002-002.1.2')"
  :maxLength="6"
/>
<a-form-model-item :label="$t('04-002-002.2.3')"></a-form-model-item>
//表单校验message提示
rules: {
  name: [
    {
      required: true,
      message: this.$t("04-002-002.2.2"),
      trigger: "blur"
    }
  ],
}
  //vue methods中
  onClick() {
    this.title = this.$t('04-002-002.2.1')
  }
```

### 参数说明

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| ---------   | --------- | --------- | --------- | --------- |
| keyMaps      | `json` | - | 是 | 中文和国际化key的映射字典 |