import {
  Program,
  VariableDeclaration,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  ExpressionStatement,
  ReturnStatement,
  FunctionDeclaration,
  IfStatement,
  InterfaceDeclaration,
  ObjectLiteral,
} from "../ast/ast.js";

export default class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }

  peek(offset = 0) {
    return this.tokens[this.i + offset] ?? { type: "EOF", value: null };
  }

  eof() {
    return this.peek().type === "EOF";
  }

  consume(type, value) {
    const t = this.peek();
    if (t.type !== type)
      throw new Error(`Expected ${type} but got ${t.type} at index ${this.i}`);
    if (value !== undefined && t.value !== value)
      throw new Error(`Expected ${value} but got ${t.value}`);
    this.i++;
    return t;
  }

  consumeIf(type, value) {
    const t = this.peek();
    if (t.type === type && (value === undefined || t.value === value)) {
      this.i++;
      return t;
    }
    return null;
  }

  // ---- PROGRAM ----
  parseProgram() {
    const body = [];
    while (!this.eof()) body.push(this.parseStatement());
    return Program(body);
  }

  parseStatement() {
    const t = this.peek();

    if (t.type === "KEYWORD" && ["let", "var", "const"].includes(t.value))
      return this.parseVariableDeclaration();

    if (t.type === "KEYWORD" && t.value === "fn")
      return this.parseFunctionDeclaration();

    if (t.type === "KEYWORD" && t.value === "return") {
      this.consume("KEYWORD", "return");
      const argument = this.parseExpression();
      this.consumeIf("SYMBOL", ";");
      return ReturnStatement(argument);
    }

    if (t.type === "KEYWORD" && t.value === "if")
      return this.parseIfStatement();

    if (t.type === "KEYWORD" && t.value === "interface")
      return this.parseInterfaceDeclaration();

    const expr = this.parseExpression();
    this.consumeIf("SYMBOL", ";");
    return ExpressionStatement(expr);
  }

  // ---- VARIABLES ----
  parseVariableDeclaration() {
    const kind = this.consume("KEYWORD").value;
    const id = Identifier(this.consume("IDENTIFIER").value);

    let varType = this.parseOptionalType();
    let init = null;

    if (this.consumeIf("OPERATOR", "=") || this.consumeIf("SYMBOL", "=")) {
      init = this.parseExpression();
    }
    this.consumeIf("SYMBOL", ";");

    return VariableDeclaration(kind, id, varType, init);
  }

  // ---- FUNCTIONS ----
  parseFunctionDeclaration() {
    this.consume("KEYWORD", "fn");
    const id = Identifier(this.consume("IDENTIFIER").value);

    this.consume("SYMBOL", "(");
    const params = [];
    if (!this.consumeIf("SYMBOL", ")")) {
      do {
        const name = this.consume("IDENTIFIER").value;
        const type = this.parseOptionalType();
        params.push({ name, type });
      } while (this.consumeIf("SYMBOL", ","));
      this.consume("SYMBOL", ")");
    }

    const returnType = this.parseOptionalType();

    this.consume("SYMBOL", "{");
    const body = [];
    while (!this.consumeIf("SYMBOL", "}")) body.push(this.parseStatement());
    return FunctionDeclaration(id, params, returnType, body);
  }

  // ---- IF ----
  parseIfStatement() {
    this.consume("KEYWORD", "if");
    this.consume("SYMBOL", "(");
    const test = this.parseExpression();
    this.consume("SYMBOL", ")");
    this.consume("SYMBOL", "{");

    const consequent = [];
    while (!this.consumeIf("SYMBOL", "}"))
      consequent.push(this.parseStatement());

    let alternate = null;
    if (this.consumeIf("KEYWORD", "else")) {
      this.consume("SYMBOL", "{");
      alternate = [];
      while (!this.consumeIf("SYMBOL", "}"))
        alternate.push(this.parseStatement());
    }

    return IfStatement(test, consequent, alternate);
  }

  // ---- TYPES ----
  parseOptionalType() {
    if (this.consumeIf("SYMBOL", ":")) {
      const t = this.peek();

      if (t.type !== "IDENTIFIER" && t.type !== "KEYWORD")
        throw new Error(`Expected type name but got ${t.type}`);

      this.i++;
      return t.value;
    }
    return null;
  }

  // ---- EXPRESSIONS ----
  parseExpression() {
    return this.parseBinaryExpression();
  }

  parseUnaryExpression() {
    const t = this.peek();
    if (t.type === "OPERATOR" && (t.value === "!" || t.value === "-")) {
      this.consume("OPERATOR");
      const argument = this.parseUnaryExpression();
      return { type: "UnaryExpression", operator: t.value, argument };
    }
    return this.parsePrimary();
  }

  parseBinaryExpression(precedence = 0) {
    let left = this.parseUnaryExpression();

    const table = { "+": 1, "-": 1, "*": 2, "/": 2 };

    while (true) {
      const t = this.peek();
      const prec = table[t.value];
      if (!prec || prec < precedence) break;

      this.consume("OPERATOR");
      const right = this.parseBinaryExpression(prec + 1);
      left = { type: "BinaryExpression", operator: t.value, left, right };
    }
    return left;
  }

  parsePrimary() {
    const t = this.peek();

    if (t.type === "NUMBER") {
      this.i++;
      return NumericLiteral(Number(t.value));
    }

    if (t.type === "STRING") {
      this.i++;
      return StringLiteral(t.value);
    }

    if (t.type === "KEYWORD" && (t.value === "true" || t.value === "false")) {
      this.i++;
      return BooleanLiteral(t.value === "true");
    }

    // OBJETOS
    if (t.type === "SYMBOL" && t.value === "{") {
      return this.parseObjectLiteral();
    }

    // IDENTIFIER / MEMBER / CALL
    if (t.type === "IDENTIFIER") {
      let expr = Identifier(this.consume("IDENTIFIER").value);

      while (this.consumeIf("SYMBOL", ".")) {
        const prop = this.consume("IDENTIFIER").value;
        expr = {
          type: "MemberExpression",
          object: expr,
          property: Identifier(prop),
        };
      }

      if (this.consumeIf("SYMBOL", "(")) {
        const args = [];
        if (!this.consumeIf("SYMBOL", ")")) {
          do {
            args.push(this.parseExpression());
          } while (this.consumeIf("SYMBOL", ","));
          this.consume("SYMBOL", ")");
        }
        expr = { type: "CallExpression", callee: expr, arguments: args };
      }

      return expr;
    }

    // ( expr )
    if (t.type === "SYMBOL" && t.value === "(") {
      this.consume("SYMBOL", "(");
      const expr = this.parseExpression();
      this.consume("SYMBOL", ")");
      return expr;
    }

    throw new Error(`Unexpected token ${t.type} ${t.value}`);
  }

  // ---- OBJECT LITERALS ----
  parseObjectLiteral() {
    this.consume("SYMBOL", "{");
    const properties = [];

    if (!this.consumeIf("SYMBOL", "}")) {
      do {
        const key = this.consume("IDENTIFIER").value;
        this.consume("SYMBOL", ":");
        const value = this.parseExpression();
        properties.push({ key, value });
      } while (this.consumeIf("SYMBOL", ","));
      this.consume("SYMBOL", "}");
    }

    return ObjectLiteral(properties);
  }

  // ---- INTERFACE ----
  parseInterfaceDeclaration() {
    this.consume("KEYWORD", "interface");
    const id = Identifier(this.consume("IDENTIFIER").value);

    this.consume("SYMBOL", "{");
    const properties = [];

    while (!this.consumeIf("SYMBOL", "}")) {
      const key = this.consume("IDENTIFIER").value;

      this.consume("SYMBOL", ":");

      // ✔ Aceptar KEYWORD o IDENTIFIER como tipo
      const t = this.peek();
      if (t.type !== "IDENTIFIER" && t.type !== "KEYWORD")
        throw new Error(
          `Expected type in interface but got ${t.type} ${t.value}`
        );

      this.i++; // consumir tipo
      const type = t.value;

      this.consumeIf("SYMBOL", ";");

      properties.push({ key, type });
    }

    return InterfaceDeclaration(id, properties);
  }
}
