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
    depends_on:${config.database === 'mongodb' ? '\n      - mongo' : config.database === 'postgresql' ? '\n      - postgres' : ''}
${dbService}

volumes:
  ${config.database === 'mongodb' ? 'mongo_data:' : config.database === 'postgresql' ? 'pg_data:' : ''}
`;

  await fs.writeFile(path.join(targetDir, 'docker-compose.yml'), compose);
}
