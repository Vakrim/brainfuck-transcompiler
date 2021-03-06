import { fibonacci } from '../examples/fibonacii';
import { Transcompiler } from '../compiler/Transcompiler';
import { executeCode } from './execute-code';

describe('fibonacci', () => {
  it('returns values of sequence', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('i');
    compiler.assignValue('i', 10);

    compiler.declareVariable('prev');
    compiler.assignValue('prev', 0);

    compiler.declareVariable('current');
    compiler.assignValue('current', 1);

    compiler.printVariable('current');

    compiler.while('i', () => {
      compiler.declareVariable('sum');
      compiler.add('sum', 'current');
      compiler.add('sum', 'prev');

      compiler.printVariable('sum');

      compiler.assignValue('prev', 0);
      compiler.add('prev', 'current');

      compiler.assignValue('current', 0);
      compiler.add('current', 'sum');

      compiler.decrement('i');
    });

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([
      1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89,
    ]);
  });

  it('returns values in nice string', () => {
    const compiler = fibonacci();

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).output).toEqual(
      '1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89'
    );
  });
});
