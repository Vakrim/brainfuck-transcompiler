import { Address } from './Address';
import { TemporaryVariable } from './TemporaryVariable';

export class TemporaryArray<Size extends ArraySize = ArraySize> {
  #address: Address;
  #size: number;
  #variables: TemporaryVariable[];

  constructor(address: Address, size: Size) {
    this.#address = address;
    this.#size = size;

    this.#variables = Array.from(
      { length: size },
      (_, offset) => new TemporaryVariable((this.#address + offset) as Address)
    );
  }

  at(index: Indexes<Size>) {
    return this.#variables[index];
  }

  get variables() {
    return [...this.#variables];
  }
}

type IndexesOfSize1 = 0;
type IndexesOfSize2 = IndexesOfSize1 | 1;
type IndexesOfSize3 = IndexesOfSize2 | 2;
type IndexesOfSize4 = IndexesOfSize3 | 3;
type IndexesOfSize5 = IndexesOfSize4 | 4;
type IndexesOfSize6 = IndexesOfSize5 | 5;
type IndexesOfSize7 = IndexesOfSize6 | 6;
type IndexesOfSize8 = IndexesOfSize7 | 7;
type IndexesOfSize9 = IndexesOfSize8 | 8;
type IndexesOfSize10 = IndexesOfSize9 | 9;
type IndexesOfSize11 = IndexesOfSize10 | 10;
type IndexesOfSize12 = IndexesOfSize11 | 11;
type IndexesOfSize13 = IndexesOfSize12 | 12;
type IndexesOfSize14 = IndexesOfSize13 | 13;
type IndexesOfSize15 = IndexesOfSize14 | 14;
type IndexesOfSize16 = IndexesOfSize15 | 15;

export type ArraySize =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export type Indexes<Size extends ArraySize> = Size extends 1
  ? IndexesOfSize1
  : Size extends 2
  ? IndexesOfSize2
  : Size extends 3
  ? IndexesOfSize3
  : Size extends 4
  ? IndexesOfSize4
  : Size extends 5
  ? IndexesOfSize5
  : Size extends 6
  ? IndexesOfSize6
  : Size extends 7
  ? IndexesOfSize7
  : Size extends 8
  ? IndexesOfSize8
  : Size extends 9
  ? IndexesOfSize9
  : Size extends 10
  ? IndexesOfSize10
  : Size extends 11
  ? IndexesOfSize11
  : Size extends 12
  ? IndexesOfSize12
  : Size extends 13
  ? IndexesOfSize13
  : Size extends 14
  ? IndexesOfSize14
  : Size extends 15
  ? IndexesOfSize15
  : Size extends 16
  ? IndexesOfSize16
  : void;
