// const bundled = require('npm-bundled')
const tar = require('tar')
const fs = require("fs")

const optionConfig = {
  "workspace": null,
};

const argvObj = process.argv.slice(2).reduce((obj, str) => {
  if (str.startsWith(`--`)) {
    const [key, value] = str.split("=");
    const optionKey = key.split("--")[1];
    if (optionKey in optionConfig) {
      optionConfig[optionKey] = value;
    }
  }
  return obj
}, {})

function start() {
  const workspace = argvObj.workspace;
  const spawn = require("child_process").spawn;
  const pack = spawn("npm", [`pack`, `--workspace=${workspace}`]);
  pack.on("close", (code) => {
    console.log(code)
  })

  // const pkg = require(`${process.cwd()}${workspace ? `/${workspace}` : "" }/package.json`)
  // // async version
  // bundled({ path: process.cwd() }, (er, list) => {
  //   if(!er || !list.length) {
  //     console.log(`no files`)
  //     process.exit(0);
  //     return;
  //   }
  //   const modules = list.map(item => `node_modules/${item}`)
  //   tar.c({
  //     gzip: true,
  //     prefix: "test",
  //   }, [...modules]).pipe(fs.createWriteStream('my-tarball.tgz')).on("close", () => {
  //     process.exit(0)
  //   });
  // })
}

start();