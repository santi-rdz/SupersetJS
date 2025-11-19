import { TOKEN_TYPES } from "./tokens/token-types.mjs";
import { KEYWORDS } from "./tokens/keywords.mjs";
import { OPERATORS } from "./tokens/operators.mjs";
import { SYMBOLS } from "./tokens/symbols.mjs";

export function lex(input) {
  let pos = 0;
  let line = 1;
  let col = 1;

  const tokens = [];

  function currentChar() {
    return input[pos] ?? null;
  }

  function nextChar() {
    const ch = input[pos++];
    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function match(str) {
    return input.startsWith(str, pos);
  }

  function error(msg) {
    throw new Error(`Lexer error: ${msg} at line ${line}, col ${col}`);
  }

  // === MAIN LOOP ===
  while (pos < input.length) {
    let ch = currentChar();

    // Skip whitespace
    if (/\s/.test(ch)) {
      nextChar();
      continue;
    }

    // Comments: //
    if (match("//")) {
      while (ch !== "\n" && pos < input.length) {
        ch = nextChar();
      }
      continue;
    }

    // Comments: /* ... */
    if (match("/*")) {
      nextChar();
      nextChar();
      while (!match("*/")) {
        if (pos >= input.length) error("Unclosed block comment");
        nextChar();
      }
      nextChar();
      nextChar();
      continue;
    }

    // STRING: "..."
    if (ch === '"' || ch === "'") {
      const quote = ch;
      nextChar();
      let value = "";
      while (currentChar() !== quote) {
        if (pos >= input.length) error("Unclosed string literal");
        value += nextChar();
      }
      nextChar(); // close quote

      tokens.push({
        type: TOKEN_TYPES.STRING,
        value,
        line,
        col,
      });
      continue;
    }

    // NUMBER
    if (/[0-9]/.test(ch)) {
      let value = "";
      while (/[0-9.]/.test(currentChar())) value += nextChar();

      tokens.push({
        type: TOKEN_TYPES.NUMBER,
        value,
        line,
        col,
      });
      continue;
    }

    // IDENTIFIER or KEYWORD
    if (/[a-zA-Z_$]/.test(ch)) {
      let value = "";
      while (/[a-zA-Z0-9_$]/.test(currentChar())) {
        value += nextChar();
      }

      const type = KEYWORDS.has(value)
        ? TOKEN_TYPES.KEYWORD
        : TOKEN_TYPES.IDENTIFIER;

      tokens.push({
        type,
        value,
        line,
        col,
      });
      continue;
    }

    // OPERATORS (longest first)
    let matched = false;
    for (const op of OPERATORS) {
      if (match(op)) {
        for (let i = 0; i < op.length; i++) nextChar();
        tokens.push({
          type: TOKEN_TYPES.OPERATOR,
          value: op,
          line,
          col,
        });
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // SYMBOLS
    if (SYMBOLS[ch]) {
      tokens.push({
        type: TOKEN_TYPES.SYMBOL,
        value: ch,
        line,
        col,
      });
      nextChar();
      continue;
    }

    error(`Unknown character '${ch}'`);
  }

  tokens.push({
    type: TOKEN_TYPES.EOF,
    value: null,
    line,
    col,
  });

  return tokens;
}
