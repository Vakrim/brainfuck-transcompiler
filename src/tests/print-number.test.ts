import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('printNumber', () => {
  it('print numbers', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('n');
    compiler.writeInput('n');
    compiler.printNumber('n');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [23]).memoryAllocation).toEqual([
      { name: 'n', value: 23 },
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);

    for (let i = 0; i < 100; i++) {
      expect(executeCode(compiler, [i]).output).toEqual(`${i}`);
    }
  });
});
