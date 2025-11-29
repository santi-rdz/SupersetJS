export class SymbolTable {
  constructor(parent = null) {
    this.parent = parent;
    this.table = new Map();
  }

  define(name, info) {
    if (this.table.has(name)) {
      throw new Error(`Semantic error: '${name}' is already declared.`);
    }
    this.table.set(name, info);
  }

  lookup(name) {
    if (this.table.has(name)) return this.table.get(name);
    if (this.parent) return this.parent.lookup(name);
    throw new Error(`Semantic error: '${name}' is not defined.`);
  }

  has(name) {
    return this.table.has(name) || (this.parent && this.parent.has(name));
  }

  update(name, info) {
    if (this.table.has(name)) this.table.set(name, info);
    else if (this.parent) this.parent.update(name, info);
    else throw new Error(`Cannot update '${name}' – not defined.`);
  }
}
