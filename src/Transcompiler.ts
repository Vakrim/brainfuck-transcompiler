import { Address } from "./Address";
import { Memory } from "./Memory";
import { Scope } from "./Scope";
import { TemporaryVariable } from "./TemporaryVariable";
import { Variable } from "./Variable";

export class Transcompiler {
  #cursorPosition: Address = 0 as Address;
  #memory: Memory;
  #scope: Scope;
  #code: string;
  #commentBuffer: string;

  constructor(memory = new Memory()) {
    this.#cursorPosition = 0 as Address;
    this.#memory = memory;
    this.#scope = new Scope(null, this.#memory);
    this.#code = "";
    this.#commentBuffer = "";
  }

  declareVariable(name: string) {
    this.comment(`declare ${name}`);

    const isDirty = this.#scope.declareVariable(name, this.#cursorPosition);
    if (isDirty) {
      this.#reset(name);
    }
  }

  assignValue(name: string, value: number) {
    this.comment(`assign ${value} to ${name}`);

    this.#reset(name);
    this.#inc(name, value);
  }

  writeInput(name: string) {
    this.comment(`write input ${name}`);

    this.#moveTo(name);
    this.#outputBrainfuck(",");
  }

  readVariable(name: string) {
    this.comment(`read ${name}`);

    this.#moveTo(name);
    this.#readValue();
  }

  add(to: string, from: string) {
    this.comment(`add ${from} to ${to}`);

    this.#moveTo(from);
    const newFrom = this.#declareTemporaryVariable(this.#cursorPosition);

    this.#loopOf(from, () => {
      this.#inc(newFrom);
      this.#inc(to);
    });

    this.#scope.promoteVariable(from, newFrom, false);
  }

  increment(name: string, n: number) {
    this.#inc(name, n);
  }

  whenever(
    conditionName: string,
    ifPostitive: () => void,
    ifNegative?: () => void
  ) {
    const conditionCopy = this.#copy(conditionName);

    if (!ifNegative) {
      this.#moveTo(conditionCopy);
      this.comment(`if ${conditionName}`);
      this.#outputBrainfuck(`[`);
      this.scope(ifPostitive);
      this.comment(`endif ${conditionName}`);
      this.#moveTo(conditionCopy);
      this.#outputBrainfuck(`[-]]`);
    } else {
      const elseFlag = this.#declareTemporaryVariable(conditionCopy);
      this.#inc(elseFlag);
      this.#moveTo(conditionCopy);
      this.comment(`if ${conditionName}`);
      this.#outputBrainfuck(`[`);
      this.scope(ifPostitive);
      this.#reset(conditionCopy);
      this.#dec(elseFlag);
      this.#moveTo(conditionCopy);
      this.#outputBrainfuck(`]`);
      this.#moveTo(elseFlag);
      this.comment(`else ${conditionName}`);
      this.#outputBrainfuck(`[`);
      this.scope(ifNegative);
      this.#dec(elseFlag);
      this.comment(`endif ${conditionName}`);
      this.#outputBrainfuck(`]`);
      this.#scope.unsetTemporaryVariable(elseFlag, false);
    }

    this.#scope.unsetTemporaryVariable(conditionCopy, false);
  }

  multiply(to: string, from: string) {
    this.comment(`multiply ${from} to ${to}`);

    const interator = this.#copy(from);
    const interator2 = this.#copy(to);
    const interator2swap = this.#declareTemporaryVariable(interator.address);
    const result = this.#declareTemporaryVariable(interator.address);

    this.#loopOf(interator, () => {
      this.#loopOf(interator2, () => {
        this.#inc(interator2swap);
        this.#inc(result);
      });
      this.#loopOf(interator2swap, () => {
        this.#inc(interator2);
      });
    });

    this.#scope.unsetTemporaryVariable(interator, false);
    this.#scope.unsetTemporaryVariable(interator2, false);
    this.#scope.unsetTemporaryVariable(interator2swap, false);
    this.#scope.promoteVariable(to, result, false);
  }

  while(name: string, fn: () => void) {
    this.comment(`while ${name}`);
    this.#moveTo(name);
    this.#outputBrainfuck(`[`);
    this.scope(fn);
    this.#moveTo(name);
    this.#outputBrainfuck(`]`);
    this.comment(`end while ${name}`);
  }

  pushScope() {
    this.#scope = new Scope(this.#scope, this.#memory);
  }

  popScope() {
    const variables = this.#scope.getVariablesOfThisScope();
    for (const variable of variables) {
      this.#scope.unsetVariable(variable, true);
    }
    this.#scope = this.#scope.getParentScope();
  }

  scope(fn: () => void) {
    this.pushScope();
    fn();
    this.popScope();
  }

  comment(comment: string) {
    const safeComment = comment.replace(/[\,\.\[\]\<\>\+\-]/, " ");

    this.#commentBuffer = this.#commentBuffer
      ? [this.#commentBuffer, safeComment].join("; ")
      : safeComment;
  }

  get code() {
    return `${this.#code}\n${
      this.#commentBuffer ? `${this.#commentBuffer}\n` : ""
    }`;
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
    this.comment(`copy ${from} to temp`);

    const newFrom = this.#declareTemporaryVariable();
    const newTo = this.#declareTemporaryVariable();

    this.#loopOf(from, () => {
      this.#inc(newFrom);
      this.#inc(newTo);
    });

    this.#scope.promoteVariable(from, newFrom, false);

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
    if (this.#commentBuffer) {
      this.#code += `\n${this.#commentBuffer}\n`;
      this.#commentBuffer = "";
    }
    this.#code += bf;
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
}

type VariableLike = string | Variable | TemporaryVariable;

type Addressable = VariableLike | Address;
