import { Transcompiler } from "../Transcompiler";
import { executeCode } from "./execute-code";

describe("multiplying", () => {
  it("multiplies two variables", () => {
    const compiler = new Transcompiler();

    compiler.declareVariable("a");
    compiler.assignValue("a", 8);
    compiler.declareVariable("b");
    compiler.assignValue("b", 6);

    compiler.multiply("b", "a");

    compiler.readVariable("b");
    compiler.readVariable("a");

    expect(compiler.code).toMatchSnapshot();

    expect(executeCode(compiler.code).codes).toEqual([48, 8]);
  });
});
