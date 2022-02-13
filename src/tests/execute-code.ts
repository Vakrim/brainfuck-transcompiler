import Brainfuck from "brainfuck-node";

export function executeCode(code: string, input?: string) {
  const brainfuck = new Brainfuck();

  const { output } = brainfuck.execute(code, input);

  return {
    output,
    codes: getCodes(output),
  };
}

function getCodes(text: string) {
  return Array.from({ length: text.length }, (v, i) => text.charCodeAt(i));
}
