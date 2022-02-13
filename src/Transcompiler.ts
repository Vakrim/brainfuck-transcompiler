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

  constructor() {
    this.#cursorPosition = 0 as Address;
    this.#memory = new Memory();
    this.#scope = new Scope(null, this.#memory);
    this.#code = "";
  }

  declareVariable(name: string) {
    this.#scope.declareVariable(name, this.#cursorPosition);
  }

  assignValue(name: string, value: number) {
    this.#moveToVariable(name);
    this.#setValue(value);
  }

  readVariable(name: string) {
    this.#moveToVariable(name);
    this.#readValue();
  }

  add(from: string, ...tos: string[]) {
    this.#moveToVariable(from);
    const newFrom = this.#scope.declareTemporaryVariable(this.#cursorPosition);

    this.#loop(() => {
      this.#moveToVariable(newFrom);
      this.#inc();

      tos.forEach(to => {
        this.#moveToVariable(to);
        this.#inc();
      })
    });

    this.#scope.promoteVariable(from, newFrom);
  }

  get code() {
    return this.#code;
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
      this.#outputBrainfuck("<".repeat(-difference), `move to ${address}`);
    } else if (difference > 0) {
      this.#outputBrainfuck(">".repeat(difference), `move to ${address}`);
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

  #outputBrainfuck(bf: string, comment?: string) {
    this.#code += `${bf}${comment ? ` // ${comment}` : ""}\n`;
  }

  #dec() {
    this.#outputBrainfuck(`-`);
  }

  #inc() {
    this.#outputBrainfuck(`+`);
  }

  #setValue(value: number) {
    this.#outputBrainfuck(
      "+".repeat(value),
      `set to ${value} / 0x${value.toString(16)} / ${String.fromCharCode(
        value
      )}`
    );
  }

  #readValue() {
    this.#outputBrainfuck(".");
  }
}
