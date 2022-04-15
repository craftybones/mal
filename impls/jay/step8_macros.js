const readline = require('readline');
const { MalSymbol, Str, List, Vector, Hashmap, Fn, Nil } = require('./types');
const Env = require('./env');
const core = require('./core');

const { read_str, prependSymbol } = require('./reader');
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

const quasiquote = (ast) => {
  if (ast instanceof List && ast.beginsWith("unquote")) {
    return ast.ast[1];
  }
  
  if (ast instanceof List) {
    let result = new List([]);
    for (let i = ast.ast.length - 1; i >= 0; i--) {
      const elt = ast.ast[i];
      if ((elt instanceof List) && elt.beginsWith("splice-unquote")) {
        result = new List([new MalSymbol("concat"),elt.ast[1],result])
      } else {
        result = new List([new MalSymbol("cons"),quasiquote(elt),result])
      }
    }
    return result;
  }

  if (ast instanceof Vector) {
    let result = new List([]);
    for (let i = ast.ast.length - 1; i >= 0; i--) {
      const elt = ast.ast[i];
      if ((elt instanceof List) && elt.beginsWith("splice-unquote")) {
        result = new List([new MalSymbol("concat"),elt.ast[1],result])
      } else {
        result = new List([new MalSymbol("cons"),quasiquote(elt),result])
      }
    }
    return new List([new MalSymbol("vec"), result]);
  }
  
  if ((ast instanceof MalSymbol) || (ast instanceof Hashmap)) {
    return new List([new MalSymbol("quote"),ast]);
  }
  return ast;
}

const is_macro_call = (ast, env) => {
  if (!(ast instanceof List)) return false;

  const elt = ast.ast[0]
  return (elt instanceof MalSymbol) && env.find(elt) && (env.get(elt) instanceof Fn) && env.get(elt).isMacro;
}

const macroExpand = (ast, env) => {
  while (is_macro_call(ast, env)) {
    const macro = env.get(ast.ast[0]);
    ast = macro.apply(ast.ast.slice(1));
  }
  return ast;
}

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  while (true) {
    ast = macroExpand(ast, env);

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

    if (firstElement === "defmacro!") {
      if (ast.ast.length != 3) {
        throw "Incorrect number of arguments to defmacro!";
      }
      const val = EVAL(ast.ast[2], env);
      val.isMacro = true;
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
        ast = ast.ast.length==4?ast.ast[3]:Nil;
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

    if (firstElement === "quote") {
      return ast.ast[1];
    }

    if (firstElement === "quasiquoteexpand") {
      return quasiquote(ast.ast[1]);
    }

    if (firstElement === "quasiquote") {
      ast = quasiquote(ast.ast[1]);
      continue;
    }

    if (firstElement === "macroexpand") {
      return macroExpand(ast.ast[1], env);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof Fn) {
      ast = fn.fnBody;
      env = Env.createEnv(fn.env, fn.binds, args);
      continue;
    }
    
    if (fn instanceof Function) {
      return fn.apply(null, args)
    }

    throw `${fn} not a function`;
  }
};

const PRINT = (val) => {
  return pr_str(val, true)
};

const rep = (str) => PRINT(EVAL(READ(str), env));

rep("(def! not (fn* [x] (if x false true)))");
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');
rep(`(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw "odd number of forms to cond")) (cons 'cond (rest (rest xs)))))))`
)
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
