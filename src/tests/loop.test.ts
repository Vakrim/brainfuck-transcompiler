import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('loop', () => {
  it('handles while loop', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('sum');
    compiler.writeInput('a');

    compiler.while('a', () => {
      compiler.add('sum', 'a');
      compiler.writeInput('a');
    });

    compiler.readVariable('sum');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [0]).codes).toEqual([0]);

    expect(executeCode(compiler, [2, 5, 0]).codes).toEqual([7]);

    expect(executeCode(compiler, [2, 5, 10, 0]).codes).toEqual([17]);
  });

  it("doesn't memory leak on one loop", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('i');
    compiler.declareVariable('product');
    compiler.assignValue('i', 3);
    compiler.assignValue('product', 2);

    compiler.while('i', () => {
      compiler.multiply('product', 'i');
      compiler.assignValue('i', 0);
    });

    compiler.readVariable('product');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).memoryAllocation).toEqual([
      {
        name: 'i',
        value: 0,
      },
      {
        name: 'product',
        value: 6,
      },
      0,
      0,
      0,
    ]);

    expect(executeCode(compiler).codes).toEqual([6]);
  });

  it('handles while loop', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('product');
    compiler.assignValue('product', 1);
    compiler.writeInput('a');

    compiler.while('a', () => {
      compiler.multiply('product', 'a');
      compiler.writeInput('a');
    });

    compiler.readVariable('product');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [0]).codes).toEqual([1]);

    expect(executeCode(compiler, [3, 0]).codes).toEqual([3]);

    expect(executeCode(compiler, [2, 5, 0]).codes).toEqual([10]);

    expect(executeCode(compiler, [2, 5, 10, 0]).codes).toEqual([100]);
  });
});
