var AssertException, assert;

AssertException = (function() {

  function AssertException(message) {
    this.message = message;
  }

  AssertException.prototype.toString = function() {
    return 'AssertException: ' + this.message;
  };

  return AssertException;

})();

assert = function(conditionalExpression, message) {
  if (!conditionalExpression) throw new AssertException(message);
};
