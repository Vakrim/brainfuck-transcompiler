import { Address } from './Address';
import { Scope } from './Scope';

export class Memory {
  #tape: Map<Address, Scope>;

  constructor() {
    this.#tape = new Map();
  }

  allocate(scope: Scope, nextTo: Address): Address {
    const address = this.#findFreeAdrress(nextTo);

    this.#tape.set(address, scope);

    return address;
  }

  free(address: Address, scope: Scope) {
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

  #findFreeAdrress(nextTo: Address) {
    for (let searchRange = 0; ; searchRange++) {
      if (
        nextTo - searchRange >= 0 &&
        !this.#tape.has((nextTo - searchRange) as Address)
      ) {
        return (nextTo - searchRange) as Address;
      }

      if (!this.#tape.has((nextTo + searchRange) as Address)) {
        return (nextTo + searchRange) as Address;
      }
    }
  }
}
