const pr_str = (value) => {
  if (value instanceof Function) {
    return "#<function>";
  }
  return value.toString();
}

module.exports = { pr_str };