import { Transcompiler } from "../Transcompiler";
import { executeCode } from "./execute-code";

describe("loop", () => {
  it("handles while loop", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("a");
    compiler.declareVariable("sum");
    compiler.writeInput("a");

    compiler.while("a", () => {
      compiler.add("sum", "a");
      compiler.writeInput("a");
    });

    compiler.readVariable("sum");

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler.code, [0]).codes).toEqual([0]);

    expect(executeCode(compiler.code, [2, 5, 0]).codes).toEqual([7]);

    expect(executeCode(compiler.code, [2, 5, 10, 0]).codes).toEqual([17]);
  });

  it("handles while loop", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("a");
    compiler.declareVariable("product");
    compiler.assignValue("product", 1);
    compiler.writeInput("a");

    compiler.while("a", () => {
      compiler.multiply("product", "a");
      compiler.writeInput("a");
    });

    compiler.readVariable("product");

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler.code, [0]).codes).toEqual([1]);

    expect(executeCode(compiler.code, [2, 0]).codes).toEqual([2]);

    expect(executeCode(compiler.code, [2, 5, 0]).codes).toEqual([10]);

    expect(executeCode(compiler.code, [2, 5, 10, 0]).codes).toEqual([100]);
  });
});