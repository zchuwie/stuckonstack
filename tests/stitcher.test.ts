import { stitchProject } from '../src/stitcher';
import fs from 'fs-extra';
import path from 'path';
import * as envWriter from '../src/env-writer';
import * as dockerWriter from '../src/docker-writer';

jest.mock('fs-extra');
jest.mock('../src/env-writer');
jest.mock('../src/docker-writer');

describe('stitchProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fs.copy as jest.Mock).mockResolvedValue(undefined);
    (fs.pathExists as jest.Mock).mockResolvedValue(true);
    (fs.readJson as jest.Mock).mockResolvedValue({});
    (fs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue('/* {{AUTH_IMPORTS}} */ /* {{AUTH_PROVIDER_START}} */ /* {{AUTH_ROUTES}} */');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('creates client and server folders for standard frontend/backend', async () => {
    await stitchProject({
      targetDir: '/tmp/test-app',
      frontend: 'react-vite',
      backend: 'express',
      database: 'postgresql',
      runner: 'npm'
    });

    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('react-vite'),
      path.join('/tmp/test-app', 'client')
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('express'),
      path.join('/tmp/test-app', 'server')
    );
  });

  it('skips server folder creation for BaaS (supabase)', async () => {
    await stitchProject({
      targetDir: '/tmp/test-app',
      frontend: 'nextjs',
      backend: 'supabase',
      database: 'supabase',
      runner: 'npm'
    });

    expect(fs.copy).not.toHaveBeenCalledWith(
      expect.stringContaining('supabase'),
      path.join('/tmp/test-app', 'server')
    );
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join('/tmp/test-app', 'supabase', 'migrations'));
  });

  it('injects auth placeholders when config.auth is true', async () => {
    await stitchProject({
      targetDir: '/tmp/test-app',
      frontend: 'react-vite',
      backend: 'express',
      auth: 'clerk-react'
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join('/tmp/test-app', 'client', 'src', 'App.tsx'),
      expect.stringContaining('<AuthProvider>'),
      'utf8'
    );
  });
});
