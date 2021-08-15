class Env {
  constructor(outer,binds=[],exprs=[]) {
    this.outer = outer;
    this.data = {};

    binds.forEach((symbol, index) => {
      this.set(symbol, exprs[index]);
    })
  }

  set(key, value) {
    this.data[key.symbol] = value;
    return value;
  }

  find(key) {
    if (key in this.data) {
      return this;
    }

    if (!this.outer) {
      return null;
    }

    return this.outer.find(key);
  }

  get(key) {
    const symbol = key.symbol;
    const env = this.find(symbol);
    if (!env) {
      throw `'${symbol}' not found`;
    }
    return env.data[symbol];
  }
}

module.exports = Env;