import fs from 'fs-extra';
import path from 'path';

export async function writeEnv(targetDir: string, config: any) {
  let envContent = '';

  if (config.database === 'mongodb') {
    envContent += `MONGODB_URI=mongodb://localhost:27017/${config.projectName}\n`;
  } else if (config.database === 'postgresql') {
    envContent += `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${config.projectName}?schema=public\n`;
  }

  if (config.auth === 'supabase-auth') {
    envContent += `\n# Supabase Auth\nVITE_SUPABASE_URL=your_supabase_url\nVITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n`;
  } else if (config.auth === 'firebase-auth') {
    envContent += `\n# Firebase Auth\nVITE_FIREBASE_API_KEY=your_api_key\nVITE_FIREBASE_AUTH_DOMAIN=your_auth_domain\nVITE_FIREBASE_PROJECT_ID=your_project_id\n`;
  }

  envContent += `\nPORT=5000\n`;

  await fs.writeFile(path.join(targetDir, '.env'), envContent);
  await fs.writeFile(path.join(targetDir, '.env.example'), envContent);
}
