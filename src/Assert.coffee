class AssertException
	constructor: (@message) ->
	toString: -> 'AssertException: ' + this.message

assert = (conditionalExpression, message) ->
	if !conditionalExpression
		throw new AssertException message