import { Transcompiler } from "../Transcompiler";
import { executeCode } from "./execute-code";

describe("loop", () => {
  it.skip("handles while loop", () => {
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
});
