import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('assign variables and read', () => {
  it('reads one variable', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.assignValue('a', 97);
    compiler.printVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).output).toEqual('a');
  });

  it('reads two variable', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.declareVariable('b');

    compiler.assignValue('a', 97);
    compiler.assignValue('b', 98);

    compiler.printVariable('b');
    compiler.printVariable('a');

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).output).toEqual('ba');
  });
});
