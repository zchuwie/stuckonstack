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
      message: "What is your frontend?",
      options: [
        { value: "react-vite", label: "React (Vite)" },
        { value: "nextjs", label: "Next.js" },
        { value: "vue-vite", label: "Vue (Vite)" },
      ],
    });
    handleCancel(frontend);

    backend = await select({
      message: "What is your backend?",
      options: [
        { value: "express", label: "Express" },
        { value: "nestjs", label: "NestJS" },
        { value: "fastapi", label: "FastAPI" },
        { value: "django", label: "Django" },
      ],
    });
    handleCancel(backend);

    database = await select({
      message: "What is your database?",
      options: [
        { value: "mongodb", label: "MongoDB" },
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "supabase", label: "Supabase (managed)" },
        { value: "firebase", label: "Firebase (managed)" },
      ],
    });
    handleCancel(database);
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
    auth = await select({
      message: "Choose auth provider:",
      options: [
        { value: "clerk", label: "Clerk" },
        { value: "supabase-auth", label: "Supabase Auth" },
        { value: "firebase-auth", label: "Firebase Auth" },
        { value: "nextauth", label: "Auth.js (NextAuth)" },
      ],
    });
    handleCancel(auth);
  }

  const runner = await select({
    message: "How do you want to run this project locally?",
    options: [
      { value: "npm", label: "Native (npm root package — lightweight, best for most PCs)" },
      { value: "docker", label: "Docker (docker-compose — isolated, requires Docker installed)" },
    ],
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

  if (preset) {
    if (preset === 'mern') { frontend = 'react-vite'; backend = 'express'; database = 'mongodb'; }
    if (preset === 'pern') { frontend = 'react-vite'; backend = 'express'; database = 'postgresql'; }
    if (preset === 'mevn') { frontend = 'vue-vite'; backend = 'express'; database = 'mongodb'; }
    if (preset === 't3') { frontend = 'nextjs'; backend = 'trpc'; database = 'postgresql'; }
    if (preset === 'ai-stack') { frontend = 'react-vite'; backend = 'fastapi'; database = 'postgresql'; }
    if (preset === 'next-supabase') { frontend = 'nextjs'; backend = null; database = 'supabase'; }
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

  const needsPython = backend === "fastapi" || backend === "django";
  const needsNode = true; // CLI runs on Node, but to be sure for frontend/backend

  const sEnv = spinner();
  sEnv.start("Checking environment...");
  const hasDocker = runner === "docker" ? await checkEnv("docker", ["--version"]) : true;
  const hasPython = needsPython ? (await checkEnv("python", ["--version"]) || await checkEnv("python3", ["--version"])) : true;
  const hasNode = needsNode ? await checkEnv("node", ["-v"]) : true;
  sEnv.stop("Environment checked.");

  if (!hasDocker) {
    console.log(chalk.yellow("\n⚠️  Docker is missing."));
    console.log("Since you chose Docker, please install it before running the app.");
    console.log("Guide: https://docs.docker.com/get-docker/");
  }

  if (!hasPython) {
    console.log(chalk.yellow("\n⚠️  Python is missing."));
    console.log(`Your backend (${backend}) requires Python.`);
    console.log("Guide: https://www.python.org/downloads/");
  }

  if (!hasNode) {
    console.log(chalk.yellow("\n⚠️  Node.js is missing (somehow!)."));
    console.log("Guide: https://nodejs.org/");
  }

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