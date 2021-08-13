const readline = require("readline");
const read_str = require("./reader");
const { pr_str } = require("./printer");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (str) => read_str(str);
const EVAL = (ast, env) => ast;
const PRINT = (ast) => pr_str(ast);

const rep = (str) => PRINT(EVAL(READ(str), {}));

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