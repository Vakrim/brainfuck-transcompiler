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
    this.#comment(`declare ${name}`);

    this.#scope.declareVariable(name, this.#cursorPosition);
  }

  assignValue(name: string, value: number) {
    this.#comment(`assign ${value} to ${name}`);

    this.#moveToVariable(name);
    this.#setValue(value);
  }

  writeInput(name: string) {
    this.#comment(`write input ${name}`);

    this.#moveToVariable(name);
    this.#outputBrainfuck(",");
  }

  readVariable(name: string) {
    this.#comment(`read ${name}`);

    this.#moveToVariable(name);
    this.#readValue();
  }

  add(to: string, from: string) {
    this.#comment(`add ${from} to ${to}`);

    this.#moveToVariable(from);
    const newFrom = this.#scope.declareTemporaryVariable(this.#cursorPosition);

    this.#loopOf(from, () => {
      this.#moveToVariable(newFrom);
      this.#inc();

      this.#moveToVariable(to);
      this.#inc();
    });

    this.#scope.promoteVariable(from, newFrom);
  }

  multiply(to: string, from: string) {
    this.#comment(`multiply ${from} to ${to}`);

    const interator = this.#copy(from);
    const interator2 = this.#copy(to);
    const interator2swap = this.#scope.declareTemporaryVariable(
      interator.address
    );
    const result = this.#scope.declareTemporaryVariable(interator.address);

    this.#loopOf(interator, () => {
      this.#loopOf(interator2, () => {
        this.#moveToVariable(interator2swap);
        this.#inc();
        this.#moveToVariable(result);
        this.#inc();
      });
      this.#loopOf(interator2swap, () => {
        this.#moveToVariable(interator2);
        this.#inc();
      });
    });

    this.#scope.unsetTemporaryVariable(interator);
    this.#scope.unsetTemporaryVariable(interator2);
    this.#scope.unsetTemporaryVariable(interator2swap);
    this.#scope.promoteVariable(to, result);
  }

  pushScope() {
    this.#scope = new Scope(this.#scope, this.#memory);
  }

  popScope() {
    const variables = this.#scope.getVariablesOfThisScope();
    for (const variable of variables) {
      this.#reset(variable);
      this.#scope.unsetVariable(variable);
    }
    this.#scope = this.#scope.getParentScope();
  }

  get code() {
    return this.#code;
  }

  #copy(from: string) {
    this.#comment(`copy ${from} to temp`);

    const newFrom = this.#scope.declareTemporaryVariable(this.#cursorPosition);
    const newTo = this.#scope.declareTemporaryVariable(this.#cursorPosition);

    this.#loopOf(from, () => {
      this.#moveToVariable(newFrom);
      this.#inc();
      this.#moveToVariable(newTo);
      this.#inc();
    });

    this.#scope.promoteVariable(from, newFrom);

    return newTo;
  }

  #comment(comment: string) {
    this.#commentBuffer = this.#commentBuffer
      ? [this.#commentBuffer, comment].join("; ")
      : comment;
  }

  #moveToVariable(nameOrVariable: VariableLike) {
    this.#moveTo(this.#normalizeVariable(nameOrVariable).address);
  }

  #reset(name: string) {
    this.#moveToVariable(name);
    this.#outputBrainfuck("[-]");
  }

  #normalizeVariable(variableLike: VariableLike) {
    if (typeof variableLike === "string") {
      return this.#scope.getVariable(variableLike);
    }
    return variableLike;
  }

  #moveTo(address: Address) {
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
    this.#dec();
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

  #dec() {
    this.#outputBrainfuck(`-`);
  }

  #inc() {
    this.#outputBrainfuck(`+`);
  }

  #setValue(value: number) {
    this.#outputBrainfuck("+".repeat(value));
  }

  #readValue() {
    this.#outputBrainfuck(".");
  }
}

type VariableLike = string | Variable | TemporaryVariable;
