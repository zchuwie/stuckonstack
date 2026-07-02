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
    await fs.copy(fePath, path.join(targetDir, 'client'));
  }

  const isSupabase = backend === 'supabase' || database === 'supabase';
  const isFirebase = backend === 'firebase' || database === 'firebase';
  const isBaaS = backend === 'supabase' || backend === 'firebase';

  // Copy backend (only if it's not a BaaS)
  if (backend && !isBaaS) {
    const bePath = path.join(__dirname, '../templates/backends', backend);
    await fs.copy(bePath, path.join(targetDir, 'server'));
  }

  // Database extension overlay
  if (backend && database && !isBaaS) {
    const dbExtPath = path.join(__dirname, '../templates/database-extensions', `${database}-${backend}`);
    if (await fs.pathExists(dbExtPath)) {
      await fs.copy(dbExtPath, path.join(targetDir, 'server'), { overwrite: true });
      
      // Merge package.json
      const basePkgPath = path.join(targetDir, 'server', 'package.json');
      const extPkgPath = path.join(dbExtPath, 'package.json');
      if (await fs.pathExists(basePkgPath) && await fs.pathExists(extPkgPath)) {
        const basePkg = await fs.readJson(basePkgPath);
        const extPkg = await fs.readJson(extPkgPath);
        const mergedPkg = mergePackageJson(basePkg, extPkg);
        await fs.writeJson(basePkgPath, mergedPkg, { spaces: 2 });
      }
    }
  }

  // Auth extension overlay & Placeholder injection
  if (config.auth) {
    const authPath = path.join(__dirname, '../templates/auth', config.auth);
    if (await fs.pathExists(authPath)) {
      await fs.copy(authPath, path.join(targetDir, 'client', 'src', 'auth'), { overwrite: true });

      // Inject React Auth wiring
      if (frontend === 'react-vite') {
        const appPath = path.join(targetDir, 'client', 'src', 'App.tsx');
        if (await fs.pathExists(appPath)) {
          let appContent = await fs.readFile(appPath, 'utf8');
          appContent = appContent.replace('/* {{AUTH_IMPORTS}} */', `import { AuthProvider } from "./auth/src/auth/AuthProvider";\nimport { Login } from "./auth/src/pages/Login";\nimport { Signup } from "./auth/src/pages/Signup";\nimport { SignedIn, SignedOut } from "@clerk/clerk-react";\nimport { Navigate } from "react-router-dom";`);
          appContent = appContent.replace('/* {{AUTH_PROVIDER_START}} */', '<AuthProvider>');
          appContent = appContent.replace('/* {{AUTH_PROVIDER_END}} */', '</AuthProvider>');
          appContent = appContent.replace('/* {{HOME_ROUTE}} */', `<Route path="/" element={<><SignedIn><Home /></SignedIn><SignedOut><Navigate to="/login" /></SignedOut></>} />`);
          appContent = appContent.replace('/* {{AUTH_ROUTES}} */', `<Route path="/login" element={<Login />} />\n        <Route path="/signup" element={<Signup />} />`);
          await fs.writeFile(appPath, appContent, 'utf8');
        }
      // Inject Next.js Auth wiring
      if (frontend === 'nextjs') {
        const layoutPath = path.join(targetDir, 'client', 'app', 'layout.tsx');
        if (await fs.pathExists(layoutPath)) {
          let layoutContent = await fs.readFile(layoutPath, 'utf8');
          layoutContent = layoutContent.replace('/* {{AUTH_IMPORTS}} */', `import { ClerkProvider } from '@clerk/nextjs'`);
          layoutContent = layoutContent.replace('/* {{AUTH_PROVIDER_START}} */', '<ClerkProvider>');
          layoutContent = layoutContent.replace('/* {{AUTH_PROVIDER_END}} */', '</ClerkProvider>');
          await fs.writeFile(layoutPath, layoutContent, 'utf8');
        }
        const pagePath = path.join(targetDir, 'client', 'app', 'page.tsx');
        if (await fs.pathExists(pagePath)) {
          let pageContent = await fs.readFile(pagePath, 'utf8');
          pageContent = pageContent.replace('/* {{AUTH_PROTECT}} */\n\n', '');
          await fs.writeFile(pagePath, pageContent, 'utf8');
        }
        await fs.writeFile(
          path.join(targetDir, 'client', 'middleware.ts'),
          `import { clerkMiddleware } from "@clerk/nextjs/server";\n\nexport default clerkMiddleware();\n\nexport const config = {\n  matcher: ["/((?!.+\\\\.[\\\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],\n};`,
          'utf8'
        );
      }
    }
  } else {
    // Strip placeholders if no auth is selected
    if (frontend === 'react-vite') {
      const appPath = path.join(targetDir, 'client', 'src', 'App.tsx');
      if (await fs.pathExists(appPath)) {
        let appContent = await fs.readFile(appPath, 'utf8');
        appContent = appContent.replace('/* {{AUTH_IMPORTS}} */\n', '');
        appContent = appContent.replace('/* {{AUTH_PROVIDER_START}} */\n    ', '');
        appContent = appContent.replace('\n    /* {{AUTH_PROVIDER_END}} */', '');
        appContent = appContent.replace('/* {{HOME_ROUTE}} */', '<Route path="/" element={<Home />} />');
        appContent = appContent.replace('/* {{AUTH_ROUTES}} */\n        ', '');
        await fs.writeFile(appPath, appContent, 'utf8');
      }
    }
    if (frontend === 'nextjs') {
      const layoutPath = path.join(targetDir, 'client', 'app', 'layout.tsx');
      if (await fs.pathExists(layoutPath)) {
        let layoutContent = await fs.readFile(layoutPath, 'utf8');
        layoutContent = layoutContent.replace('/* {{AUTH_IMPORTS}} */\n', '');
        layoutContent = layoutContent.replace('/* {{AUTH_PROVIDER_START}} */\n    ', '');
        layoutContent = layoutContent.replace('\n    /* {{AUTH_PROVIDER_END}} */', '');
        await fs.writeFile(layoutPath, layoutContent, 'utf8');
      }
      const pagePath = path.join(targetDir, 'client', 'app', 'page.tsx');
      if (await fs.pathExists(pagePath)) {
        let pageContent = await fs.readFile(pagePath, 'utf8');
        pageContent = pageContent.replace('/* {{AUTH_PROTECT}} */\n\n', '');
        await fs.writeFile(pagePath, pageContent, 'utf8');
      }
    }
  }
  // Write env
  await writeEnv(targetDir, config);

  const rootPkg: any = {
    name: config.projectName || 'my-app',
    private: true,
    scripts: {}
  };

  // Create BaaS typical folders
  if (isSupabase) {
    await fs.ensureDir(path.join(targetDir, 'supabase', 'migrations'));
    await fs.ensureDir(path.join(targetDir, 'supabase', 'functions'));
  }
  if (isFirebase) {
    await fs.ensureDir(path.join(targetDir, 'firebase', 'functions'));
  }

  const hasNodeBackend = !!backend && !isBaaS;

  if (config.runner === 'docker') {
    await writeDockerCompose(targetDir, config);
    rootPkg.scripts = {
      "dev": "docker-compose up --build"
    };
  } else if (config.runner === 'npm') {
    if (hasNodeBackend) {
      rootPkg.scripts = {
        "install:all": "npm install --prefix client && npm install --prefix server",
        "dev": "concurrently \"npm run dev --prefix client\" \"npm run dev --prefix server\""
      };
      rootPkg.devDependencies = {
        "concurrently": "^8.2.0"
      };
    } else {
      rootPkg.scripts = {
        "install:all": "npm install --prefix client",
        "dev": "npm run dev --prefix client"
      };
    }
  }

  await fs.writeJson(path.join(targetDir, 'package.json'), rootPkg, { spaces: 2 });
}
