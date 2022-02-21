import { Address } from './Address';

export class Memory {
  #tape: Map<Address, ScopeLike>;

  constructor() {
    this.#tape = new Map();
  }

  allocate(scope: ScopeLike, nextTo: Address, size: number): Address {
    const address = this.#findFreeAdrress(nextTo, size);

    for (let i = 0; i < size; i++) {
      this.#tape.set((address + i) as Address, scope);
    }

    return address;
  }

  free(scope: ScopeLike, address: Address) {
    const cell = this.#tape.get(address);
    if (!cell) {
      throw new Error(`Cell with address = ${address} is not allocated`);
    }
    if (cell !== scope) {
      throw new Error(
        `Cell with address = ${address} is not allocated by the scope that is requesting to free it`
      );
    }

    this.#tape.delete(address);
  }

  #findFreeAdrress(nextTo: Address, size: number) {
    for (let searchRange = 0; ; searchRange++) {
      for (let i = 0; i < size; i++) {
        if (
          nextTo - searchRange - i < 0 ||
          this.#tape.has((nextTo - searchRange - i) as Address)
        ) {
          break;
        }
        if (i >= size - 1) {
          return (nextTo - searchRange - size + 1) as Address;
        }
      }

      for (let i = 0; i < size; i++) {
        if (this.#tape.has((nextTo + searchRange + i) as Address)) {
          break;
        }
        if (i >= size - 1) {
          return (nextTo + searchRange) as Address;
        }
      }
    }
  }
}

type ScopeLike = object;
