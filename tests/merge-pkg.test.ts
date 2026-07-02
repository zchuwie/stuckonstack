import { mergePackageJson } from '../src/merge-pkg';

describe('mergePackageJson', () => {
  it('merges dependencies and scripts correctly', () => {
    const base = {
      name: 'base',
      dependencies: { express: '^4.17.1' },
      scripts: { start: 'node index.js' }
    };
    const ext = {
      dependencies: { pg: '^8.7.1' },
      scripts: { migrate: 'db-migrate up' }
    };

    const result = mergePackageJson(base, ext);
    
    expect(result.dependencies).toEqual({
      express: '^4.17.1',
      pg: '^8.7.1'
    });
    expect(result.scripts).toEqual({
      start: 'node index.js',
      migrate: 'db-migrate up'
    });
    expect(result.name).toBe('base');
  });
});
