const readline = require('readline');
const { MalSymbol, Str, List, Vector, Hashmap, Fn, Nil } = require('./types');
const Env = require('./env');
const core = require('./core');

const { read_str } = require('./reader');
const { pr_str } = require('./printer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = new Env();
for (const [symbol, val] of Object.entries(core)) {
  env.set(new MalSymbol(symbol), val);
}
env.set(new MalSymbol("*ARGV*"), new List([]));

env.set(new MalSymbol("eval"), (ast) => {
  return EVAL(ast, env);
})

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
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
  while (true) {    
    if (!(ast instanceof List)) {
      return eval_ast(ast, env)
    }

    if (ast.isEmpty()) {
      return ast;
    }

    let firstElement = ast.ast[0].symbol;

    if (firstElement === "def!") {
      if (ast.ast.length != 3) {
        throw "Incorrect number of arguments to def!";
      }
      const val = EVAL(ast.ast[2], env);
      return env.set(ast.ast[1], val);
    }

    if (firstElement === "let*") {
      if (ast.ast.length != 3) {
        throw "Incorrect number of arguments to let*";
      }
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;
      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      env = newEnv;
      ast = ast.ast[2];
      continue;
    }

    if (firstElement === "do") {
      ast.ast.slice(1, -1).forEach((form) => EVAL(form, env));
      ast = ast.ast[ast.ast.length - 1];
      continue;
    }

    if (firstElement === "if") {
      const expr = EVAL(ast.ast[1], env);
      if ((expr === Nil) || expr === false) {
        ast = ast.ast[3];
      } else {
        ast = ast.ast[2];
      }
      continue;
    }

    if (firstElement === "fn*") {
      const fn = (...args) => {
        const newEnv = Env.createEnv(env, ast.ast[1].ast, args);
        return EVAL(ast.ast[2], newEnv);
      }
      return new Fn(ast.ast[1].ast, ast.ast[2], env, fn);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof Fn) {
      ast = fn.fnBody;
      env = Env.createEnv(fn.env, fn.binds, args);
      continue;
    }
    
    if (fn instanceof Function) {
      return fn.apply(null, args);
    }

    throw `${fn} not a function`;
  }
};

const PRINT = (val) => pr_str(val,true);

const rep = (str) => PRINT(EVAL(READ(str), env));

rep("(def! not (fn* [x] (if x false true)))");
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

const main = (args) => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (e) {
      if (e.name !== 'CommentError') {
        console.log(e);
      }
    } finally {
      main();
    }
  });
}

if (process.argv.length >= 3) {
  const args = Array.from(process.argv).slice(3);
  const malArgs = new List(args.map(x => new Str(x)));
  env.set(new MalSymbol("*ARGV*"), malArgs);
  const code = "(load-file \"" + process.argv[2] + "\")";

  rep(code);
  rl.close();
  process.exit(0);
}

main(process.argv);