// tslint:disable:no-console
import {checkFile, prettifyFile} from './prettify';
import {getProjectFileNames} from './project';

enum Mode {
  Rewrite,
  Check,
}

async function main(): Promise<number | undefined> {
  const args = process.argv.slice(2);

  let mode: Mode = Mode.Rewrite;
  for (const arg of args) {
    if (arg === '-l' || arg === '--list-different') {
      mode = Mode.Check;
    } else {
      console.error(`Unrecognized flag '${arg}'`);
      return 1;
    }
  }

  const fileNames = getProjectFileNames();

  switch (mode) {
    case Mode.Rewrite:
      return await rewriteFiles(fileNames);
    case Mode.Check:
      return await checkFiles(fileNames);
  }
}

async function rewriteFiles(fileNames: string[]): Promise<number> {
  let status = 0;

  for (const f of fileNames) {
    try {
      await prettifyFile(f);
    } catch (e) {
      status = 2;
      console.error(`${f}: `);
      console.error(e);
      console.error();
    }
  }

  return status;
}

async function checkFiles(fileNames: string[]): Promise<number> {
  let status = 0;

  for (const f of fileNames) {
    try {
      const isFormatted = await checkFile(f);
      if (!isFormatted) {
        if (status !== 2) {
          status = 3;
        }

        console.error(f);
      }
    } catch (e) {
      status = 2;
      console.error(`${f}: `);
      console.error(e);
      console.error();
    }
  }

  return status;
}

main().then(process.exit);
