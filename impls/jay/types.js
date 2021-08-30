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

class MalSequence extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_seq(print_readably = false, brackets = ['(', ')']) {
    const [opening, closing] = brackets;
    return opening + this.ast.map(x=>pr_str(x,print_readably)).join(" ") + closing;
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return this.ast.length;
  }

  eql(other) {
    if (!(other instanceof MalSequence)) {
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

  beginsWith(symbol) {
    return !this.isEmpty() && (this.ast[0].symbol === symbol);
  }
}

class List extends MalSequence {
  pr_str(print_readably = false) {
    return this.pr_seq(print_readably);
  }
}

class Vector extends MalSequence {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably=false) {
    return this.pr_seq(print_readably,['[',']']);
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
    return this.string;
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
  constructor(binds, fnBody, env, fn) {
    super();
    this.binds = binds;
    this.fnBody = fnBody;
    this.env = env;
    this.fn = fn;
  }

  pr_str(print_readably = false) {
    return "#<function>";
  }
}

const Nil = new NilVal();

class Atom extends MalValue {
  constructor(val) {
    super();
    this.val = val;
  }

  deref() {
    return this.val;
  }

  pr_str(print_readably = false) {
    return "(atom " + pr_str(this.val, print_readably) + ")";
  }

  reset(newVal) {
    this.val = newVal;
    return this.val;
  }

  swap(fn, args) {
    let actualFn = fn;
    if (fn instanceof Fn) {
      actualFn = fn.fn;
    }
    this.val = actualFn.apply(null, [this.val].concat(args));
    return this.val;
  }
}

const eql = (a, b) => {
  if ((a instanceof MalValue) && (b instanceof MalValue)) {
    return a.eql(b);
  }
  return a === b;
}

module.exports = {
  MalValue, MalSequence, List, Vector, Str, Nil, Keyword, MalSymbol, Hashmap, Fn, Atom, pr_str, eql
}