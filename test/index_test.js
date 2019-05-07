const Generator = require('../src/index')
const consola = require('consola')

const config = [
  {
    serverUrl: 'http://127.0.0.1:3000',
    prodEnvName: 'local',
    outputFilePath: 'dist/api/index.ts',
    requestFunctionFilePath: 'dist/api/request.ts',
    dataKey: 'data',
    projects: [
      {
        token:
          '1ea9394dadfae6a45bbf9f316f7e8c6c137095db9adbdbcc1f1d2dbe23957c89',
        categories: [
          {
            id: 11,
            getRequestFunctionName(interfaceInfo, changeCase) {
              return changeCase.camelCase(interfaceInfo.parsedPath.name)
            }
          }
        ]
      }
    ]
  }
]

async function entry() {
  try {
    const generator = new Generator(config)
    consola.success('正在获取数据并生成代码...')
    const output = await generator.generate()
    consola.success('获取数据并生成代码完毕')
    await generator.write(output)
    consola.success('写入文件完毕')
  } catch (err) {
    return consola.error(err)
  }
}

entry()
