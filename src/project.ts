import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

/**
 * Retrieves an array of file names of a TypeScript project.
 *
 * @param configFile The `tsconfig.json` path of the project.
 * @param projectDirectory The directory of the project. Defaults to the directory enclosing `configFile`.
 * @param parseConfigHost A `ts.ParseConfigHost` for config resolution and parsing.
 * @param excludeDeclarationFiles Exclude files that are considered declaration files.
 */
export function getProjectFileNames(
  configFile: string = './tsconfig.json',
  projectDirectory: string = path.dirname(configFile),
  parseConfigHost: ts.ParseConfigHost = defaultParseConfigHost,
  excludeDeclarationFiles: boolean = true,
): string[] {
  const {config} = ts.readConfigFile(configFile, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    path.resolve(projectDirectory),
    {noEmit: true},
  );
  const compilerHost = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(
    parsed.fileNames,
    parsed.options,
    compilerHost,
  );
  const fileNames = program.getSourceFiles().map(source => source.fileName);
  return excludeDeclarationFiles
    ? fileNames.filter(isNotDeclarationFile)
    : fileNames;
}

/**
 * The default implementation of `ts.parseConfigHost`. It uses case-sensitive
 * file names, reads files from the real file system using the UTF-8 encoding,
 * and reads directories using the implementation provided by `ts.sys`.
 */
export const defaultParseConfigHost: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: true,
  readDirectory: ts.sys.readDirectory,
  fileExists: fs.existsSync,
  readFile: f => fs.readFileSync(f, 'utf8'),
};

// tslint:disable:no-shadowed-variable

/**
 * Determines whether the given path is a declaration file.
 * @param path A path to determine.
 * @return `true` if the `path` ends in `.d.ts`.
 */
export function isNotDeclarationFile(path: string): boolean {
  return path.substr(-5) !== '.d.ts';
}

// tslint:enable
