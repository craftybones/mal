const readline = require("readline");
const read_str = require("./reader");
const { pr_str } = require("./printer");
const { List, Vector, Nil, Symbol, Str, HashMap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    const val = env[ast.symbol];
    if (val === undefined) {
      throw "symbol not defined";
    }
    return val;
  }

  if (ast instanceof List) {
    const newList = ast.ast.map(x => EVAL(x, env));
    return new List(newList);
  }

  if (ast instanceof Vector) {
    const newList = ast.ast.map(x => EVAL(x, env));
    return new Vector(newList);
  }

  if (ast instanceof HashMap) {
    const newList = [];
    for ([k,v] of ast.hashmap.entries()) {
      newList.push(EVAL(k, env));
      newList.push(EVAL(v, env));
    }
    return new HashMap(newList);
  }

  return ast;
};

const READ = (str) => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  const newList = eval_ast(ast, env);
  
  const fn = newList.ast[0];
  return fn.apply(null, newList.ast.slice(1));
};

const PRINT = (ast) => pr_str(ast);

const env = {
  "+": (a,b) => a+b,
  "-": (a,b) => a-b,
  "*": (a,b) => a*b,
  "/": (a, b) => a / b,
  "pi": Math.PI
}

const rep = (str) => PRINT(EVAL(READ(str), env));

const loop = () => {
  rl.question("user> ", (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      loop();
    }
  });
}

loop();