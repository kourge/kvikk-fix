import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

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

export const defaultParseConfigHost: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: true,
  readDirectory: ts.sys.readDirectory,
  fileExists: fs.existsSync,
  readFile: f => fs.readFileSync(f, 'utf8'),
};

export function isNotDeclarationFile(filename: string): boolean {
  return filename.substr(-5) !== '.d.ts';
}
