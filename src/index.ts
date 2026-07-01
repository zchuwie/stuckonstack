import { intro, outro, select, text, confirm, isCancel, cancel, spinner } from "@clack/prompts";
import chalk from "chalk";
import path from "path";
import { stitchProject } from "./stitcher";
import { execa } from "execa";

function handleCancel(value: any) {
  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }
}

async function checkEnv(command: string, args: string[]) {
  try {
    await execa(command, args);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const targetArg = process.argv[2];
  const useCurrentDir = targetArg === ".";
  let projectName = useCurrentDir 
    ? process.cwd().split(/[/\\]/).pop() || null 
    : (targetArg ?? null);

  intro(chalk.bgCyan.black(" Welcome to StuckonStack! "));

  const mode = await select({
    message: "How do you want to start?",
    options: [
      { value: "preset", label: "Preset" },
      { value: "custom", label: "Custom" },
    ],
  });
  handleCancel(mode);

  let preset = null;
  let frontend = null;
  let backend = null;
  let database = null;

  if (mode === "preset") {
    preset = await select({
      message: "Choose a preset:",
      options: [
        { value: "mern", label: "MERN — MongoDB + Express + React + Node" },
        { value: "pern", label: "PERN — PostgreSQL + Express + React + Node" },
        { value: "mevn", label: "MEVN — MongoDB + Express + Vue + Node" },
        { value: "t3", label: "T3 — Next.js + tRPC + Prisma + PostgreSQL" },
        { value: "ai-stack", label: "AI Stack — React + FastAPI + PostgreSQL" },
        { value: "next-supabase", label: "Next + Supabase" },
      ],
    });
    handleCancel(preset);
  } else {
    frontend = await select({
      message: "What is your client (frontend)?",
      options: [
        { value: "react-vite", label: "React (Vite)" },
        { value: "nextjs", label: "Next.js" },
        { value: "vue-vite", label: "Vue (Vite)" },
      ],
    });
    handleCancel(frontend);

    backend = await select({
      message: "What is your server (backend)?",
      options: [
        { value: "express", label: "Express" },
        { value: "nestjs", label: "NestJS" },
        { value: "fastapi", label: "FastAPI" },
        { value: "django", label: "Django" },
        { value: "supabase", label: "Supabase (BaaS)" },
        { value: "firebase", label: "Firebase (BaaS)" },
      ],
    });
    handleCancel(backend);

    if (backend === "supabase" || backend === "firebase") {
      database = backend; // It serves as both backend and database
    } else {
      database = await select({
        message: "What is your database?",
        options: [
          { value: "mongodb", label: "MongoDB" },
          { value: "postgresql", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL" },
        ],
      });
      handleCancel(database);
    }
  }

  const wantsAuth = await select({
    message: "Do you want authentication?",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No — skip for now" },
    ],
  });
  handleCancel(wantsAuth);

  let auth = null;
  if (wantsAuth) {
    const authOptions = [
      { value: "clerk", label: "Clerk" },
      { value: "nextauth", label: "Auth.js (NextAuth)" },
    ];
    
    if (database === "supabase") {
      authOptions.unshift({ value: "supabase-auth", label: "(Recommended) Supabase Auth" });
      authOptions.push({ value: "firebase-auth", label: "Firebase Auth" });
    } else if (database === "firebase") {
      authOptions.unshift({ value: "firebase-auth", label: "(Recommended) Firebase Auth" });
      authOptions.push({ value: "supabase-auth", label: "Supabase Auth" });
    } else {
      authOptions.push({ value: "supabase-auth", label: "Supabase Auth" });
      authOptions.push({ value: "firebase-auth", label: "Firebase Auth" });
    }

    auth = await select({
      message: "Choose auth provider:",
      options: authOptions,
    });
    handleCancel(auth);
  }

  if (preset) {
    if (preset === 'mern') { frontend = 'react-vite'; backend = 'express'; database = 'mongodb'; }
    if (preset === 'pern') { frontend = 'react-vite'; backend = 'express'; database = 'postgresql'; }
    if (preset === 'mevn') { frontend = 'vue-vite'; backend = 'express'; database = 'mongodb'; }
    if (preset === 't3') { frontend = 'nextjs'; backend = 'trpc'; database = 'postgresql'; }
    if (preset === 'ai-stack') { frontend = 'react-vite'; backend = 'fastapi'; database = 'postgresql'; }
    if (preset === 'next-supabase') { frontend = 'nextjs'; backend = null; database = 'supabase'; }
  }

  const needsPython = backend === "fastapi" || backend === "django";
  const needsNode = true;

  console.log(chalk.bold("\nChecking Environment:"));

  const s1 = spinner();
  s1.start("Checking Docker...");
  
  const hasDockerCli = await checkEnv("docker", ["--version"]);
  if (!hasDockerCli) {
    s1.stop(chalk.yellow("⚠️ Docker missing."));
    console.log(chalk.gray("  → Please install it: https://docs.docker.com/get-docker/"));
  } else {
    const isDockerRunning = await checkEnv("docker", ["info"]);
    if (isDockerRunning) {
      s1.stop(chalk.green("✔ Docker is installed and running."));
    } else {
      s1.stop(chalk.yellow("⚠️ Docker is installed, but not running."));
      console.log(chalk.gray("  → Please open the Docker Desktop app to start the daemon before running the project."));
    }
  }

  // To decide options, we need the CLI at minimum, but warn if not running.
  const hasDocker = hasDockerCli;

  if (needsPython) {
    const s2 = spinner();
    s2.start("Checking Python...");
    const hasPython = await checkEnv("python", ["--version"]) || await checkEnv("python3", ["--version"]);
    if (hasPython) {
      s2.stop(chalk.green("✔ Python found."));
    } else {
      s2.stop(chalk.yellow("⚠️ Python missing."));
      console.log(chalk.gray(`  → Your backend (${backend}) requires Python: https://www.python.org/downloads/`));
    }
  }

  if (needsNode) {
    const s3 = spinner();
    s3.start("Checking Node.js...");
    const hasNode = await checkEnv("node", ["-v"]);
    if (hasNode) {
      s3.stop(chalk.green("✔ Node.js found."));
    } else {
      s3.stop(chalk.yellow("⚠️ Node.js missing."));
      console.log(chalk.gray("  → Guide: https://nodejs.org/"));
    }
  }
  console.log("");

  const runnerOptions = [
    { value: "npm", label: "Native (npm root package — lightweight, best for most PCs)" },
  ];
  if (hasDocker) {
    runnerOptions.unshift({ value: "docker", label: "(Recommended) Docker (docker-compose — isolated)" });
  } else {
    runnerOptions.push({ value: "docker", label: "Docker (Requires installation: https://docs.docker.com/get-docker/)" });
  }

  const runner = await select({
    message: "How do you want to run this project locally?",
    options: runnerOptions,
  });
  handleCancel(runner);

  if (!projectName) {
    projectName = await text({
      message: "What is your project name?",
      placeholder: "my-app",
      validate(value) {
        if (value.length === 0) return "Project name is required!";
      },
    });
    handleCancel(projectName);
  }

  const config = {
    projectName,
    mode,
    preset,
    frontend,
    backend,
    database,
    auth,
    runner,
    useCurrentDir,
    targetDir: useCurrentDir ? process.cwd() : path.join(process.cwd(), projectName as string),
  };

  console.log("\nHere's your stack:");
  console.log(chalk.cyan(JSON.stringify(config, null, 2)));

  const confirmed = await confirm({
    message: "Confirm and generate?",
  });
  handleCancel(confirmed);

  if (!confirmed) {
    cancel("Operation cancelled by user.");
    process.exit(0);
  }

  const s = spinner();
  s.start("Scaffolding your project...");
  await stitchProject(config);
  s.stop("Project scaffolded successfully!");

  const cdCommand = useCurrentDir ? "" : `cd ${projectName}\n  `;
  const runCommand = runner === 'npm' 
    ? "npm install\n  npm run install:all\n  npm run dev" 
    : "npm run dev";
  
  outro(`Let's build something. 🚀\n\nNext steps:\n  ${cdCommand}${runCommand}`);
}

main();