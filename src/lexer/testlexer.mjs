import fs from "node:fs/promises";
import { lex } from "./lexer.mjs";

const code = await fs.readFile("examples/sample.sjs", "utf8");
const tokens = lex(code);

console.log(tokens);
