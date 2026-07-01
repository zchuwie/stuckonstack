import fs from 'fs-extra';
import path from 'path';
import { mergePackageJson } from './merge-pkg';
import { writeEnv } from './env-writer';
import { writeDockerCompose } from './docker-writer';

export async function stitchProject(config: any) {
  const { targetDir, frontend, backend, database } = config;
  
  await fs.ensureDir(targetDir);

  // Copy frontend
  if (frontend) {
    const fePath = path.join(__dirname, '../templates/frontends', frontend);
    await fs.copy(fePath, path.join(targetDir, 'frontend'));
  }

  // Copy backend
  if (backend) {
    const bePath = path.join(__dirname, '../templates/backends', backend);
    await fs.copy(bePath, path.join(targetDir, 'backend'));
  }

  // Database extension overlay
  if (backend && database) {
    const dbExtPath = path.join(__dirname, '../templates/database-extensions', `${database}-${backend}`);
    if (await fs.pathExists(dbExtPath)) {
      await fs.copy(dbExtPath, path.join(targetDir, 'backend'), { overwrite: true });
      
      // Merge package.json
      const basePkgPath = path.join(targetDir, 'backend', 'package.json');
      const extPkgPath = path.join(dbExtPath, 'package.json');
      if (await fs.pathExists(basePkgPath) && await fs.pathExists(extPkgPath)) {
        const basePkg = await fs.readJson(basePkgPath);
        const extPkg = await fs.readJson(extPkgPath);
        const mergedPkg = mergePackageJson(basePkg, extPkg);
        await fs.writeJson(basePkgPath, mergedPkg, { spaces: 2 });
      }
    }
  }

  // Auth extension overlay
  // (to be implemented later)

  // Write env
  await writeEnv(targetDir, config);

  const rootPkg: any = {
    name: config.projectName || 'my-app',
    private: true,
    scripts: {}
  };

  if (config.runner === 'docker') {
    await writeDockerCompose(targetDir, config);
    rootPkg.scripts = {
      "dev": "docker-compose up --build"
    };
  } else if (config.runner === 'npm') {
    rootPkg.scripts = {
      "install:all": "npm install --prefix frontend && npm install --prefix backend",
      "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\""
    };
    rootPkg.devDependencies = {
      "concurrently": "^8.2.0"
    };
  }

  await fs.writeJson(path.join(targetDir, 'package.json'), rootPkg, { spaces: 2 });
}
