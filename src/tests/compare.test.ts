import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('compare', () => {
  it('compares two number', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('n');
    compiler.writeInput('n');

    compiler.declareVariable('m');
    compiler.assignValue('m', 5);

    compiler.declareVariable('result');

    compiler.isGreaterThanOrEqual('result', 'n', 'm');

    compiler.printVariable('result');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [7]).memoryAllocation).toEqual([
      { name: 'n', value: 7 },
      { name: 'm', value: 5 },
      { name: 'result', value: 1 },
      0,
      0,
      0,
      0,
      0,
    ]);

    for (let i = 0; i < 10; i++) {
      console.log(i, executeCode(compiler, [i]).codes);
    }

    expect(executeCode(compiler, [0]).codes).toEqual([0]);
    expect(executeCode(compiler, [1]).codes).toEqual([0]);
    expect(executeCode(compiler, [2]).codes).toEqual([0]);
    expect(executeCode(compiler, [3]).codes).toEqual([0]);
    expect(executeCode(compiler, [4]).codes).toEqual([0]);

    expect(executeCode(compiler, [5]).codes).toEqual([1]);
    expect(executeCode(compiler, [6]).codes).toEqual([1]);
    expect(executeCode(compiler, [7]).codes).toEqual([1]);
    expect(executeCode(compiler, [8]).codes).toEqual([1]);
    expect(executeCode(compiler, [9]).codes).toEqual([1]);
  });
});
