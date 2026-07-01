import fs from 'fs-extra';

export function mergePackageJson(basePkg: any, extPkg: any) {
  const merged = { ...basePkg, ...extPkg };
  
  if (basePkg.dependencies || extPkg.dependencies) {
    merged.dependencies = { ...basePkg.dependencies, ...extPkg.dependencies };
  }
  
  if (basePkg.devDependencies || extPkg.devDependencies) {
    merged.devDependencies = { ...basePkg.devDependencies, ...extPkg.devDependencies };
  }

  if (basePkg.scripts || extPkg.scripts) {
    merged.scripts = { ...basePkg.scripts, ...extPkg.scripts };
  }

  return merged;
}
