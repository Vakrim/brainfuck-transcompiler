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

  constructor() {
    this.#cursorPosition = 0 as Address;
    this.#memory = new Memory();
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

    this.#loop(() => {
      this.#moveToVariable(newFrom);
      this.#inc();

      this.#moveToVariable(to);
      this.#inc();
    });

    this.#scope.promoteVariable(from, newFrom);
  }

  get code() {
    return this.#code;
  }

  #comment(comment: string) {
    this.#commentBuffer = this.#commentBuffer
      ? [this.#commentBuffer, comment].join("; ")
      : comment;
  }

  #moveToVariable(nameOrVariable: string | Variable | TemporaryVariable) {
    const variable =
      typeof nameOrVariable === "string"
        ? this.#scope.getVariable(nameOrVariable)
        : nameOrVariable;

    this.#moveTo(variable.address);
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

  #loop(fn: () => void) {
    this.#outputBrainfuck(`[`);
    this.#dec();
    const loopConditionPostion = this.#cursorPosition;
    fn();
    this.#moveTo(loopConditionPostion);
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
