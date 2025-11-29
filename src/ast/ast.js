export const Program = (body = []) => ({ type: "Program", body });

export const VariableDeclaration = (kind, id, varType = null, init = null) => ({
  type: "VariableDeclaration",
  kind,
  id,
  varType,
  init,
});

export const Identifier = (name) => ({ type: "Identifier", name });

export const NumericLiteral = (value) => ({
  type: "NumericLiteral",
  value,
});

export const StringLiteral = (value) => ({
  type: "StringLiteral",
  value,
});

export const BooleanLiteral = (value) => ({
  type: "BooleanLiteral",
  value,
});

export const ExpressionStatement = (expression) => ({
  type: "ExpressionStatement",
  expression,
});

export const ReturnStatement = (argument) => ({
  type: "ReturnStatement",
  argument,
});

export const FunctionDeclaration = (name, params, returnType, body) => ({
  type: "FunctionDeclaration",
  name,
  params,
  returnType,
  body,
});

export const IfStatement = (test, consequent, alternate = null) => ({
  type: "IfStatement",
  test,
  consequent,
  alternate,
});

export const InterfaceDeclaration = (name, properties) => ({
  type: "InterfaceDeclaration",
  name,
  properties, // [{ key, type }]
});

// OBJETOS: { a: 1, b: "x" }
export const ObjectLiteral = (properties) => ({
  type: "ObjectLiteral",
  properties, // [{ key, value }]
});
