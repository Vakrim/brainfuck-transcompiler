import { Address } from "./Address";
import { Scope } from "./Scope";

export class Variable {
  #name: string;
  #address: Address;
  #scope: Scope;

  constructor(name: string, address: Address, scope: Scope) {
    this.#name = name;
    this.#address = address;
    this.#scope = scope;
  }

  get address() {
    return this.#address;
  }
}
