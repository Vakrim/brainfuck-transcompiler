import { Transcompiler } from "../Transcompiler";
import { executeCode } from "./execute-code";

describe("assign variables and read", () => {
  it("reads one variable", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("a");
    compiler.assignValue("a", 10);
    compiler.declareVariable("b");
    compiler.assignValue("b", 15);

    compiler.add("a", "b");

    compiler.readVariable("b");
    compiler.readVariable("a");

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler.code).codes).toEqual([25, 10]);
  });
});
