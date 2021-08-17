const readline = require("readline");
const read_str = require("./reader");
const { pr_str } = require("./printer");
const { List, Vector, Nil, Symbol, Str, HashMap, Fn } = require('./types');

const Env = require('./env');
const core = require('./core');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const eval_ast = (ast, env) => {
  if (ast === undefined) {
    return new Nil();
  }

  if (ast instanceof Symbol) {
    return env.get(ast);
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
  while (true) {
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    switch (ast.ast[0].symbol) {
      case "def!": return env.set(ast.ast[1], EVAL(ast.ast[2], env));
      case "let*":
        const newEnv = new Env(env);
        const bindings = ast.ast[1].ast;
        for (let i = 0; i < bindings.length; i += 2) {
          newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
        }
        env = newEnv;
        ast = ast.ast[2];
        break;
        //return EVAL(ast.ast[2], newEnv);
      case "if":
        const resultOfCondition = EVAL(ast.ast[1], env);
        if (resultOfCondition === false || resultOfCondition instanceof Nil) {
          ast = ast.ast[3];
        } else {
          ast = ast.ast[2];
        }
        break;
      case "do":
        ast.ast.slice(1, -1).forEach((expr) => {
          EVAL(expr, env);
        });
        ast = ast.ast[ast.ast.length - 1];
        break;
      case "fn*":
        const binds = ast.ast[1].ast;
        const fnBody = ast.ast[2];
        return new Fn(fnBody,binds,env);
      default:
        const newList = eval_ast(ast, env);
        const fnToCall = newList.ast[0];
        if (fnToCall instanceof Fn) {
          ast = fnToCall.fnBody;
          env = fnToCall.genEnv(newList.ast.slice(1));
        } else {
          return fnToCall.apply(null, newList.ast.slice(1));
        }
        // return fnToCall.apply(newList.ast.slice(1));
    }
  }

};

const PRINT = (ast) => pr_str(ast);

const env = new Env(core);

const rep = (str) => PRINT(EVAL(READ(str), env));

rep("(def! not (fn* (a) (if a false true)))");

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