var loaderUtils = require("loader-utils")

// 目前支持Vue文件国际化5种情况：
// 1.模板标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
// 2.模板标签上的属性 placeholder,label placeholder="中文" => :placeholder="$t(key)" label="中文" => :label="$t(key)"
// 3. export default 之内的中文  => this.$t('key)
// 4. 表单校验rules message:'中文' => message: this.$t('key')
// 5. 模板内部 {{ 中文}} => {{ $t('key')}}

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
    const tagReg = new RegExp(`(/*>\\s*)${key}(\\s*</*)`, "g")
    newsource = newsource.replace(tagReg, `$1{{ $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}'}}$2`)
    //2.模板标签上的属性 placeholder,label placeholder="中文" => :placeholder="$t(key)" label="中文" => :label="$t(key)"
    const tagPropertyReg = new RegExp(
      `((placeholder|label|enter-button|title|cancelText|cancel-text|okText|ok-text)=")${key}:*\\s*(")`,
      "g"
    )
    newsource = newsource.replace(tagPropertyReg, `:$1 $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}' $3`)
    //3. export default 之内的中文
    const exportDefaultReg = new RegExp(`(export\\s*default\\s*{(.|\n|\r)*(?=(data\\s*\\(\\))|computed)(.|\n|\r)*)"${key}"`, "g")
    while (newsource.match(exportDefaultReg)) {
      //一个文件中可能存在多个相同的中文 所以用了while语句
      newsource = newsource.replace(
        exportDefaultReg,
        `$1  this.$t('${keyMaps[key]}') !== '${keyMaps[key]}' ? this.$t('${keyMaps[key]}') : '${key}'`
      )
    }
    //4. 表单校验rules message:'中文' => message: this.$t('key')
    const messageReg = new RegExp(`(message:\\s*)"${key}"(,\\s*trigger:)`, "g")
    newsource = newsource.replace(
      messageReg,
      `$1 \`\${this.$t('${keyMaps[key]}') !== '${keyMaps[key]}' ? this.$t('${keyMaps[key]}') : '${key}'}\`$2`
    )
    //5. 模板内部 {{ 中文}} => {{ $t('key')}}
    const templateBracketReg = new RegExp(`(<template>(.|\n|\r)*\\{\\{(.|\n|\r)*)"${key}"((.|\n|\r)*\\}\\}(.|\n|\r)*</template>)`, "g")
    newsource = newsource.replace(templateBracketReg, `$1 $t('${keyMaps[key]}')$4`)
  })
  return newsource
}
