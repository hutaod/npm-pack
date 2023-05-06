const fs = require("fs")
const arg = require('arg');
const compressing = require('compressing');
const getPackFiles = require("./get-pack-files");
const getPkgInfo = require("./get-pkgInfo")

const args = arg({
  '--workspace': String,
})

start();

async function start() {
  try {
    const workspace = args["--workspace"];
    // 1. 获取包路径
    const { pkgPath, pkgJson } = await getPkgInfo(workspace);

    // 2. 获取 pack 内容
    const { fileList, moduleList } = await getPackFiles(pkgPath, process.cwd());

    // 3. 生成 tgz 包
    generateTgz(`${pkgJson.name}-0.0.1.tgz`, { fileList, moduleList })
  } catch (error) {
    console.log(error)
  }
}

/**
 * 
 * @param {string} targetPath 
 * @param {{ fileList: string[], moduleList: string[] }} param1 
 */
function generateTgz(targetPath, { fileList, moduleList }) {
  const tarStream = new compressing.tgz.Stream();
  const writeStream = fs.createWriteStream(targetPath);
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList[index];
    tarStream.addEntry(file);
  }
  for (let index = 0; index < moduleList.length; index++) {
    const moduleItem = moduleList[index];
    const slices = moduleItem.split("node_modules/");
    const moduleName = slices[slices.length - 1];
    const scope = moduleName.startsWith("@") ? moduleName.match(/(@.+)\//)?.[1] : "";
    tarStream.addEntry(moduleItem, { relativePath: `./node_modules/${scope || ""}` });
  }
  tarStream.pipe(writeStream)
}
