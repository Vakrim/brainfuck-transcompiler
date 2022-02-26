import { readdir, writeFile } from 'fs/promises';
import { join, basename } from 'path';
import { Transcompiler } from './compiler/Transcompiler';

async function main() {
  const examplesDir = join(__dirname, '..', 'src', 'examples');

  const examplesFiles = await readdir(examplesDir, {
    withFileTypes: true,
  });

  for (let exampleFile of examplesFiles) {
    if (!exampleFile.name.endsWith('.ts')) {
      continue;
    }

    const exampleModule = require(join(examplesDir, exampleFile.name));

    if (Object.keys(exampleModule).length !== 1) {
      throw new Error('expect example module to has one export');
    }

    const transcompilerFactory = Object.values(exampleModule)[0] as () => any;

    const transcompiler = transcompilerFactory();

    if (!(transcompiler instanceof Transcompiler)) {
      throw new Error('expect exported function to retun transcompiler');
    }

    await writeFile(
      join(examplesDir, `${basename(exampleFile.name, '.ts')}.bf`),
      transcompiler.code,
      'utf8'
    );
  }
}

main().catch(console.error);
