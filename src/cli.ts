// tslint:disable:no-console
import {prettifyFile} from './prettify';
import {getProjectFileNames} from './project';

export async function main(): Promise<number | undefined> {
  const args = process.argv.slice(2);
  const fileNames = args.length ? args : getProjectFileNames();
  let status = 0;

  for (const f of fileNames) {
    try {
      await prettifyFile(f);
    } catch (e) {
      status = -1;
      console.error(`${f}: `);
      console.error(e);
      console.error();
    }
  }

  return status;
}

main().then(process.exit);
