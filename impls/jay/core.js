const Env = require('./env');
const { List, Symbol, Fn, Nil, Str } = require('./types');
const { pr_str } = require('./printer');

const core = new Env(null);

core.set(new Symbol("+"), new Fn((a,b) => a+b));
core.set(new Symbol("*"), new Fn((a,b) => a*b));
core.set(new Symbol("-"), new Fn((a,b) => a-b));
core.set(new Symbol("/"), new Fn((a,b) => a/b));

core.set(new Symbol("prn"), new Fn(function (...x) {
  const stringValues = x.map(pr_str);
  console.log(stringValues.join(" "));
  return new Nil();
}));

core.set(new Symbol("println"), new Fn(function (...x) {
  const stringValues = x.map(pr_str);
  console.log(stringValues.join(" "));
  return new Nil();
}));

core.set(new Symbol("pr-str"), new Fn(function (...x) {
  const stringValues = x.map(pr_str);
  return new Str(stringValues.join(" "));
}));

core.set(new Symbol("str"), new Fn(function (...x) {
  const stringValues = x.map(pr_str);
  return new Str(stringValues.join(""));
}));

core.set(new Symbol("list"), new Fn(function (...elements) {
  return new List(elements);
}));

core.set(new Symbol("list?"), new Fn((x) => x instanceof List));
core.set(new Symbol("empty?"), new Fn((x) => {
  return x.isEmpty();
}));

core.set(new Symbol("count"), new Fn((x) => {
  return x.count();
}));

core.set(new Symbol("="), new Fn((a,b) => {
  return a===b;
}));

core.set(new Symbol("<="), new Fn((a, b) => {
  return a<=b;
}));

core.set(new Symbol(">="), new Fn((a, b) => {
  return a>=b;
}));

core.set(new Symbol("<"), new Fn((a, b) => {
  return a<b;
}));

core.set(new Symbol(">"), new Fn((a, b) => {
  return a>b;
}));

module.exports = core;