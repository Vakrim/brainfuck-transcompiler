import Brainfuck from "brainfuck-node";

export function executeCode(code: string, input?: string) {
  const brainfuck = new Brainfuck();

  const { output, memory } = brainfuck.execute(code, input);

  return {
    output,
    codes: getCodes(output),
    memory: memory.list,
  };
}

function getCodes(text: string) {
  return Array.from({ length: text.length }, (v, i) => text.charCodeAt(i));
}
