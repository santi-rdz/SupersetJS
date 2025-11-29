export class CodeGenerator {
  generate(node) {
    const method = this[`gen${node.type}`];
    if (!method) throw new Error(`Codegen: unsupported node type ${node.type}`);
    return method.call(this, node);
  }

  genProgram(node) {
    return node.body
      .map((stmt) => this.generate(stmt))
      .filter(Boolean)
      .join("\n");
  }

  genVariableDeclaration(node) {
    const init = node.init ? ` = ${this.generate(node.init)}` : "";
    return `${node.kind} ${node.id.name}${init};`;
  }

  genNumericLiteral(node) {
    return node.value.toString();
  }

  genStringLiteral(node) {
    // escape mínimo de comillas
    return `"${String(node.value).replace(/"/g, '\\"')}"`;
  }

  genBooleanLiteral(node) {
    return node.value ? "true" : "false";
  }

  genIdentifier(node) {
    return node.name;
  }

  genBinaryExpression(node) {
    const left = this.generate(node.left);
    const right = this.generate(node.right);
    return `(${left} ${node.operator} ${right})`;
  }

  genFunctionDeclaration(node) {
    const params = node.params.map((p) => p.name).join(", ");
    const body = node.body
      .map((stmt) => this.generate(stmt))
      .filter(Boolean)
      .join("\n");
    return `function ${node.name.name}(${params}) {\n${body}\n}`;
  }

  genReturnStatement(node) {
    return `return ${this.generate(node.argument)};`;
  }

  genExpressionStatement(node) {
    return this.generate(node.expression) + ";";
  }

  genCallExpression(node) {
    const callee = this.generate(node.callee);
    const args = node.arguments.map((a) => this.generate(a)).join(", ");
    return `${callee}(${args})`;
  }

  genMemberExpression(node) {
    const obj = this.generate(node.object);
    const prop = this.generate(node.property);
    return `${obj}.${prop}`;
  }

  genIfStatement(node) {
    const test = this.generate(node.test);
    const consequent = node.consequent
      .map((s) => this.generate(s))
      .filter(Boolean)
      .join("\n");
    let code = `if (${test}) {\n${consequent}\n}`;
    if (node.alternate) {
      const alternate = node.alternate
        .map((s) => this.generate(s))
        .filter(Boolean)
        .join("\n");
      code += ` else {\n${alternate}\n}`;
    }
    return code;
  }

  // UNARY
  genUnaryExpression(node) {
    const arg = this.generate(node.argument);
    return `${node.operator}${arg}`;
  }

  // OBJECT LITERAL
  genObjectLiteral(node) {
    // node.properties: [{ key, value }]
    const parts = node.properties.map(
      (p) => `${p.key}: ${this.generate(p.value)}`
    );
    return `{ ${parts.join(", ")} }`;
  }

  // INTERFACES - no tienen representación en JS, ignorarlas (pero comentar)
  genInterfaceDeclaration(node) {
    return `/* interface ${node.name.name} (removed in JS) */`;
  }
}
