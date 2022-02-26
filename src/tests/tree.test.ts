import { executeCode } from './execute-code';
import { tree } from '../examples/tree';

describe('tree', () => {
  it('prints tree', () => {
    const compiler = tree();

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler, '2\0').output).toEqual(`\
 *
***`);

    expect(executeCode(compiler, '3\0').output).toEqual(`\
  *
 ***
*****`);

    expect(executeCode(compiler, '5\0').output).toEqual(`\
    *
   ***
  *****
 *******
*********`);

    expect(executeCode(compiler, '12\0').output).toEqual(`\
           *
          ***
         *****
        *******
       *********
      ***********
     *************
    ***************
   *****************
  *******************
 *********************
***********************`);
  });
});
