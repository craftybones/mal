const { pr_str } = require('./printer');
const { Nil, Str, List, eql, Atom, Vector, MalSequence } = require('./types');
const { read_str } = require('./reader');
const fs = require('fs');

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
    if (!(a instanceof MalSequence)) {
      return 0;
    }
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
  'println': (...args) => {
    const str = args.map(x => pr_str(x, false)).join(" ");
    console.log(str);
    return Nil;
  },
  'prn': (...args) => {
    const str = args.map(x => pr_str(x, true)).join(" ");
    console.log(str);
    return Nil;
  },
  'str': (...args) => {
    return new Str(args.map(x => pr_str(x, false)).join(""));
  },  
  'read-string': (str) => {
    return read_str(str.string);
  },  
  'slurp': (filename) => {
    return new Str(fs.readFileSync(filename.string,"utf8"));
  },
  'atom': (val) => {
    return new Atom(val);
  },
  'atom?': (atom) => {
    return atom instanceof Atom;
  },
  'deref': (atom) => {
    return atom.deref();
  },
  'reset!': (atom,newVal) => {
    return atom.reset(newVal);
  },
  'swap!': (atom,f,...args) => {
    return atom.swap(f,args);
  },
  'cons': (element, seq) => {
    return seq.cons(element);
  },
  'concat': (...lists) => {
    const list = new List([]);
    return lists.reduce((a,b)=>a.concat(b),list);
  },
  'vec': (seq) => {
    return new Vector([...seq.ast]);
  }
}

