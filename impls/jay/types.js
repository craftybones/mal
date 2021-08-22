class MalValue {
  pr_str(print_readably=false) {
    return "---default mal val---";
  }

  eql(other) {
    return other === this;
  }
}

const pr_str = (val,print_readably=false) => {
  if (val instanceof MalValue) {
    return val.pr_str(print_readably);
  }

  if (val instanceof Function) {
    return "#<function>";
  }
  
  return val.toString();
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably=false) {
    return "(" + this.ast.map(x=>pr_str(x,print_readably)).join(" ") + ")";
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }

  eql(other) {
    if (!((other instanceof List) || (other instanceof Vector))) {
      return false;
    }

    if (this.count() !== other.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i++) {
      if (!eql(this.ast[i], other.ast[i])) {
        return false;
      }
    }

    return true;
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }
  
  pr_str(print_readably=false) {
    return "[" + this.ast.map(pr_str).join(" ") + "]";
  }

  eql(other) {
    if (!((other instanceof List) || (other instanceof Vector))) {
      return false;
    }

    if (this.count() !== other.count()) {
      return false;
    }

    for (let i = 0; i < this.count(); i++) {
      if (!eql(this.ast[i], other.ast[i])) {
        return false;
      }
    }

    return true;
  }
}

class Hashmap extends MalValue {
  constructor(hashmap) {
    super();
    this.hashmap = hashmap;
  }

  pr_str(print_readably = false) {
    let str = "";
    let separator = "";
    for (const [key,value] of this.hashmap.entries()) {
      str = str + separator + pr_str(key, print_readably) + " " + pr_str(value, print_readably);
      separator = " ";
    }
    return "{" + str + "}";
  }
}

class NilVal extends MalValue {
  constructor() {
    super();
  }

  pr_str(print_readably=false) {
    return "nil";
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  pr_str(print_readably = false) {
    if (print_readably) {
      return '"' + this.string
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return '"' + this.string + '"';
  }

  eql(other) {
    return (other instanceof Str) && this.string === other.string;
  }
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  pr_str(print_readably=false) {
    return ':' + this.keyword;
  }

  eql(other) {
    return (other instanceof Keyword) && this.keyword === other.keyword;
  }

}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(print_readably=false) {
    return this.symbol;
  }

  eql(other) {
    return (other instanceof MalSymbol) && this.symbol === other.symbol;
  }

}

class Fn extends MalValue {
  constructor(binds, fnBody, env) {
    super();
    this.binds = binds;
    this.fnBody = fnBody;
    this.env = env;
  }

  pr_str(print_readably = false) {
    return "#<function>";
  }
}

const Nil = new NilVal();

const eql = (a, b) => {
  if ((a instanceof MalValue) && (b instanceof MalValue)) {
    return a.eql(b);
  }
  return a === b;
}

module.exports = {
  MalValue, List, Vector, Str, Nil, Keyword, MalSymbol, Hashmap, Fn, pr_str, eql
}