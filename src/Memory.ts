import { Address } from "./Address";
import { Scope } from "./Scope";

export class Memory {
  #tape: Map<Address, Scope>;
  #dirties: Set<Address>;

  constructor() {
    this.#tape = new Map();
    this.#dirties = new Set();
  }

  allocate(scope: Scope, nextTo: Address): Allocation {
    const address = this.#findFreeAdrress(nextTo);
    const isDirty = this.#dirties.has(address);

    this.#tape.set(address, scope);
    this.#dirties.delete(address);

    return { address, isDirty };
  }

  free(address: Address, isDirty: boolean, scope: Scope) {
    const cell = this.#tape.get(address);
    if (!cell) {
      throw new Error(`Cell with address = ${address} is not allocated`);
    }
    if (cell !== scope) {
      throw new Error(
        `Cell with address = ${address} is not allocated by the scope that is requesting to free it`
      );
    }

    if (isDirty) {
      this.#dirties.add(address);
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

  get dirties() {
    return [...this.#dirties];
  }
}

interface Allocation {
  address: Address;
  isDirty: boolean;
}
