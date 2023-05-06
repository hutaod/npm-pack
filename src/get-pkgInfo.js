const fs = require("fs")
const fg = require('fast-glob');
const path = require('path');
const YAML = require('yaml');
const getPkgManager = require("./get-pkg-manager")

/**
 * 
 * @param {string} workspace 
 * @returns {Promise<{ pkgPath: string }>}
 */
module.exports = async function findPkgInfo (workspace) {
  if (!workspace) {
    return getNoRootPkgInfo();
  }
  const pkgManager = getPkgManager();
  const usePnpm = pkgManager === "pnpm";

  const workspaces = ["packages/*"];
  if (usePnpm) {
    try {
      const file = fs.readFileSync(`${process.cwd()}/pnpm-workspace.yaml`, 'utf8')
      const data = YAML.parse(file)
      if(data) {
        workspaces.push(...(data.packages || []))
      }
    } catch (error) {
      console.log(error);
      // ...
    }
  }

  if (workspaces.length === 1) {
    try {
      workspaces.push(...(require(`${process.cwd()}/package.json`).workspaces || []))
    } catch (error) {
      console.log("no root package.json")
    }
  }

  // 没有设置 workspaces，则设置默认值
  if (workspaces.length === 1) {
    console.log("not set packages, use default workspaces: packages")
  }

  console.log("workspaces:", workspaces)

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
      return {
        pkgPath: path.resolve(process.cwd(), pkgPath.replace("/package.json", "")),
        pkgJson: require(path.resolve(process.cwd(), pkgPath))
      };
    }
    i++;
  }
  return getNoRootPkgInfo();
}

function getNoRootPkgInfo() {
  return {
    pkgPath: process.cwd(),
    pkgJson: require(`${process.cwd()}/package.json`)
  };
}