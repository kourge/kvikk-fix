import * as MemoryFileSystem from 'memory-fs';
import * as prettier from 'prettier';
import {prettifyFile} from './prettify';

const TEST_FILENAME = '/test.ts';
const TYPED_FILENAME = '/test2.ts';

function makeHost() {
  const fs = new MemoryFileSystem();
  fs.writeFileSync(TEST_FILENAME, `
    const x  =  1;
  `, 'utf8');
  fs.writeFileSync(TYPED_FILENAME, `
    export function toNumber< N extends number >(n: N): number { return +n; }
  `, 'utf8');

  return {
    fs,
    readFile: (path: string, encoding: string = 'utf8') => (
      fs.readFileSync(path, encoding)
    ),
    writeFile: (path: string, data: string) => {
      fs.writeFileSync(path, data, 'utf8');
    },
    resolveConfig: async (filename: string): Promise<prettier.Options> => ({
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      bracketSpacing: false,
      jsxBracketSameLine: false,
      parser: 'typescript',
    }),
    format: (source: string, options?: prettier.Options): string => source,
  };
}

describe('prettifyFile', () => {
  it('rejects on read error', () => {
    const host = makeHost();

    const result = prettifyFile('/does-not-exist.ts', host);
    return expect(result).rejects.toBeDefined();
  });

  it('rejects on write error', () => {
    const host = makeHost();
    host.writeFile = () => { throw new Error(); };

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).rejects.toBeDefined();
  });

  it('rejects when format fails', () => {
    const host = makeHost();
    host.format = () => { throw new Error(); };

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).rejects.toBeDefined();
  });

  it('resolves when format succeeds', () => {
    const host = makeHost();

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).resolves.toBeUndefined();
  });

  it('resolves when fed a TypeScript file with no prettierrc', () => {
    const host = makeHost();
    host.resolveConfig = async () => null;
    host.format = prettier.format;

    const result = prettifyFile(TYPED_FILENAME, host);
    return expect(result).resolves.toBeUndefined();
  });
});
