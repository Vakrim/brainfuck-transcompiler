declare module 'brainfuck-node' {
  export default class Brainfuck {
    execute(
      code: string,
      input?: string
    ): { output: string; memory: { list: number[] } };
  }
}
