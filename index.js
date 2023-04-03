var loaderUtils = require("loader-utils")

// Vue文件国际化3种情况：
// 1.标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
// 2.placeholder placeholder="中文" => :placeholder="$t(key)"
// 3.script内部 <script> ... 中文  ...</script> => <script> ... this.$t('key')  ...</script>

module.exports = function (source) {
  var opts = loaderUtils.getOptions(this) || {}
  const { keyMaps } = opts
  if (!keyMaps) {
    return
  }
  let newsource = source
  Object.keys(keyMaps).forEach(key => {
    //$t(key) 返回的值是key表明翻译失败 不相等表明翻译成功
    //标签内部： <tag> 中文 </tag> => 中文=> {{$t('key')}}
    const tagReg = new RegExp(`(>\\s*)${key}(\\s*</)`, "g")
    //placeholder placeholder="中文" => :placeholder="$t(key)"
    const palcehodlerReg = new RegExp(`(placeholder=")${key}(")`, "g")
    newsource = newsource.replace(palcehodlerReg, `:$1 $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}' $2`)
    newsource = newsource.replace(tagReg, `$1{{ $t('${keyMaps[key]}') !== '${keyMaps[key]}' ? $t('${keyMaps[key]}') : '${key}' }}$2`)
  })
  return newsource
}
