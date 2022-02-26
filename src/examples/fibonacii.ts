import { Transcompiler } from '../compiler/Transcompiler';

export function fibonacci() {
  const compiler = new Transcompiler();

  compiler.declareVariable('i');
  compiler.assignValue('i', 10);

  compiler.declareVariable('prev');
  compiler.assignValue('prev', 0);

  compiler.declareVariable('comma');
  compiler.assignValue('comma', 44);

  compiler.declareVariable('space');
  compiler.assignValue('space', 32);

  compiler.declareVariable('current');
  compiler.assignValue('current', 1);

  compiler.printNumber('current');

  compiler.while('i', () => {
    compiler.declareVariable('sum');
    compiler.add('sum', 'current');
    compiler.add('sum', 'prev');

    compiler.printVariable('comma');
    compiler.printVariable('space');
    compiler.printNumber('sum');

    compiler.assignValue('prev', 0);
    compiler.add('prev', 'current');

    compiler.assignValue('current', 0);
    compiler.add('current', 'sum');

    compiler.decrement('i');
  });

  return compiler;
}
