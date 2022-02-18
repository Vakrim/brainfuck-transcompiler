import { Memory } from '../Memory';
import { Transcompiler } from '../Transcompiler';
import { executeCode } from './execute-code';

describe('scopes', () => {
  it('creates scope assign variable', () => {
    const memory = new Memory();
    const allocateSpy = jest.spyOn(memory, 'allocate');
    const freeSpy = jest.spyOn(memory, 'free');

    const compiler = new Transcompiler(memory);

    compiler.declareVariable('outerScope');

    expect(allocateSpy).toHaveBeenCalledTimes(1);
    expect(freeSpy).toHaveBeenCalledTimes(0);

    compiler.pushScope();

    compiler.declareVariable('innerScope');
    compiler.assignValue('innerScope', 3);
    compiler.readVariable('innerScope');

    expect(allocateSpy).toHaveBeenCalledTimes(2);
    expect(freeSpy).toHaveBeenCalledTimes(0);

    compiler.popScope();

    expect(allocateSpy).toHaveBeenCalledTimes(2);
    expect(freeSpy).toHaveBeenCalledTimes(1);

    compiler.declareVariable('outerScopeInPlace');
    compiler.assignValue('outerScopeInPlace', 5);
    compiler.readVariable('outerScopeInPlace');

    expect(allocateSpy).toHaveBeenCalledTimes(3);
    expect(freeSpy).toHaveBeenCalledTimes(1);

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([3, 5]);
  });

  it('assign memory after inner scope when usign temporary variables in outer scope', () => {
    const compiler = new Transcompiler();

    compiler.declareVariable('a');
    compiler.assignValue('a', 3);

    compiler.pushScope();
    compiler.declareVariable('b');
    compiler.assignValue('b', 5);

    compiler.add('b', 'a');
    compiler.readVariable('b');
    compiler.readVariable('a');

    compiler.popScope();

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler).codes).toEqual([8, 3]);
  });
});
