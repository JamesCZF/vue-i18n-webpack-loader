var loaderUtils = require("loader-utils")

// 目前支持Vue文件国际化4种情况：
// 1.模板标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
// 2.模板标签上的属性 placeholder,label placeholder="中文" => :placeholder="$t(key)" label="中文" => :label="$t(key)"
// 3.this.xx = '中文' => this.xx = this.$t('key')
// 4.表单校验中message中文

module.exports = function (source) {
  var opts = loaderUtils.getOptions(this) || {}
  const { keyMaps } = opts
  if (!keyMaps) {
    return source
  }
  let newsource = source
  Object.keys(keyMaps).forEach(key => {
    //$t(key) 返回的值是key表明翻译失败 不相等表明翻译成功
    //1.模板标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
    const tagReg = new RegExp(`(>\\s*)${key}(\\s*</)`, "g")
    newsource = newsource.replace(tagReg, `$1{{ $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}' }}$2`)
    //2.模板标签上的属性 placeholder,label placeholder="中文" => :placeholder="$t(key)" label="中文" => :label="$t(key)"
    const tagPropertyReg = new RegExp(`((placeholder|label)=")${key}.*(")`, "g")
    newsource = newsource.replace(tagPropertyReg, `:$1 $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}' $3`)
    //3. this.xx = '中文' => this.xx = this.$t('key')
    // const scriptReg = new RegExp(`(<script[^>]*>[^<]*)${key}+([^<]*<\\/script>)`, "g");
    const thisReg = new RegExp(`(this.\\w+\\s*=\\s*)"${key}"`, "g")
    newsource = newsource.replace(
      thisReg,
      `$1 \`\${this.$t('${keyMaps[key]}') !== '${keyMaps[key]}' ? this.$t('${keyMaps[key]}') : '${key}'}\``
    )
    //4. message:'中文' => message: this.$t('key')
    const messageReg = new RegExp(`(message:\\s*)"${key}"(,\\s*trigger:)`, "g")
    newsource = newsource.replace(
      messageReg,
      `$1 \`\${this.$t('${keyMaps[key]}') !== '${keyMaps[key]}' ? this.$t('${keyMaps[key]}') : '${key}'}\`$2`
    )
  })
  return newsource
}
