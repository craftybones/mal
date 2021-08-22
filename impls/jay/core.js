const { pr_str } = require('./printer');
const { Nil, Str, List, eql } = require('./types');

module.exports = {
  "+": (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (...args) => {
    if (args.length == 1) {
      args.unshift(0);
    }
    return args.reduce((a, b) => a - b);
  },
  '/': (...args) => {
    if (args.length == 1) {
      args.unshift(1);
    }
    return args.reduce((a, b) => a / b);
  },
  '=': (a, b) => {
    return eql(a,b);
  },
  'empty?': (a) => {
    return a.isEmpty();
  },
  'count': (a) => {
    return a.count();
  },
  'list': (...args) => {    
    return new List(args);
  },
  'list?': (a) => {    
    return a instanceof List;
  },
  '<': (a, b) => {
    return a < b;
  },
  '<=': (a, b) => {
    return a <= b;
  },
  '>': (a, b) => {
    return a > b;
  },
  '>=': (a, b) => {
    return a >= b;
  },
  'pr-str': (...args) => {
    return pr_str(new Str(args.map(x => pr_str(x, true)).join(" ")), true)
  },
  'str': (...args) => {
    return new Str(args.map(x => pr_str(x, false)).join(""));
  },
}

