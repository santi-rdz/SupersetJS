import { SymbolTable } from "./symbolTable.js";

export class SemanticAnalyzer {
  constructor() {
    this.global = new SymbolTable();
  }

  analyze(ast) {
    this.visitProgram(ast, this.global);
    return this.global;
  }

  getType(node, table) {
    return this.visit(node, table);
  }

  throwTypeError(msg) {
    throw new Error(`Type error: ${msg}`);
  }

  visit(node, table) {
    if (!node) return null;
    const fn = this[`visit${node.type}`];
    if (!fn) return null;
    return fn.call(this, node, table);
  }

  visitProgram(node, table) {
    for (const stmt of node.body) this.visit(stmt, table);
  }

  // === Literales ===
  visitNumericLiteral() {
    return "number";
  }
  visitStringLiteral() {
    return "string";
  }
  visitBooleanLiteral() {
    return "boolean";
  }

  // === Identificadores ===
  visitIdentifier(node, table) {
    const info = table.lookup(node.name);
    return info?.type ?? info ?? null;
  }

  // === Objetos ===
  visitObjectLiteral(node, table) {
    const map = {};
    for (const p of node.properties) {
      map[p.key] = this.getType(p.value, table);
    }
    return { kind: "object", props: map };
  }

  // === Interfaces ===
  visitInterfaceDeclaration(node, table) {
    table.define(node.name.name, {
      kind: "interface",
      name: node.name.name,
      properties: node.properties,
    });
  }

  validateObjectAgainstInterface(obj, iface) {
    for (const prop of iface.properties) {
      if (!(prop.key in obj.props))
        this.throwTypeError(
          `Missing property '${prop.key}' in object for interface ${iface.name}`
        );
      const got = obj.props[prop.key];
      if (got !== prop.type)
        this.throwTypeError(
          `Property '${prop.key}' expected ${prop.type} but got ${got}`
        );
    }
  }

  // === Variables ===
  visitVariableDeclaration(node, table) {
    const declared = node.varType;
    const initType = node.init ? this.getType(node.init, table) : null;

    let finalType = declared ?? initType ?? "any";

    // Validar objetos con interface
    if (declared && initType?.kind === "object") {
      const iface = table.lookup(declared);
      if (iface?.kind === "interface") {
        this.validateObjectAgainstInterface(initType, iface);
        finalType = declared;
      }
    }

    table.define(node.id.name, {
      kind: "variable",
      type: finalType,
    });
  }

  // === Binary ===
  visitBinaryExpression(node, table) {
    const left = this.getType(node.left, table);
    const right = this.getType(node.right, table);

    if (left !== right)
      this.throwTypeError(
        `Cannot apply '${node.operator}' to ${left} and ${right}`
      );

    return left;
  }

  // === Unary ===
  visitUnaryExpression(node, table) {
    const arg = this.getType(node.argument, table);
    if (node.operator === "!") {
      if (arg !== "boolean") this.throwTypeError("! requires boolean");
      return "boolean";
    }
    if (node.operator === "-") {
      if (arg !== "number") this.throwTypeError("- requires number");
      return "number";
    }
    return "any";
  }

  // === Functions ===
  visitFunctionDeclaration(node, table) {
    table.define(node.name.name, {
      kind: "function",
      params: node.params,
      returnType: node.returnType ?? null,
    });

    const local = new SymbolTable(table);

    for (const p of node.params) {
      local.define(p.name, { kind: "parameter", type: p.type });
    }

    let inferredReturn = null;

    for (const stmt of node.body) {
      const r = this.visit(stmt, local);
      if (stmt.type === "ReturnStatement") inferredReturn = r;
    }

    const fn = table.lookup(node.name.name);
    fn.returnType = fn.returnType ?? inferredReturn ?? "void";
  }

  visitReturnStatement(node, table) {
    return this.getType(node.argument, table);
  }

  // === Member ===
  visitMemberExpression() {
    return "any";
  }

  // === Call ===
  visitCallExpression() {
    return "any";
  }

  // === If ===
  visitIfStatement(node, table) {
    const cond = this.getType(node.test, table);
    if (cond !== "boolean") this.throwTypeError("If condition must be boolean");

    const s1 = new SymbolTable(table);
    for (const stmt of node.consequent) this.visit(stmt, s1);

    if (node.alternate) {
      const s2 = new SymbolTable(table);
      for (const stmt of node.alternate) this.visit(stmt, s2);
    }
  }
}
