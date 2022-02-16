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

    this.#moveToVariable(name);
    this.#setValue(value);
  }

  writeInput(name: string) {
    this.comment(`write input ${name}`);

    this.#moveToVariable(name);
    this.#outputBrainfuck(",");
  }

  readVariable(name: string) {
    this.comment(`read ${name}`);

    this.#moveToVariable(name);
    this.#readValue();
  }

  add(to: string, from: string) {
    this.comment(`add ${from} to ${to}`);

    this.#moveToVariable(from);
    const newFrom = this.#declareTemporaryVariable(this.#cursorPosition);

    this.#loopOf(from, () => {
      this.#moveToVariable(newFrom);
      this.#inc();

      this.#moveToVariable(to);
      this.#inc();
    });

    this.#scope.promoteVariable(from, newFrom);
  }

  multiply(to: string, from: string) {
    this.comment(`multiply ${from} to ${to}`);

    const interator = this.#copy(from);
    const interator2 = this.#copy(to);
    const interator2swap = this.#declareTemporaryVariable(interator.address);
    const result = this.#declareTemporaryVariable(interator.address);

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
      this.#scope.unsetVariable(variable);
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

  #declareTemporaryVariable(nextTo: Address = this.#cursorPosition) {
    const { variable, isDirty } = this.#scope.declareTemporaryVariable(nextTo);
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
      this.#moveToVariable(newFrom);
      this.#inc();
      this.#moveToVariable(newTo);
      this.#inc();
    });

    this.#scope.promoteVariable(from, newFrom);

    return newTo;
  }

  #moveToVariable(nameOrVariable: VariableLike) {
    this.#moveTo(this.#normalizeVariable(nameOrVariable).address);
  }

  #reset(name: VariableLike) {
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
