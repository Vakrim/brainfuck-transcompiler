import { Address } from "./Address";
import { CodePrinter, CodeOperation } from "./CodePrinter";
import { Memory } from "./Memory";
import { scopeSymbol } from "./MemoryAllocationSnap";
import { Scope } from "./Scope";
import { TemporaryVariable } from "./TemporaryVariable";
import { Variable } from "./Variable";

export class Transcompiler {
  #cursorPosition: Address = 0 as Address;
  #memory: Memory;
  #scope: Scope;
  #code: CodeOperation[];
  #promotingBlockers: number;
  #currentCodeBlock: string;
  #codeBlockNamesStack: string[];

  constructor(memory = new Memory()) {
    this.#cursorPosition = 0 as Address;
    this.#memory = memory;
    this.#scope = new Scope(null, this.#memory);
    this.#code = [];
    this.#promotingBlockers = 0;
    this.#currentCodeBlock = "";
    this.#codeBlockNamesStack = [];
  }

  declareVariable(name: string) {
    this.operation(`declare ${name}`, () => {
      const isDirty = this.#scope.declareVariable(name, this.#cursorPosition);
      if (isDirty) {
        this.#reset(name);
      }
    });
  }

  assignValue(name: string, value: number) {
    this.operation(`assign ${value} to ${name}`, () => {
      this.#reset(name);
      this.#inc(name, value);
    });
  }

  writeInput(name: string) {
    this.operation(`write input ${name}`, () => {
      this.#moveTo(name);
      this.#outputBrainfuck(",");
    });
  }

  readVariable(name: string) {
    this.operation(`read ${name}`, () => {
      this.#moveTo(name);
      this.#readValue();
    });
  }

  add(to: string, from: string) {
    this.operation(`add ${from} to ${to}`, () => {
      this.#moveTo(from);
      const newFrom = this.#declareTemporaryVariable(this.#cursorPosition);

      this.#loopOf(from, () => {
        this.#inc(newFrom);
        this.#inc(to);
      });

      this.#promoteOrResetVariable(from, newFrom, false);
    });
  }

  increment(name: string, n: number) {
    this.operation(`increment ${name} with ${n}`, () => {
      this.#inc(name, n);
    });
  }

  whenever(
    conditionName: string,
    ifPostitive: () => void,
    ifNegative?: () => void
  ) {
    const conditionCopy = this.#copy(conditionName);

    if (!ifNegative) {
      this.operation(`if ${conditionName}`, () => {
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifPostitive);
      this.operation(`endif ${conditionName}`, () => {
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[-]]`);
      });
    } else {
      const elseFlag = this.#declareTemporaryVariable(conditionCopy);

      this.operation(`if ${conditionName}`, () => {
        this.#inc(elseFlag);
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifPostitive);
      this.operation(`else ${conditionName}`, () => {
        this.#reset(conditionCopy);
        this.#dec(elseFlag);
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`]`);
        this.#moveTo(elseFlag);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifNegative);
      this.operation(`endif ${conditionName}`, () => {
        this.#dec(elseFlag);
        this.#outputBrainfuck(`]`);
        this.#scope.unsetTemporaryVariable(elseFlag, false);
      });
    }

    this.#scope.unsetTemporaryVariable(conditionCopy, false);
  }

  multiply(to: string, from: string) {
    this.operation(`multiply ${from} to ${to}`, () => {
      const interator = this.#copy(from);
      const interator2swap = this.#declareTemporaryVariable(interator.address);
      const result = this.#declareTemporaryVariable(interator.address);

      this.#loopOf(interator, () => {
        this.#loopOf(to, () => {
          this.#inc(interator2swap);
          this.#inc(result);
        });
        this.#loopOf(interator2swap, () => {
          this.#inc(to);
        });
      });

      this.#scope.unsetTemporaryVariable(interator, false);
      this.#scope.unsetTemporaryVariable(interator2swap, true);

      this.#promoteOrResetVariable(to, result, true);
    });
  }

  while(name: string, fn: () => void) {
    this.operation(`while ${name}`, () => {
      this.#promotingBlockers++;
      this.#moveTo(name);
      this.#outputBrainfuck(`[`);
    });
    this.scope(fn);
    this.operation(`endwhile ${name}`, () => {
      this.#moveTo(name);
      this.#outputBrainfuck(`]`);
      this.#promotingBlockers--;
    });
  }

  pushScope() {
    this.#code.push({
      scope: "open",
    });
    this.#scope = new Scope(this.#scope, this.#memory);
  }

  popScope() {
    this.#scope.verifyBeforeDiscard();

    const variables = this.#scope.getVariablesOfThisScope();
    for (const variable of variables) {
      this.#scope.unsetVariable(variable, true);
    }
    this.#scope = this.#scope.getParentScope();
    this.#code.push({
      scope: "close",
    });
  }

  scope(fn: () => void) {
    this.pushScope();
    fn();
    this.popScope();
  }

  get code(): string {
    this.#scope.deepVerifyBeforeDiscard();

    return new CodePrinter(this.#code).print();
  }

  operation(name: string, fn: () => void) {
    if (this.#codeBlockNamesStack.length > 0) {
      this.#code.push({
        name: this.#codeBlockNamesStack[this.#codeBlockNamesStack.length - 1],
        code: this.#currentCodeBlock,
        level: this.#codeBlockNamesStack.length,
      });
      this.#currentCodeBlock = "";
    }

    this.#codeBlockNamesStack.push(name);
    fn();
    if (this.#currentCodeBlock) {
      this.#code.push({
        name,
        code: this.#currentCodeBlock,
        level: this.#codeBlockNamesStack.length,
      });
      this.#currentCodeBlock = "";
    }
    this.#codeBlockNamesStack.pop();
  }

  #promoteOrResetVariable(
    name: string,
    temporaryWithValue: TemporaryVariable,
    isDirty: boolean
  ) {
    if (this.#promotingBlockers) {
      this.operation(`reset ${name} value`, () => {
        if (isDirty) {
          this.#reset(name);
        }
        this.#loopOf(temporaryWithValue, () => {
          this.#inc(name);
        });
        this.#scope.unsetTemporaryVariable(temporaryWithValue, false);
      });
    } else {
      this.#scope.promoteVariable(name, temporaryWithValue, isDirty);
    }
  }

  #declareTemporaryVariable(nextTo: Addressable = this.#cursorPosition) {
    const nextToAddress = this.#normalizeAddress(nextTo);
    const { variable, isDirty } =
      this.#scope.declareTemporaryVariable(nextToAddress);
    if (isDirty) {
      this.#reset(variable);
    }
    return variable;
  }

  #copy(from: string) {
    const newFrom = this.#declareTemporaryVariable();
    const newTo = this.#declareTemporaryVariable();

    this.operation(`copy ${from} to temp`, () => {
      this.#loopOf(from, () => {
        this.#inc(newFrom);
        this.#inc(newTo);
      });

      this.#promoteOrResetVariable(from, newFrom, false);
    });

    return newTo;
  }

  #reset(name: VariableLike) {
    this.#moveTo(name);
    this.#outputBrainfuck("[-]");
  }

  #normalizeVariable(variableLike: VariableLike) {
    if (typeof variableLike === "string") {
      return this.#scope.getVariable(variableLike);
    }
    return variableLike;
  }

  #normalizeAddress(addressable: Addressable) {
    if (typeof addressable === "number") {
      return addressable;
    }
    return this.#normalizeVariable(addressable).address;
  }

  #moveTo(addressable: Addressable) {
    const address = this.#normalizeAddress(addressable);

    const difference = address - this.#cursorPosition;
    if (difference < 0) {
      this.#outputBrainfuck("<".repeat(-difference));
    } else if (difference > 0) {
      this.#outputBrainfuck(">".repeat(difference));
    }
    this.#cursorPosition = address;
  }

  #loopOf(variableLike: VariableLike, fn: () => void) {
    const address = this.#normalizeVariable(variableLike).address;

    this.#moveTo(address);
    this.#outputBrainfuck(`[`);
    this.#dec(address);
    fn();
    this.#moveTo(address);
    this.#outputBrainfuck(`]`);
  }

  #outputBrainfuck(bf: string) {
    this.#currentCodeBlock += `${bf}`;
  }

  #dec(addressable: Addressable, value: number = 1) {
    this.#moveTo(addressable);
    this.#outputBrainfuck(`-`.repeat(value));
  }

  #inc(addressable: Addressable, value: number = 1) {
    this.#moveTo(addressable);
    this.#outputBrainfuck(`+`.repeat(value));
  }

  #readValue() {
    this.#outputBrainfuck(".");
  }

  get [scopeSymbol]() {
    return this.#scope;
  }
}

type VariableLike = string | Variable | TemporaryVariable;

type Addressable = VariableLike | Address;
