import { Address } from '../compiler/Address';
import { Memory } from '../compiler/Memory';

describe(Memory, () => {
  it('allocates memory one by after another', () => {
    const memory = new Memory();

    const scope = {};

    expect(memory.allocate(scope, addresify(1), 1)).toEqual(1);
    expect(memory.allocate(scope, addresify(1), 1)).toEqual(0);
    expect(memory.allocate(scope, addresify(1), 1)).toEqual(2);
    expect(memory.allocate(scope, addresify(1), 1)).toEqual(3);
    expect(memory.allocate(scope, addresify(1), 1)).toEqual(4);
  });

  it('allocates memory ranges of bytes', () => {
    const memory = new Memory();

    const scope = {};

    expect(memory.allocate(scope, addresify(4), 3)).toEqual(2);
    expect(memory.allocate(scope, addresify(4), 3)).toEqual(5);
    expect(memory.allocate(scope, addresify(4), 3)).toEqual(8);
    expect(memory.allocate(scope, addresify(4), 3)).toEqual(11);
    expect(memory.allocate(scope, addresify(1), 1)).toEqual(1);
  });

  it('allows to reallocate memory after it has been released', () => {
    const memory = new Memory();

    const scope = {};

    expect(memory.allocate(scope, addresify(5), 3)).toEqual(3);
    expect(memory.allocate(scope, addresify(5), 3)).toEqual(6);
    expect(memory.allocate(scope, addresify(5), 3)).toEqual(0);

    memory.free(scope, addresify(3));
    memory.free(scope, addresify(4));
    memory.free(scope, addresify(5));

    expect(memory.allocate(scope, addresify(4), 1)).toEqual(4);
    expect(memory.allocate(scope, addresify(4), 1)).toEqual(3);
    expect(memory.allocate(scope, addresify(4), 1)).toEqual(5);
    expect(memory.allocate(scope, addresify(4), 1)).toEqual(9);
  });

  it('disallows one scope to free memory reserved by other scope', () => {
    const memory = new Memory();

    const scope = {};

    const otherScope = {};

    expect(memory.allocate(scope, addresify(5), 3)).toEqual(3);
    expect(memory.allocate(otherScope, addresify(5), 3)).toEqual(6);

    expect(() => {
      memory.free(otherScope, addresify(3));
    }).toThrowError(
      'Cell with address = 3 is not allocated by the scope that is requesting to free it'
    );
    expect(() => {
      memory.free(otherScope, addresify(4));
    }).toThrowError(
      'Cell with address = 4 is not allocated by the scope that is requesting to free it'
    );
    expect(() => {
      memory.free(otherScope, addresify(5));
    }).toThrowError(
      'Cell with address = 5 is not allocated by the scope that is requesting to free it'
    );
    memory.free(otherScope, addresify(6));
  });
});

function addresify(n: number) {
  return n as Address;
}
