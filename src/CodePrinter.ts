export class CodePrinter {
  #code: CodeOperation[];

  constructor(code: CodeOperation[]) {
    this.#code = code;
  }

  print(): string {
    let indentation = 0;

    return this.#code
      .map((op) => {
        if ("code" in op) {
          return `${" ".repeat(indentation)}${[
            op.code,
            this.#sanitizeComment(op.name),
          ]
            .filter(Boolean)
            .join("  ")}`;
        }
        indentation += op.scope === "open" ? 2 : -2;
      })
      .filter(Boolean)
      .join("\n");
  }

  #sanitizeComment(comment: string) {
    return comment.replace(/[\,\.\[\]\<\>\+\-]/, " ");
  }
}

interface Operation {
  code: string;
  name: string;
}

interface ScopeOperation {
  scope: "open" | "close";
}

export type CodeOperation = Operation | ScopeOperation;
