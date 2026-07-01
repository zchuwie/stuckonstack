import fs from 'fs-extra';
import path from 'path';

export async function writeEnv(targetDir: string, config: any) {
  let envContent = '';

  if (config.database === 'mongodb') {
    envContent += `MONGODB_URI=mongodb://localhost:27017/${config.projectName}\n`;
  } else if (config.database === 'postgresql') {
    envContent += `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${config.projectName}?schema=public\n`;
  }

  envContent += `PORT=5000\n`;

  await fs.writeFile(path.join(targetDir, '.env'), envContent);
  await fs.writeFile(path.join(targetDir, '.env.example'), envContent);
}
