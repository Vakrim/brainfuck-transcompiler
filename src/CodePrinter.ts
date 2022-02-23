export class CodePrinter {
  #code: CodeOperation[];

  constructor(code: CodeOperation[]) {
    this.#code = code;
  }

  print(): string {
    let indentation = 0;

    return this.#code
      .map((op) => {
        if ('code' in op) {
          return `${' '.repeat(indentation + op.level - 1)}${[
            op.code,
            this.#sanitizeComment(op.name),
          ]
            .filter(Boolean)
            .join('  ')}`;
        }
        indentation += op.scope === 'open' ? 2 : -2;
      })
      .filter(Boolean)
      .join('\n');
  }

  #sanitizeComment(comment: string) {
    return comment
      .replace(/\,/g, '؍')
      .replace(/\./g, 'ꓸ')
      .replace(/\[/g, '〔')
      .replace(/\]/g, '〕')
      .replace(/\</g, '❮')
      .replace(/\>/g, '❯')
      .replace(/\+/g, '᛭')
      .replace(/\-/g, '˗');
  }
}

interface Operation {
  code: string;
  name: string;
  level: number;
}

interface ScopeOperation {
  scope: 'open' | 'close';
}

export type CodeOperation = Operation | ScopeOperation;
