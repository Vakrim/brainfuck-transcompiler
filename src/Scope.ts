import { Address } from './Address';
import { Memory } from './Memory';
import { TemporaryVariable } from './TemporaryVariable';
import { Variable } from './Variable';

export class Scope {
  #parent: Scope | null;
  #variables: Map<string, Variable>;
  #tempVariables: Set<TemporaryVariable>;
  #memory: Memory;

  constructor(parent: Scope | null, memory: Memory) {
    this.#parent = parent;
    this.#memory = memory;
    this.#variables = new Map();
    this.#tempVariables = new Set();
  }

  declareVariable(name: string, nextTo: Address) {
    if (this.#variables.has(name)) {
      throw new Error(`Can't redeclare variable with name "${name}"`);
    }

    const address = this.#memory.allocate(this, nextTo, 1);

    const variable = new Variable(name, address, this);

    this.#variables.set(name, variable);
  }

  unsetVariable(name: string) {
    if (!this.#variables.has(name)) {
      throw new Error(`Variable "${name}" is not declared`);
    }

    const variable = this.#variables.get(name)!;

    this.#variables.delete(name);

    this.#memory.free(this, variable.address);
  }

  declareTemporaryVariable(nextTo: Address) {
    const address = this.#memory.allocate(this, nextTo, 1);

    const variable = new TemporaryVariable(address);

    this.#tempVariables.add(variable);

    return variable;
  }

  unsetTemporaryVariable(variable: TemporaryVariable) {
    if (!this.#tempVariables.has(variable)) {
      throw new Error(`Temporary variable is not declared`);
    }

    this.#tempVariables.delete(variable);

    this.#memory.free(this, variable.address);
  }

  getVariable(name: string): Variable {
    return this.getScopeOfVariable(name).#variables.get(name)!;
  }

  getScopeOfVariable(name: string): Scope {
    if (this.#variables.has(name)) {
      return this;
    }

    if (!this.#parent) {
      throw new Error(`Variable "${name}" doesn't exist`);
    }

    return this.#parent.getScopeOfVariable(name);
  }

  getVariablesOfThisScope(): string[] {
    return Array.from(this.#variables.keys());
  }

  getParentScope(): Scope {
    if (!this.#parent) {
      throw new Error('There are not parent Scope');
    }

    return this.#parent;
  }

  hasParentScope(): boolean {
    return !!this.#parent;
  }

  deepVerifyBeforeDiscard() {
    this.verifyBeforeDiscard();

    if (this.#parent) {
      this.#parent.deepVerifyBeforeDiscard();
    }
  }

  verifyBeforeDiscard() {
    if (this.#tempVariables.size > 0) {
      throw new Error(
        `Can't discard scope when temporary variables are still allocated`
      );
    }
  }

  get memory() {
    return this.#memory;
  }
}
