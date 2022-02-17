import { Transcompiler } from "../Transcompiler";
import { executeCode } from "./execute-code";

describe("memory management", () => {
  it("declare variables and clean memory after closing scope", () => {
    const compiler = new Transcompiler();
    compiler.declareVariable("a");
    compiler.declareVariable("b");

    compiler.assignValue("a", 1);
    compiler.assignValue("b", 2);

    compiler.scope(() => {
      compiler.declareVariable("c");
      compiler.assignValue("c", 3);

      expect(executeCode(compiler.code).memory).toEqual([1, 2, 3]);
    });

    expect(executeCode(compiler.code).memory).toEqual([1, 2, 3]);

    compiler.declareVariable("d");

    expect(executeCode(compiler.code).memory).toEqual([1, 2, 0]);

    expect(compiler.code).toMatchSnapshot();
  });

  it("declares temporary variable", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("a");

    compiler.scope(() => {
      compiler.declareVariable("b");

      compiler.assignValue("a", 1);
      compiler.assignValue("b", 2);

      expect(executeCode(compiler.code).memory).toEqual([1, 2]);

      compiler.add("b", "a");

      expect(executeCode(compiler.code).memory).toEqual([0, 3, 1]);
    });

    expect(executeCode(compiler.code).memory).toEqual([0, 3, 1]);

    compiler.declareVariable("b");
    compiler.declareVariable("c");

    expect(executeCode(compiler.code).memory).toEqual([0, 0, 1]);

    expect(compiler.code).toMatchSnapshot();
  });

  it("sums list of numbers declared in scope", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("sum");

    for (let i = 1; i <= 5; i++) {
      compiler.scope(() => {
        compiler.declareVariable("term");
        compiler.assignValue("term", i);
        compiler.add("sum", "term");
      });
    }

    expect(executeCode(compiler.code).memory).toEqual([15, 0, 5]);

    expect(compiler.code).toMatchSnapshot();
  });
});
