const readline = require('readline');
const { MalSymbol, List, Vector, Hashmap } = require('./types');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = {
  '+': (...args) => args.reduce((a,b)=>a+b,0),
  '*': (...args) => args.reduce((a,b)=>a*b,1),
  '*': (a, b) => a * b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  'empty?': (x) => x.isEmpty(),
  'pi': Math.PI
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const val = env[ast.symbol];
    if (val) {
      return val;
    }
    throw `'${ast.symbol}' symbol not found`;
  }

  if (ast instanceof Vector) {
    return new Vector(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof List) {
    return new List(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof Hashmap) {
    const hashmap = ast.hashmap;
    const newHashMap = new Map();
    for (const [key, value] of hashmap.entries()) {
      newHashMap.set(key,EVAL(value,env))
    }
    return new Hashmap(newHashMap);
  }

  return ast;
}

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env)
  }

  if (ast.isEmpty()) {
    return ast;
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  
  if (fn instanceof Function) {
    return fn.apply(null, args);
  }

  throw `${fn} is not a function`;
};
const PRINT = (val) => pr_str(val,true);

const rep = (str) => PRINT(EVAL(READ(str), env));

const main = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
}

main();