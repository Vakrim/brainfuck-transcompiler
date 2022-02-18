import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('condition', () => {
  it('handles code branching', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.writeInput('a');

    compiler.declareVariable('b');

    compiler.whenever('a', () => {
      compiler.increment('b', 5);
    });

    compiler.readVariable('b');
    compiler.readVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [0]).codes).toEqual([0, 0]);

    expect(executeCode(compiler, [1]).codes).toEqual([5, 1]);

    expect(executeCode(compiler, [8]).codes).toEqual([5, 8]);
  });

  it('handles if/else branching', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.writeInput('a');

    compiler.declareVariable('b');

    compiler.whenever(
      'a',
      () => {
        compiler.increment('b', 5);
      },
      () => {
        compiler.increment('b', 10);
      }
    );

    compiler.readVariable('b');
    compiler.readVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, [0]).codes).toEqual([10, 0]);

    expect(executeCode(compiler, [1]).codes).toEqual([5, 1]);
  });
});
