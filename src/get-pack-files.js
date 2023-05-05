const fs = require("fs")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const bundled = promisify(require("./npm-bundled"))

// 获取 pack 内容
async function getPackFiles(packPath, nodeModulesPath) {
  try {
    // 1. 获取基础文件
    const fileList = (await readdir(packPath)).filter(filterFilePath).map(item => `${packPath}/${item}`)

    // 2. 获取node_modules内容
    const moduleList = await getModuleList({ path: packPath, nodeModulesPath: nodeModulesPath || process.cwd(), bundleDependenciesKey: "dependencies" });
    return { fileList, moduleList };
  } catch (error) {
    console.log(error)
  }
}

function filterFilePath(path) {
  return !/node_modules/.test(path)
}

async function getModuleList(opt) {
  const moduleList = (
    await bundled({ path: opt.path, nodeModulesPath: opt.nodeModulesPath, bundleDependenciesKey: opt.bundleDependenciesKey })
  )
  for (let index = 0; index < moduleList.length; index++) {
    const item = moduleList[index];
    moduleList[index] = await getRealPath(`${opt.nodeModulesPath}/node_modules/${item}`)
  }
  return moduleList;
}

async function getRealPath(path) {
  return new Promise((resolve) => {
    // We need to resolve the real native path for case-insensitive file systems.
    // For example, we can access file as C:\Code\Project as well as c:\code\projects
    // Without this we can face a problem when try to install packages with -w flag,
    // when root dir is using c:\code\projects but packages were found by C:\Code\Project
    fs.realpath.native(path, function (err, resolvedPath) {
      resolve(err !== null ? path : resolvedPath)
    })
  })
}

module.exports = getPackFiles;