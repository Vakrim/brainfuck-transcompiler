import { Transcompiler } from '../compiler/Transcompiler';

export function tree() {
  const compiler = new Transcompiler();

  compiler.declareVariable('input');
  compiler.writeInput('input');
  compiler.decrement('input', 48);

  compiler.declareVariable('acc');
  compiler.add('acc', 'input');

  compiler.writeInput('input');

  compiler.scope(() => {
    compiler.declareVariable('ten');
    compiler.assignValue('ten', 10);

    compiler.while('input', () => {
      compiler.decrement('input', 48);
      compiler.multiply('acc', 'ten');
      compiler.add('acc', 'input');
      compiler.writeInput('input');
    });
  });

  compiler.declareVariable('space');
  compiler.assignValue('space', 32);

  compiler.declareVariable('star');
  compiler.assignValue('star', 42);

  compiler.declareVariable('endLine');
  compiler.assignValue('endLine', 10);

  compiler.declareVariable('spacesCount');
  compiler.add('spacesCount', 'acc');
  compiler.decrement('spacesCount');

  compiler.declareVariable('starCount');
  compiler.increment('starCount');

  compiler.times('acc', () => {
    compiler.times('spacesCount', () => {
      compiler.printVariable('space');
    });
    compiler.times('starCount', () => {
      compiler.printVariable('star');
    });
    compiler.whenever('spacesCount', () => {
      compiler.printVariable('endLine');
    });

    compiler.decrement('spacesCount');
    compiler.increment('starCount', 2);
  });

  return compiler;
}
