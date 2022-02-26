import { Transcompiler } from '../compiler/Transcompiler';
import { executeCode } from './execute-code';

describe('divmod', () => {
  it('calculates div and mod results', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('b');
    compiler.declareVariable('mod');
    compiler.declareVariable('div');

    compiler.writeInput('a');
    compiler.writeInput('b');

    compiler.divmod('div', 'mod', 'a', 'b');

    compiler.printVariable('div');
    compiler.printVariable('mod');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [24, 10]).memoryAllocation).toEqual([
      { name: 'a', value: 24 },
      { name: 'b', value: 10 },
      { name: 'mod', value: 4 },
      { name: 'div', value: 2 },
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);

    expect(executeCode(compiler, [24, 10]).codes).toEqual([2, 4]);
  });
});
