// src/lexer/utils/charStream.js
export class CharStream {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  peek() {
    return this.input[this.pos] ?? null;
  }

  next() {
    const ch = this.input[this.pos++];
    if (ch === "\n") {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return ch;
  }

  match(str) {
    return this.input.startsWith(str, this.pos);
  }

  eof() {
    return this.pos >= this.input.length;
  }
}
