import Brainfuck from "brainfuck-node";

export function executeCode(code: string, input?: string | number[]) {
  const brainfuck = new Brainfuck();

  const normalizedInput = input
    ? typeof input === "string"
      ? input
      : String.fromCharCode(...input)
    : undefined;

  const { output, memory } = brainfuck.execute(code, normalizedInput);

  return {
    output,
    codes: getCodes(output),
    memory: memory.list,
  };
}

function getCodes(text: string) {
  return Array.from({ length: text.length }, (v, i) => text.charCodeAt(i));
}
