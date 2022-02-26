import { Transcompiler } from '../compiler/Transcompiler';
import { executeCode } from './execute-code';

describe('adding', () => {
  it('adds two variables', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.assignValue('a', 10);
    compiler.declareVariable('b');
    compiler.assignValue('b', 15);

    compiler.add('b', 'a');

    compiler.printVariable('b');
    compiler.printVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([25, 10]);

    expect(executeCode(compiler).memoryAllocation).toEqual([
      { name: 'a', value: 10 },
      { name: 'b', value: 25 },
      0,
    ]);
  });

  it('reads three inputs and sums them', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('b');
    compiler.declareVariable('c');

    compiler.writeInput('a');
    compiler.writeInput('b');
    compiler.writeInput('c');

    compiler.declareVariable('sum');

    compiler.add('sum', 'a');
    compiler.add('sum', 'b');
    compiler.add('sum', 'c');

    compiler.printVariable('sum');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [10, 20, 30]).codes).toEqual([60]);
  });
});
