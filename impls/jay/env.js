const { MalSymbol,Nil,List,eql } = require('./types');

class Env {
  constructor(outer=null) {
    this.data = new Map();
    this.outer = outer;
  }

  set(key, malValue) {
    if (!(key instanceof MalSymbol)) {
      throw `${key} not symbol`;
    }
    this.data.set(key.symbol, malValue);
    return malValue;
  }

  find(key) {
    if (this.data.has(key.symbol)) {
      return this;
    }

    return this.outer && this.outer.find(key);
  }

  get(key) {
    const env = this.find(key);
    
    if (env === null) {
      throw `${key.symbol} not found`
    }

    return env.data.get(key.symbol);
  }

  static createEnv(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);
    const ampersand = new MalSymbol("&");
    for (let i = 0; i < binds.length; i++) {
      if (eql(binds[i], ampersand)) {
        const rest = exprs.slice(i);
        env.set(binds[i + 1], rest.length === 0?Nil:new List(rest));
        return env;
      }
      env.set(binds[i], exprs[i]);
    }
    return env;
  }
}

module.exports = Env;