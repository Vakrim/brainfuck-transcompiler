import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('divmod', () => {
  it.skip('calculates div and mod results', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('b');
    compiler.declareVariable('mod');
    compiler.declareVariable('div');

    compiler.assignValue('a', 24);
    compiler.assignValue('b', 10);

    compiler.divmod('div', 'mod', 'a', 'b');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [24, 10]).memoryAllocation).toEqual([
      0,
      0,
      0,
      { name: 'mod', value: 4 },
      { name: 'div', value: 2 },
    ]);

    expect(executeCode(compiler, [24, 10]).codes).toEqual([2, 4]);
  });
});
