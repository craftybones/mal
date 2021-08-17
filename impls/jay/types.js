const Env = require('./env');

class List {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "(" + this.ast.map(x=>x.toString()).join(" ") + ")";
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "[" + this.ast.map(x=>x.toString()).join(" ") + "]";
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }
}

class HashMap {
  constructor(ast) {
    this.hashmap = new Map();
    for (let i = 0; i < ast.length; i += 2) {
      this.hashmap.set(ast[i], ast[i + 1]);
    }
  }

  toString() {
    let str = "";
    let separator = "";
    for (let [k, v] of this.hashmap.entries()) {
      str += separator + k.toString();
      str += " ";
      str += v.toString();
      separator = " ";
    }
    return "{" + str + "}";
  }

  isEmpty() {
    return this.hashmap.size == 0;
  }

  count() {
    return this.hashmap.size;
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

class Keyword {
  constructor(keyword) {
    this.keyword = keyword;
  }

  toString() {
    return ":" + this.keyword.toString();
  }
}

class Fn {
  constructor(fnBody,binds,env) {
    this.fnBody = fnBody;
    this.binds = binds;
    this.env = env;
  }

  toString() {
    return "#<function>";
  }

  genEnv(args) {
    return new Env(this.env, this.binds, args);
  }
}

module.exports = { List, Vector, Nil, Symbol, Str, HashMap, Keyword, Fn };