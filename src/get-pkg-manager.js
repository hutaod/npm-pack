const fs = require("fs")
const path = require("path")
const execSync = require("child_process").execSync

/**
 * get package manager
 * @param {string|undefined} baseDir process.cwd()
 * @returns {'npm' | 'pnpm' | 'yarn'}
 */
module.exports = function getPkgManager(baseDir = process.cwd()) {
  try {
    for (const { lockFile, packageManager } of [
      { lockFile: 'yarn.lock', packageManager: 'yarn' },
      { lockFile: 'pnpm-lock.yaml', packageManager: 'pnpm' },
      { lockFile: 'package-lock.json', packageManager: 'npm' },
    ]) {
      if (fs.existsSync(path.join(baseDir, lockFile))) {
        return packageManager
      }
    }
    const userAgent = process.env.npm_config_user_agent
    if (userAgent) {
      if (userAgent.startsWith('yarn')) {
        return 'yarn'
      } else if (userAgent.startsWith('pnpm')) {
        return 'pnpm'
      }
    }
    try {
      execSync('yarn --version', { stdio: 'ignore' })
      return 'yarn'
    } catch {
      execSync('pnpm --version', { stdio: 'ignore' })
      return 'pnpm'
    }
  } catch {
    return 'npm'
  }
}
