import * as prettier from 'prettier';
import * as ts from 'typescript';

/**
 * A `RewriteFileHost` contains implementations of the functions needed to
 * rewrite a file using prettier.
 */
export interface RewriteFileHost {
  /**
   * Reads a file synchronously. Usually implemented by `ts.sys`.
   */
  readFile(path: string, encoding?: string): string | undefined;

  /**
   * Writes a file synchronously. Usually implemented by `ts.sys`.
   */
  writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;

  /**
   * Resolves the prettier config for a given `filePath`. Consult the prettier
   * docs for more information.
   */
  resolveConfig(
    filePath?: string,
    options?: prettier.ResolveConfigOptions,
  ): Promise<null | prettier.Options>;

  /**
   * Formats `source` text using prettier.
   */
  format(source: string, options?: prettier.Options): string;
}

/**
 * Rewrites the file at the given `path` using prettier.
 * @param path The path of the file to rewrite
 * @param host A `RewriteFileHost` for file system and rewrite operations
 * @return A promise that resolves if the rewrite operation succeeded, or
 * rejects if it did not.
 */
export async function prettifyFile(
  path: string,
  host: RewriteFileHost = defaultRewriteFileHost,
): Promise<void> {
  const resolvedConfig = await host.resolveConfig(path);
  const config: prettier.Options = {parser: 'typescript', ...resolvedConfig};

  const oldSource = host.readFile(path);
  if (!oldSource) {
    throw new Error(`Failed to read file ${path}`);
  }
  const newSource = host.format(oldSource, config!);
  return host.writeFile(path, newSource);
}

/**
 * The default implementation of `RewriteFileHost`. File system operations are
 * implemented by `ts.sys`. Reformatting operations are implemented by
 * prettier itself.
 */
export const defaultRewriteFileHost: RewriteFileHost = {
  readFile: ts.sys.readFile,
  writeFile: ts.sys.writeFile,
  resolveConfig: prettier.resolveConfig,
  format: prettier.format,
};
