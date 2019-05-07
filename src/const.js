/** 请求方式 */
module.exports.Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH'
}

/** 是否必需 */
module.exports.Required = {
  /** 不必需 */
  false: '0',
  /** 必需 */
  true: '1'
}

/** 返回数据类型 */
module.exports.ResponseBodyType = {
  /** JSON */
  json: 'json',
  /** 纯文本 */
  text: 'text',
  /** XML */
  xml: 'xml',
  /** 原始数据 */
  raw: 'raw'

  // yapi 实际上返回的是 json，有另外的字段指示其是否是 json schema
  /** JSON Schema */
  // jsonSchema = 'json-schema',
}

/** 请求数据类型 */
module.exports.RequestBodyType = {
  /** 查询字符串 */
  query: 'query',
  /** 表单 */
  form: 'form',
  /** JSON */
  json: 'json',
  /** 纯文本 */
  text: 'text',
  /** 文件 */
  file: 'file',
  /** 原始数据 */
  raw: 'raw',
  /** 无请求数据 */
  none: 'none'
}
