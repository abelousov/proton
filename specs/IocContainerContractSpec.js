var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

describe('IocContainerContract', function() {
  var CheckedIocContainer, checker, expectAssertFail, iocContainer;
  expectAssertFail = function(assertionMessage, func) {
    return expect(func).toThrow(new AssertException(assertionMessage));
  };
  CheckedIocContainer = (function(_super) {

    __extends(CheckedIocContainer, _super);

    function CheckedIocContainer() {
      CheckedIocContainer.__super__.constructor.apply(this, arguments);
    }

    return CheckedIocContainer;

  })(IocContainer);
  checker = new IocContainerContract;
  checker.applyToIocContainerPrototype(CheckedIocContainer);
  iocContainer = null;
  beforeEach(function() {
    return iocContainer = new CheckedIocContainer;
  });
  describe('setSchema', function() {
    it('checks that schema is not empty', function() {
      expectAssertFail('Dependency schema should be given', function() {
        return iocContainer.setSchema(null);
      });
      expectAssertFail('Dependency schema should be given', function() {
        return iocContainer.setSchema(void 0);
      });
      return expectAssertFail('Dependency schema should be non-empty', function() {
        return iocContainer.setSchema({});
      });
    });
    return describe('it checks each instance in schema', function() {
      var assertInvalidSchema, itThrowsOnInvalidSchema;
      assertInvalidSchema = function(assertMessage, invalidSchema) {
        var completeMessage;
        completeMessage = 'invalid instance \'foo\': ' + assertMessage;
        return expectAssertFail(completeMessage, function() {
          return iocContainer.setSchema(invalidSchema);
        });
      };
      itThrowsOnInvalidSchema = function(specDescription, assertMessage, invalidSchema) {
        return it(specDescription, function() {
          return assertInvalidSchema(assertMessage, invalidSchema);
        });
      };
      itThrowsOnInvalidSchema('should have only one type', 'has several types: single, factoryFunction', {
        foo: {
          single: function() {},
          factoryFunction: function() {}
        }
      });
      itThrowsOnInvalidSchema('should have contents', 'contents not set', {
        foo: null
      });
      itThrowsOnInvalidSchema('type should be given', 'has no type', {
        foo: {}
      });
      itThrowsOnInvalidSchema("source should be set", "source is undefined or null", {
        foo: {
          single: null
        }
      });
      itThrowsOnInvalidSchema('source for \'single\' should be function', 'source for \'single\' should be function', {
        foo: {
          single: {}
        }
      });
      itThrowsOnInvalidSchema('source for \'factoryFunction\' should be function', 'source for \'factoryFunction\' should be function', {
        foo: {
          factoryFunction: {}
        }
      });
      itThrowsOnInvalidSchema('should have only allowed fields', "unknown fields: bar, baz. allowed fields: single, ref, factoryFunction, deps", {
        foo: {
          single: function() {},
          bar: null,
          baz: {}
        }
      });
      it('deps should be non-empty dictionary', function() {
        var invalidDeps, _i, _len, _ref, _results;
        _ref = [void 0, null, 'invalid', {}];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalidDeps = _ref[_i];
          _results.push((function(invalidDeps) {
            var typeofDeps;
            typeofDeps = invalidDeps === null ? 'null' : typeof invalidDeps;
            return assertInvalidSchema("deps should be non-empty dictionary, " + typeofDeps + " given", {
              foo: {
                single: function() {},
                deps: invalidDeps
              }
            });
          })(invalidDeps));
        }
        return _results;
      });
      return it('each dependency should be a string name of other instance in schema', function() {
        var invalidDep, _fn, _i, _len, _ref;
        _ref = [null, {}];
        _fn = function(invalidDep) {
          return assertInvalidSchema("dependency 'barProperty' should be a string", {
            foo: {
              single: function() {},
              deps: {
                barProperty: invalidDep
              }
            }
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalidDep = _ref[_i];
          _fn(invalidDep);
        }
        return assertInvalidSchema("dependency 'barProperty': schema doesn't have instance 'bar'", {
          foo: {
            single: function() {},
            deps: {
              barProperty: 'bar'
            }
          }
        });
      });
    });
  });
  return describe('getInstance', function() {
    return it('checks that schema is set and contains instance', function() {
      expectAssertFail('Dependency schema is not set', function() {
        return iocContainer.getInstance('foo');
      });
      iocContainer.setSchema({
        bar: {
          single: function() {}
        }
      });
      return expectAssertFail('Instance \'foo\' not found in dependency schema', function() {
        return iocContainer.getInstance('foo');
      });
    });
  });
});
