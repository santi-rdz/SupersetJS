import fs from "node:fs/promises";
import os from "node:os";
import { lex } from "./lexer.mjs";

// Ruta absoluta basada en el archivo actual (NO falla)
const path = new URL("../../examples/sample.sjs", import.meta.url);

const code = await fs.readFile(path, "utf8");
const tokens = lex(code);
console.log(tokens);
