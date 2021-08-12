const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (str) => str;
const EVAL = (ast, env) => ast;
const PRINT = (str) => str;

const rep = (str) => PRINT(EVAL(READ(str), {}));

const loop = () => {
  rl.question("user> ", (str) => {
    console.log(rep(str));
    loop();
  });
}

loop();