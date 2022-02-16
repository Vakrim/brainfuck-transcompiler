import { Address } from "./Address";

export class TemporaryVariable {
  #address: Address;

  constructor(address: Address) {
    this.#address = address;
  }

  get address() {
    return this.#address;
  }
}
