// src/lexer/lexer.js
import { CharStream } from "./utils/charStream.js";
import { TOKEN_TYPES } from "./tokens/token-types.mjs";
import { KEYWORDS } from "./tokens/keywords.mjs";
import { OPERATORS } from "./tokens/operators.mjs";
import { SYMBOLS } from "./tokens/symbols.mjs";

export function lex(input) {
  const stream = new CharStream(input);
  const tokens = [];

  function error(msg) {
    throw new Error(
      `Lexer error: ${msg} at line ${stream.line}, col ${stream.col}`
    );
  }

  while (!stream.eof()) {
    let ch = stream.peek();

    // Whitespace
    if (/\s/.test(ch)) {
      stream.next();
      continue;
    }

    // Line comment: //
    if (stream.match("//")) {
      stream.next();
      stream.next();
      while (stream.peek() !== "\n" && !stream.eof()) {
        stream.next();
      }
      continue;
    }

    // Block comment: /* ... */
    if (stream.match("/*")) {
      stream.next();
      stream.next();
      while (!stream.match("*/")) {
        if (stream.eof()) error("Unclosed block comment");
        stream.next();
      }
      stream.next();
      stream.next();
      continue;
    }

    // String literal
    if (ch === '"' || ch === "'") {
      const quote = ch;
      stream.next();
      let value = "";

      while (stream.peek() !== quote) {
        if (stream.eof()) error("Unclosed string literal");
        value += stream.next();
      }

      stream.next(); // Closing quote

      tokens.push({
        type: TOKEN_TYPES.STRING,
        value,
        line: stream.line,
        col: stream.col,
      });

      continue;
    }

    // Number literal
    if (/[0-9]/.test(ch)) {
      let value = "";

      while (/[0-9.]/.test(stream.peek())) {
        value += stream.next();
      }

      tokens.push({
        type: TOKEN_TYPES.NUMBER,
        value,
        line: stream.line,
        col: stream.col,
      });

      continue;
    }

    // Identifiers / Keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let value = "";
      while (/[a-zA-Z0-9_$]/.test(stream.peek())) {
        value += stream.next();
      }

      const type = KEYWORDS.has(value)
        ? TOKEN_TYPES.KEYWORD
        : TOKEN_TYPES.IDENTIFIER;

      tokens.push({
        type,
        value,
        line: stream.line,
        col: stream.col,
      });

      continue;
    }

    // Operators (longest match first)
    let matched = false;
    for (const op of OPERATORS) {
      if (stream.match(op)) {
        for (let i = 0; i < op.length; i++) stream.next();

        tokens.push({
          type: TOKEN_TYPES.OPERATOR,
          value: op,
          line: stream.line,
          col: stream.col,
        });

        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Symbols
    if (SYMBOLS[ch]) {
      tokens.push({
        type: TOKEN_TYPES.SYMBOL,
        value: ch,
        line: stream.line,
        col: stream.col,
      });
      stream.next();
      continue;
    }

    error(`Unknown character '${ch}'`);
  }

  // End of file token
  tokens.push({
    type: TOKEN_TYPES.EOF,
    value: null,
    line: stream.line,
    col: stream.col,
  });

  return tokens;
}
