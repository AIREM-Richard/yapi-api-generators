const jsonSchemaGenerator = require('json-schema-generator')
const Mock = require('mockjs')
const path = require('path')
const { castArray, forOwn, isArray, isEmpty, isObject } = require('vtils')
const { compile } = require('json-schema-to-typescript')

/**
 * 抛出错误。
 *
 * @param msg 错误信息
 */
module.exports.throwError = function(...msg) {
  throw new Error(msg.join(''))
}

/**
 * 将路径统一为 unix 风格的路径。
 *
 * @param path 路径
 * @returns unix 风格的路径
 */
function toUnixPath(path) {
  return path.replace(/[/\\]+/g, '/')
}

module.exports.toUnixPath = toUnixPath

/**
 * 获得规范化的相对路径。
 *
 * @param from 来源路径
 * @param to 去向路径
 * @returns 相对路径
 */
module.exports.getNormalizedRelativePath = function(from, to) {
  return toUnixPath(path.relative(from, to)).replace(/^(?=[^.])/, './')
}

/**
 * 原地处理 JSONSchema。
 *
 * @param jsonSchema 待处理的 JSONSchema
 * @returns 处理后的 JSONSchema
 */
function processJsonSchema(jsonSchema) {
  if (!isObject(jsonSchema)) return jsonSchema

  // 去除 title 和 id，防止 json-schema-to-typescript 提取它们作为接口名
  delete jsonSchema.title
  delete jsonSchema.id

  // 将 additionalProperties 设为 false
  jsonSchema.additionalProperties = false

  // Mock.toJSONSchema 产生的 properties 为数组，然而 JSONSchema4 的 properties 为对象
  if (isArray(jsonSchema.properties)) {
    jsonSchema.properties = jsonSchema.properties.reduce((props, js) => {
      props[js.name] = js
      return props
    }, {})
  }

  // 继续处理对象的子元素
  if (jsonSchema.properties) {
    forOwn(jsonSchema.properties, processJsonSchema)
  }

  // 继续处理数组的子元素
  if (jsonSchema.items) {
    castArray(jsonSchema.items).forEach(processJsonSchema)
  }

  return jsonSchema
}

module.exports.processJsonSchema = processJsonSchema

/**
 * 将 JSONSchema 字符串转为 JSONSchema 对象。
 *
 * @param str 要转换的 JSONSchema 字符串
 * @returns 转换后的 JSONSchema 对象
 */
module.exports.jsonSchemaStringToJsonSchema = function(str) {
  return processJsonSchema(JSON.parse(str))
}

/**
 * 获得 JSON 数据的 JSONSchema 对象。
 *
 * @param json JSON 数据
 * @returns JSONSchema 对象
 */
module.exports.jsonToJsonSchema = function(json) {
  return processJsonSchema(jsonSchemaGenerator(json))
}

/**
 * 获得 mockjs 模板的 JSONSchema 对象。
 *
 * @param template mockjs 模板
 * @returns JSONSchema 对象
 */
module.exports.mockjsTemplateToJsonSchema = function(template) {
  return processJsonSchema(Mock.toJSONSchema(template))
}

/**
 * 获得属性定义列表的 JSONSchema 对象。
 *
 * @param propDefinitions 属性定义列表
 * @returns JSONSchema 对象
 */
module.exports.propDefinitionsToJsonSchema = function(propDefinitions) {
  return processJsonSchema({
    type: 'object',
    required: propDefinitions.reduce((res, prop) => {
      if (prop.required) {
        res.push(prop.name)
      }
      return res
    }, []),
    properties: propDefinitions.reduce((res, prop) => {
      res[prop.name] = {
        type: prop.type,
        description: prop.comment,
        ...(prop.type === 'file' ? { tsType: FileData.name } : {})
      }
      return res
    }, {})
  })
}

const JSTTOptions = {
  bannerComment: '',
  style: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'none',
    useTabs: false
  }
}

/**
 * 根据 JSONSchema 对象生产 TypeScript 类型定义。
 *
 * @param jsonSchema JSONSchema 对象
 * @param typeName 类型名称
 * @returns TypeScript 类型定义
 */
module.exports.jsonSchemaToType = async function jsonSchemaToType(
  jsonSchema,
  typeName
) {
  if (isEmpty(jsonSchema)) {
    return `export interface ${typeName} {}`
  }
  const code = await compile(jsonSchema, typeName, JSTTOptions)
  return code.trim()
}
