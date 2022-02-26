import Brainfuck from 'brainfuck-node';
import { MemoryAllocationSnap } from '../compiler/MemoryAllocationSnap';
import { Transcompiler } from '../compiler/Transcompiler';

export function executeCode(
  compiler: Transcompiler,
  input?: string | number[]
) {
  const code = compiler.code;

  const brainfuck = new Brainfuck();

  const normalizedInput = input
    ? typeof input === 'string'
      ? input
      : String.fromCharCode(...input)
    : undefined;

  const { output, memory } = brainfuck.execute(code, normalizedInput);

  const memoryAllocationSnap = new MemoryAllocationSnap(compiler);

  return {
    output,
    codes: getCodes(output),
    memoryAllocation: memoryAllocationSnap.printSnap(memory.list),
  };
}

function getCodes(text: string) {
  return Array.from({ length: text.length }, (v, i) => text.charCodeAt(i));
}
