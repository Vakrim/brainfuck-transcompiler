import { Address } from "./Address";
import { Scope } from "./Scope";
import { Transcompiler } from "./Transcompiler";

export class MemoryAllocationSnap {
  #topScope: Scope;

  constructor(transcompiler: Transcompiler) {
    this.#topScope = transcompiler[scopeSymbol];
  }

  printSnap(memorySnap: number[]) {
    const allocations: string[] = [];

    this.#printSnapScope(this.#topScope, allocations);

    const dirties = new Set(this.#topScope.memory.dirties);

    return memorySnap.map((value, address) => {
      let allocation = allocations[address];

      if (allocation) {
        return {
          name: allocation,
          value,
        };
      }

      if (dirties.has(address as Address)) {
        return { dirty: value };
      }

      if (value !== 0) {
        throw new Error("Unexpected non dirty, non zero cell");
      }
      return value;
    });
  }

  #printSnapScope(scope: Scope, allocations: string[]) {
    const variables = scope.getVariablesOfThisScope();
    for (const variableName of variables) {
      const variable = scope.getVariable(variableName);
      allocations[variable.address] = variableName;
    }

    if (scope.hasParentScope()) {
      this.#printSnapScope(scope.getParentScope(), allocations);
    }
  }
}

export function getMemoryAllocationSnap(
  transcompiler: Transcompiler,
  memorySnap: number[]
) {
  return new MemoryAllocationSnap(transcompiler).printSnap(memorySnap);
}

export const scopeSymbol = Symbol();
