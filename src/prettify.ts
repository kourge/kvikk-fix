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
 * A `CheckFileHost` contains implementations of the functions needed to check
 * a file using prettier.
 */
export interface CheckFileHost {
  /**
   * Reads a file synchronously. Usually implemented by `ts.sys`.
   */
  readFile(path: string, encoding?: string): string | undefined;

  /**
   * Resolves the prettier config for a given `filePath`. Consult the prettier
   * docs for more information.
   */
  resolveConfig(
    filePath?: string,
    options?: prettier.ResolveConfigOptions,
  ): Promise<null | prettier.Options>;

  /**
   * Checks `source` text using prettier. Returns `true` if the file conforms
   * to prettier's standards.
   */
  check(source: string, options?: prettier.Options): boolean;
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
 * Checks if the file at the given `path` is already formatted cleanly by
 * prettier's standards.
 * @param path The path of the file to check
 * @param host A `CheckFileHost` for file system and check operations
 * @return A promise that resolves to `false` if the file would have been
 * reformatted by prettier, to `true` if it already conforms to the standard,
 * or rejects if the check operation failed.
 */
export async function checkFile(
  path: string,
  host: CheckFileHost = defaultCheckFileHost,
): Promise<boolean> {
  const resolvedConfig = await host.resolveConfig(path);
  const config: prettier.Options = {parser: 'typescript', ...resolvedConfig};

  const source = host.readFile(path);
  if (!source) {
    throw new Error(`Failed to read file ${path}`);
  }
  return host.check(source, config);
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

/**
 * The default implementation of `CheckFileHost`. File system operations are
 * implemented by `ts.sys`. Checking operations are implemented by prettier
 * itself.
 */
export const defaultCheckFileHost: CheckFileHost = {
  readFile: ts.sys.readFile,
  resolveConfig: prettier.resolveConfig,
  check: prettier.check,
};
