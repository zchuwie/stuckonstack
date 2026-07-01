# create-stuckonstack 🥞

[![npm version](https://badge.fury.io/js/create-stuckonstack.svg)](https://badge.fury.io/js/create-stuckonstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The smartest, fastest, and most dynamic scaffolding CLI for full-stack developers. Stop configuring environments and start writing code. 

`create-stuckonstack` asks you what you want to build and scaffolds a production-ready repository. It automatically scans your system for missing dependencies (Node, Python, Docker) and wires up your client, server, database, and auth in seconds.

## 🚀 Usage

You can run the CLI without installing it globally by using `npx`:

```bash
npx create-stuckonstack my-app
```

Or, if you want to scaffold in the current directory:

```bash
npx create-stuckonstack .
```

## ✨ Features

- **🧠 Smart Defaults**: Choose a BaaS (Firebase/Supabase) and it automatically configures your auth and skips redundant DB questions.
- **🛡️ Pre-flight Checks**: Scans your local machine to ensure the Docker daemon is running and Python/Node versions match your stack.
- **🛠️ Flexible Runners**: Run your entire stack locally natively via `npm` (concurrently) or fully isolated in `docker-compose`.
- **🔐 Instant Auth**: Select an auth provider and automatically inject initialized boilerplate SDKs and `.env.example` placeholders into your client.

## 📦 Presets

Skip the questions and use pre-configured, battle-tested stacks:
- **MERN** — MongoDB + Express + React + Node
- **PERN** — PostgreSQL + Express + React + Node
- **MEVN** — MongoDB + Express + Vue + Node
- **T3** — Next.js + tRPC + Prisma + PostgreSQL
- **AI Stack** — React + FastAPI + PostgreSQL
- **Next + Supabase** — Next.js + Supabase Auth & DB

## 🛠️ Custom Stack Options

Mix and match your perfect stack:
- **Client (Frontend)**: React (Vite), Next.js, Vue (Vite)
- **Server (Backend)**: Express, NestJS, FastAPI, Django, Supabase (BaaS), Firebase (BaaS)
- **Database**: MongoDB, PostgreSQL, MySQL
- **Auth**: Clerk, Supabase Auth, Firebase Auth, NextAuth

## 💻 Development

Want to contribute or test locally?

```bash
# Clone the repo
git clone https://github.com/yourusername/stuckonstack.git
cd stuckonstack

# Install dependencies
npm install

# Build the CLI
npm run build

# Link globally for local testing
npm link

# Test it!
create-stuckonstack test-project
```

## 📜 License

MIT License
