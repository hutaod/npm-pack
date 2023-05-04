import fs from 'fs'
import path from 'path'
import findUp from 'find-up'

const WORKSPACE_DIR_ENV_VAR = 'NPM_CONFIG_WORKSPACE_DIR'
const WORKSPACE_MANIFEST_FILENAME = 'pnpm-workspace.yaml'

export async function findWorkspaceDir (cwd) {
  const workspaceManifestDirEnvVar = process.env[WORKSPACE_DIR_ENV_VAR] ?? process.env[WORKSPACE_DIR_ENV_VAR.toLowerCase()]
  const workspaceManifestLocation = workspaceManifestDirEnvVar
    ? path.join(workspaceManifestDirEnvVar, 'pnpm-workspace.yaml')
    : await findUp([WORKSPACE_MANIFEST_FILENAME, 'pnpm-workspace.yml'], { cwd: await getRealPath(cwd) })
  return workspaceManifestLocation && path.dirname(workspaceManifestLocation)
}

async function getRealPath (path) {
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