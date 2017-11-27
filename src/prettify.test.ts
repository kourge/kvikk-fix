import * as MemoryFileSystem from 'memory-fs';
import * as prettier from 'prettier';
import {checkFile, prettifyFile} from './prettify';

const TEST_FILENAME = '/test.ts';
const TYPED_FILENAME = '/test2.ts';
const CONFORMING_FILENAME = '/test3.ts';

const defaultConfigSettings: prettier.Options = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsxBracketSameLine: false,
  parser: 'typescript',
};

function makeFs() {
  const fs = new MemoryFileSystem();
  fs.writeFileSync(
    TEST_FILENAME,
    `
    const x  =  1;
  `,
    'utf8',
  );
  fs.writeFileSync(
    TYPED_FILENAME,
    `
    export function toNumber< N extends number >(n: N): number { return +n; }
  `,
    'utf8',
  );
  fs.writeFileSync(CONFORMING_FILENAME, `const s = 's';\n`, 'utf8');

  return fs;
}

function makeRewriteHost() {
  const fs = makeFs();

  return {
    fs,
    readFile: (path: string, encoding: string = 'utf8') =>
      fs.readFileSync(path, encoding),
    writeFile: (path: string, data: string) => {
      fs.writeFileSync(path, data, 'utf8');
    },
    resolveConfig: async (filename: string): Promise<prettier.Options> =>
      defaultConfigSettings,
    format: (source: string, options?: prettier.Options): string => source,
  };
}

function makeCheckHost() {
  const fs = makeFs();

  return {
    fs,
    readFile: (path: string, encoding: string = 'utf8') =>
      fs.readFileSync(path, encoding),
    resolveConfig: async (filename: string): Promise<prettier.Options> =>
      defaultConfigSettings,
    check: (source: string, options?: prettier.Options): boolean => false,
  };
}

describe('prettifyFile', () => {
  it('rejects on read error', () => {
    const host = makeRewriteHost();

    const result = prettifyFile('/does-not-exist.ts', host);
    return expect(result).rejects.toBeDefined();
  });

  it('rejects on write error', () => {
    const host = makeRewriteHost();
    host.writeFile = () => {
      throw new Error();
    };

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).rejects.toBeDefined();
  });

  it('rejects when format fails', () => {
    const host = makeRewriteHost();
    host.format = () => {
      throw new Error();
    };

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).rejects.toBeDefined();
  });

  it('resolves when format succeeds', () => {
    const host = makeRewriteHost();

    const result = prettifyFile(TEST_FILENAME, host);
    return expect(result).resolves.toBeUndefined();
  });

  it('resolves when fed a TypeScript file with no prettierrc', () => {
    const host = makeRewriteHost();
    host.resolveConfig = async () => null;
    host.format = prettier.format;

    const result = prettifyFile(TYPED_FILENAME, host);
    return expect(result).resolves.toBeUndefined();
  });

  it('rewrites a file that does not conform to guideline', done => {
    const host = makeRewriteHost();
    host.format = prettier.format;

    const expected = 'const x = 1;\n';

    prettifyFile(TEST_FILENAME, host).then(() => {
      const result = host.fs.readFileSync(TEST_FILENAME);
      expect(result.toString('utf8')).toEqual(expected);
      done();
    });
  });
});

describe('checkFile', () => {
  it('rejects on read error', () => {
    const host = makeCheckHost();

    const result = checkFile('/does-not-exist.ts', host);
    return expect(result).rejects.toBeDefined();
  });

  it('rejects when check fails', () => {
    const host = makeCheckHost();
    host.check = () => {
      throw new Error();
    };

    const result = checkFile(TEST_FILENAME, host);
    return expect(result).rejects.toBeDefined();
  });

  it('resolves when check succeeds', () => {
    const host = makeCheckHost();

    const result = checkFile(TEST_FILENAME, host);
    return expect(result).resolves.toBeDefined();
  });

  it('resolves when fed a TypeScript file with no prettierrc', () => {
    const host = makeCheckHost();
    host.resolveConfig = async () => null;
    host.check = prettier.check;

    const result = checkFile(TYPED_FILENAME, host);
    return expect(result).resolves.toBeDefined();
  });

  it('resolves to false for a file that does not conform to guideline', () => {
    const host = makeCheckHost();
    host.check = prettier.check;

    const result = checkFile(TEST_FILENAME, host);
    return expect(result).resolves.toBe(false);
  });

  it('resolves to true for a file that conforms to guideline', () => {
    const host = makeCheckHost();
    host.check = prettier.check;

    const result = checkFile(CONFORMING_FILENAME, host);
    return expect(result).resolves.toBe(true);
  });
});
