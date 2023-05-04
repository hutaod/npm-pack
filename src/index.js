const tar = require('tar')
const fs = require("fs")
const arg = require('arg');
const fg = require('fast-glob');
const path = require('path');
const getPackFiles = require("./get-pack-files");

const args = arg({
  '--workspace': String,
})

async function start() {
  try {
    const rootPkg = require(`${process.cwd()}/package.json`);
    const workspace = args["--workspace"];
    // 1. 获取包路径
    let pkgDir = process.cwd();
    if(workspace) {
      // workspace
      pkgDir = await findWorkspaceDir(rootPkg.workspaces || [], workspace);
    } else {
      // root
    }

    // 2. 获取 pack 内容
    const packFiles = await getPackFiles(pkgDir);

    console.log(packFiles)

    // npm/yarn/pnpm pack 暂时先支持npm
    tar.c({
      gzip: true,
      prefix: "test",
    }, [...packFiles]).pipe(fs.createWriteStream('my-tarball.tgz')).on("close", () => {
      process.exit(0)
    });

  } catch (error) {
    console.log(error)
  }
}

start();

async function findWorkspaceDir (workspaces, workspace) {
  let i = 0;
  while (i < workspaces.length) {
    const isDir = workspaces[i].split("/")[1] !== undefined;
    let pkgPath;
    if(isDir) {
      const workspaceItem = workspaces[i].endsWith("/*") ? `${workspaces[i]}*` : workspaces[i];
      pkgPath = (await fg([process.cwd(), `./${workspaceItem}/${workspace}/package.json`]))[0];
    } else if(workspace === workspaces[i] && fs.existsSync(path.resolve(process.cwd(), `./${workspace}/package.json`))) {
      pkgPath = `./${workspace}/package.json`;
    }
    if (pkgPath) {
      return path.resolve(process.cwd(), pkgPath.replace("/package.json", ""));
    }
    i++;
  }
}