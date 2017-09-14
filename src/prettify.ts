import * as Prettier from 'prettier';
import * as ts from 'typescript';
import {selectedPrettier as prettier} from './prettier';

export interface RewriteFileHost {
  readFile(path: string, encoding?: string): string | undefined;
  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
  resolveConfig(
    filePath?: string,
    options?: Prettier.ResolveConfigOptions,
  ): Promise<null | Prettier.Options>;
  format(source: string, options?: Prettier.Options): string;
}

export async function prettifyFile(
  filename: string,
  host: RewriteFileHost = defaultRewriteFileHost,
): Promise<void> {
  const resolvedConfig = await host.resolveConfig(filename);
  const config: Prettier.Options = {parser: 'typescript', ...resolvedConfig};

  const oldSource = host.readFile(filename);
  if (!oldSource) {
    throw new Error(`Failed to read file ${filename}`);
  }
  const newSource = host.format(oldSource, config!);
  return host.writeFile(filename, newSource);
}

export const defaultRewriteFileHost: RewriteFileHost = {
  readFile: ts.sys.readFile,
  writeFile: ts.sys.writeFile,
  resolveConfig: prettier.resolveConfig,
  format: prettier.format,
};
