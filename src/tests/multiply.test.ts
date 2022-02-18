import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('multiplying', () => {
  it('multiplies two variables', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.assignValue('a', 8);
    compiler.declareVariable('b');
    compiler.assignValue('b', 6);

    compiler.multiply('b', 'a');

    compiler.readVariable('b');
    compiler.readVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([48, 8]);
  });

  it('multiplies two variables without memory leak', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.assignValue('a', 2);
    compiler.declareVariable('b');
    compiler.assignValue('b', 3);

    compiler.multiply('b', 'a');

    compiler.readVariable('a');
    compiler.readVariable('b');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([2, 6]);

    expect(executeCode(compiler).memoryAllocation).toEqual([
      {
        name: 'a',
        value: 2,
      },
      {
        name: 'b',
        value: 6,
      },
      0,
      0,
      0,
    ]);
  });
});
