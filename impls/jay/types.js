class List {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "(" + this.ast.map(x=>x.toString()).join(" ") + ")";
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "[" + this.ast.map(x=>x.toString()).join(" ") + "]";
  }
}

class HashMap {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "{" + this.ast.map(x=>x.toString()).join(" ") + "}";
  }
}

class Nil {
  toString() {
    return "nil";
  }
}

class Str {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return '"' + this.str + '"';
  }
}

class Symbol {
  constructor(symbol) {
    this.symbol = symbol;
  }

  toString() {
    return this.symbol.toString();
  }
}

module.exports = { List, Vector, Nil, Symbol, Str, HashMap };