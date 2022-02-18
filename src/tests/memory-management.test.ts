import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('memory management', () => {
  it('declare variables and clean memory after closing scope', () => {
    const compiler = new Transcompiler();
    compiler.declareVariable('a');
    compiler.declareVariable('b');

    compiler.assignValue('a', 1);
    compiler.assignValue('b', 2);

    compiler.scope(() => {
      compiler.declareVariable('c');
      compiler.assignValue('c', 3);

      expect(executeCode(compiler).memoryAllocation).toEqual([
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
        { name: 'c', value: 3 },
      ]);
    });

    expect(executeCode(compiler).memoryAllocation).toEqual([
      { name: 'a', value: 1 },
      { name: 'b', value: 2 },
      0,
    ]);

    compiler.declareVariable('d');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).memoryAllocation).toEqual([
      { name: 'a', value: 1 },
      { name: 'b', value: 2 },
      { name: 'd', value: 0 },
    ]);
  });

  it('declares temporary variable', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');

    compiler.scope(() => {
      compiler.declareVariable('b');

      compiler.assignValue('a', 1);
      compiler.assignValue('b', 2);

      expect(executeCode(compiler).memoryAllocation).toEqual([
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
      ]);

      compiler.add('b', 'a');

      expect(executeCode(compiler).memoryAllocation).toEqual([
        { name: 'a', value: 1 },
        { name: 'b', value: 3 },
        0,
      ]);
    });

    compiler.declareVariable('b');
    compiler.declareVariable('c');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).memoryAllocation).toEqual([
      { name: 'a', value: 1 },
      { name: 'b', value: 0 },
      { name: 'c', value: 0 },
    ]);
  });

  it('sums list of numbers declared in scope', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('sum');

    for (let i = 1; i <= 5; i++) {
      compiler.scope(() => {
        compiler.declareVariable('term');
        compiler.assignValue('term', i);
        compiler.add('sum', 'term');
      });
    }

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).memoryAllocation).toEqual([
      { name: 'sum', value: 15 },
      0,
      0,
    ]);
  });
});
