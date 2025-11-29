// src/index.mjs
import { lex } from "./lexer/lexer.js";
import Parser from "./parser/parser.js";
import { SemanticAnalyzer } from "./semantic/analyzer.js";
import { CodeGenerator } from "./codegen/codegen.js";
import fs from "node:fs/promises";

// Código de prueba
const code = await fs.readFile("./examples/example.sjs", "utf8");

// === LEXER ===
const tokens = lex(code);

console.log("\nTOKENS:");
console.log(tokens);

// === PARSER ===
const parser = new Parser(tokens);
const ast = parser.parseProgram();

console.log("\nAST:");
console.dir(ast, { depth: 10 });

// === SEMANTIC ANALYZER ===
const analyzer = new SemanticAnalyzer();
const globalTable = analyzer.analyze(ast);

console.log("\nSYMBOL TABLE:");
console.dir(globalTable, { depth: 10 });

// === CODE GENERATOR ===
const generator = new CodeGenerator();
const jsCode = generator.generate(ast);

console.log("\nGENERATED JS CODE:");
console.log(jsCode);

// Opcional: escribir a un archivo
await fs.writeFile("./examples/output.js", jsCode, "utf8");
console.log("\nArchivo output.js generado exitosamente!");
