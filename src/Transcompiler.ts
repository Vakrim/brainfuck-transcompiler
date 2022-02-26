import { Address } from './Address';
import { CodePrinter, CodeOperation } from './CodePrinter';
import { Memory } from './Memory';
import { scopeSymbol } from './MemoryAllocationSnap';
import { Scope } from './Scope';
import { TemporaryVariable } from './TemporaryVariable';
import { Variable } from './Variable';

export class Transcompiler {
  #cursorPosition: Address = 0 as Address;
  #memory: Memory;
  #scope: Scope;
  #code: CodeOperation[];
  #currentCodeBlock: string;
  #codeBlockNamesStack: string[];

  constructor(memory = new Memory()) {
    this.#cursorPosition = 0 as Address;
    this.#memory = memory;
    this.#scope = new Scope(null, this.#memory);
    this.#code = [];
    this.#currentCodeBlock = '';
    this.#codeBlockNamesStack = [];
  }

  declareVariable(name: string) {
    this.#operation(`declare ${name}`, () => {
      this.#scope.declareVariable(name, this.#cursorPosition);
    });
  }

  assignValue(name: string, value: number) {
    this.#operation(`assign ${value} to ${name}`, () => {
      this.#reset(name);
      if (value > 0) {
        this.#inc(name, value);
      } else {
        this.#dec(name, -value);
      }
    });
  }

  writeInput(name: string) {
    this.#operation(`write input ${name}`, () => {
      this.#moveTo(name);
      this.#outputBrainfuck(',');
    });
  }

  printVariable(name: string) {
    this.#operation(`print ${name}`, () => {
      this.#printValue(name);
    });
  }

  printNumber(name: string) {
    this.#operation(`print ${name}`, () => {
      const ten = this.#declareTemporaryVariable(name);
      const tens = this.#declareTemporaryVariable(name);
      const ones = this.#declareTemporaryVariable(name);

      this.#inc(ten, 10);

      this.#divmod(tens, ones, name, ten);

      this.#reset(ten);
      this.#scope.unsetTemporaryVariable(ten);

      this.whenever(tens, () => {
        this.#inc(tens, 48);
        this.#printValue(tens);
        this.#reset(tens);
      });

      this.#inc(ones, 48);
      this.#printValue(ones);
      this.#reset(ones);

      this.#scope.unsetTemporaryVariable(tens);
      this.#scope.unsetTemporaryVariable(ones);
    });
  }

  add(to: string, from: string) {
    this.#operation(`add ${from} to ${to}`, () => {
      this.#add(to, from);
    });
  }

  increment(name: string, n: number = 1) {
    this.#operation(`increment ${name} with ${n}`, () => {
      this.#inc(name, n);
    });
  }

  decrement(name: string, n: number = 1) {
    this.#operation(`decrement ${name} with ${n}`, () => {
      this.#dec(name, n);
    });
  }

  whenever(
    conditionName: Addressable,
    ifPostitive: () => void,
    ifNegative?: () => void
  ) {
    const conditionCopy = this.#copy(conditionName);

    if (!ifNegative) {
      this.#operation(`if ${this.#commentVariable(conditionName)}`, () => {
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifPostitive);
      this.#operation(`endif ${this.#commentVariable(conditionName)}`, () => {
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[-]]`);
      });
    } else {
      const elseFlag = this.#declareTemporaryVariable(conditionCopy);

      this.#operation(`if ${this.#commentVariable(conditionName)}`, () => {
        this.#inc(elseFlag);
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifPostitive);
      this.#operation(`else ${this.#commentVariable(conditionName)}`, () => {
        this.#reset(conditionCopy);
        this.#dec(elseFlag);
        this.#moveTo(conditionCopy);
        this.#outputBrainfuck(`]`);
        this.#moveTo(elseFlag);
        this.#outputBrainfuck(`[`);
      });
      this.scope(ifNegative);
      this.#operation(`endif ${this.#commentVariable(conditionName)}`, () => {
        this.#dec(elseFlag);
        this.#outputBrainfuck(`]`);
        this.#scope.unsetTemporaryVariable(elseFlag);
      });
    }

    this.#scope.unsetTemporaryVariable(conditionCopy);
  }

  multiply(to: string, from: string) {
    this.#operation(`multiply ${from} to ${to}`, () => {
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

      this.#scope.unsetTemporaryVariable(interator);
      this.#reset(interator2swap);
      this.#scope.unsetTemporaryVariable(interator2swap);

      this.#reset(to);
      this.#restoreValueFromTemporary(to, result);
    });
  }

  divmod(
    divResult: string,
    modResult: string,
    dividentOriginal: string,
    divisorOriginal: string
  ) {
    this.#operation(
      `divmod (${divResult} ${modResult}) = ${dividentOriginal} / ${divisorOriginal}`,
      () => {
        this.#divmod(divResult, modResult, dividentOriginal, divisorOriginal);
      }
    );
  }

  isGreaterThanOrEqual(result: string, originalA: string, originalB: string) {
    this.#operation(`${result} = ${originalA} >= ${originalB}`, () => {
      const a = this.#copy(originalA);
      const b = this.#copy(originalB);
      this.#reset(result);

      this.whenever(
        b,
        () => {},
        () => {
          this.#inc(result);
        }
      );

      this.#loopOf(a, () => {
        this.#dec(b);
        this.whenever(
          b,
          () => {},
          () => {
            this.#inc(result);
          }
        );
      });

      this.#reset(b);
      this.#scope.unsetTemporaryVariable(b);
      this.#scope.unsetTemporaryVariable(a);
    });
  }

  while(name: string, fn: () => void) {
    this.#operation(`while ${name}`, () => {
      this.#moveTo(name);
      this.#outputBrainfuck(`[`);
    });
    this.scope(fn);
    this.#operation(`endwhile ${name}`, () => {
      this.#moveTo(name);
      this.#outputBrainfuck(`]`);
    });
  }

  scope(fn: () => void) {
    this.#pushScope();
    fn();
    this.#popScope();
  }

  get code(): string {
    this.#scope.deepVerifyBeforeDiscard();

    this.#operation('', () => {});

    return new CodePrinter(this.#code).print();
  }

  #operation(name: string, fn: () => void) {
    if (this.#codeBlockNamesStack.length > 0) {
      this.#code.push({
        name: this.#codeBlockNamesStack[this.#codeBlockNamesStack.length - 1],
        code: this.#currentCodeBlock,
        level: this.#codeBlockNamesStack.length,
      });
      this.#currentCodeBlock = '';
    }

    this.#codeBlockNamesStack.push(name);
    fn();
    if (this.#currentCodeBlock) {
      this.#code.push({
        name,
        code: this.#currentCodeBlock,
        level: this.#codeBlockNamesStack.length,
      });
      this.#currentCodeBlock = '';
    }
    this.#codeBlockNamesStack.pop();
  }

  #restoreValueFromTemporary(
    target: Addressable,
    temporaryWithValue: TemporaryVariable
  ) {
    this.#moveValue(target, temporaryWithValue);
    this.#scope.unsetTemporaryVariable(temporaryWithValue);
  }

  #add(to: Addressable, from: Addressable) {
    this.#moveTo(from);
    const newFrom = this.#declareTemporaryVariable(this.#cursorPosition);

    this.#loopOf(from, () => {
      this.#inc(newFrom);
      this.#inc(to);
    });

    this.#restoreValueFromTemporary(from, newFrom);
  }

  #divmod(
    divResult: Addressable,
    modResult: Addressable,
    dividentOriginal: Addressable,
    divisorOriginal: Addressable
  ) {
    const array = this.#scope.declareTemporaryArray(
      (this.#normalizeAddress(divResult) + 2) as Address,
      7
    );

    this.#add(array.at(0), dividentOriginal);
    this.#add(array.at(2), divisorOriginal);

    this.#moveTo(array.at(0));
    this.#outputBrainfuck(`[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]`);

    this.#reset(modResult);
    this.#moveValue(modResult, array.at(3));
    this.#reset(divResult);
    this.#moveValue(divResult, array.at(4));

    array.variables.forEach((v) => this.#reset(v));

    this.#scope.unsetTemporaryArray(array);
  }

  #pushScope() {
    this.#code.push({
      scope: 'open',
    });
    this.#scope = new Scope(this.#scope, this.#memory);
  }

  #popScope() {
    this.#scope.verifyBeforeDiscard();

    const variables = this.#scope.getVariablesOfThisScope();
    for (const variable of variables) {
      this.#reset(variable);
      this.#scope.unsetVariable(variable);
    }
    this.#scope = this.#scope.getParentScope();
    this.#code.push({
      scope: 'close',
    });
  }

  #declareTemporaryVariable(nextTo: Addressable = this.#cursorPosition) {
    const nextToAddress = this.#normalizeAddress(nextTo);
    const variable = this.#scope.declareTemporaryVariable(nextToAddress);
    return variable;
  }

  #copy(from: Addressable) {
    const newFrom = this.#declareTemporaryVariable();
    const newTo = this.#declareTemporaryVariable();

    this.#operation(
      `copy ${this.#commentVariable(from)} to ${this.#commentVariable(newTo)}`,
      () => {
        this.#loopOf(from, () => {
          this.#inc(newFrom);
          this.#inc(newTo);
        });

        this.#restoreValueFromTemporary(from, newFrom);
      }
    );

    return newTo;
  }

  #moveValue(to: Addressable, from: TemporaryVariable) {
    this.#loopOf(from, () => {
      this.#inc(to);
    });
  }

  #reset(name: Addressable) {
    this.#moveTo(name);
    this.#outputBrainfuck('[-]');
  }

  #normalizeVariable(variableLike: VariableLike) {
    if (typeof variableLike === 'string') {
      return this.#scope.getVariable(variableLike);
    }
    return variableLike;
  }

  #normalizeAddress(addressable: Addressable) {
    if (typeof addressable === 'number') {
      return addressable;
    }
    return this.#normalizeVariable(addressable).address;
  }

  #moveTo(addressable: Addressable) {
    const address = this.#normalizeAddress(addressable);

    const difference = address - this.#cursorPosition;
    if (difference < 0) {
      this.#outputBrainfuck('<'.repeat(-difference));
    } else if (difference > 0) {
      this.#outputBrainfuck('>'.repeat(difference));
    }
    this.#cursorPosition = address;
  }

  #loopOf(iterator: Addressable, fn: () => void) {
    this.#moveTo(iterator);
    this.#outputBrainfuck(`[`);
    this.#dec(iterator);
    fn();
    this.#moveTo(iterator);
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

  #printValue(addressable: Addressable) {
    this.#moveTo(addressable);
    this.#outputBrainfuck('.');
  }

  #commentVariable(addressable: Addressable) {
    if (typeof addressable === 'string') {
      return addressable;
    }
    if (addressable instanceof Variable) {
      return addressable.name;
    }
    const address = this.#normalizeAddress(addressable);
    return `temporary[${address}]`;
  }

  get [scopeSymbol]() {
    return this.#scope;
  }
}

type VariableLike = string | Variable | TemporaryVariable;

type Addressable = VariableLike | Address;
