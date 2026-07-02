import fs from 'fs-extra';
import path from 'path';

export async function writeDockerCompose(targetDir: string, config: any) {
  let dbService = '';

  if (config.database === 'mongodb') {
    dbService = `
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db`;
  } else if (config.database === 'postgresql') {
    dbService = `
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${config.projectName}
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data`;
  }

  const compose = `version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

${!!config.backend && config.backend !== 'supabase' && config.backend !== 'firebase' ? `
  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - .env
    ${config.database === 'mongodb' ? 'depends_on:\n      - mongo' : config.database === 'postgresql' ? 'depends_on:\n      - postgres' : ''}` : ''}
${dbService}

${config.database === 'mongodb' || config.database === 'postgresql' ? `
volumes:
  ${config.database === 'mongodb' ? 'mongo_data:' : 'pg_data:'}` : ''}
`;

  await fs.writeFile(path.join(targetDir, 'docker-compose.yml'), compose);
}
