
describe('IocContainer', function() {
  var iocContainer;
  iocContainer = null;
  beforeEach(function() {
    return iocContainer = new IocContainer;
  });
  it('sets dependency schema with setSchema() and gives instances by their names with getInstance()', function() {
    var Foo, foo1;
    Foo = (function() {

      function Foo() {
        this.name = 'Foo';
      }

      return Foo;

    })();
    iocContainer.setSchema({
      fooInstance: {
        single: Foo
      }
    });
    foo1 = iocContainer.getInstance('fooInstance');
    return expect(foo1.name).toEqual('Foo');
  });
  describe("instance type can be: single, ref, factoryFunction", function() {
    it('single: returns the only instance of given class; doesn\'t accept parameters', function() {
      var Foo, foo1, foo2;
      Foo = (function() {

        function Foo() {}

        return Foo;

      })();
      iocContainer.setSchema({
        fooInstance: {
          single: Foo
        }
      });
      foo1 = iocContainer.getInstance('fooInstance');
      foo2 = iocContainer.getInstance('fooInstance');
      return expect(foo2).toBe(foo1);
    });
    it('multiple: returns new instance for each call; doesn\'t accept parameters', function() {
      var Foo, foo1, foo2;
      Foo = (function() {

        function Foo() {}

        return Foo;

      })();
      iocContainer.setSchema({
        fooInstance: {
          multiple: Foo
        }
      });
      foo1 = iocContainer.getInstance('fooInstance');
      foo2 = iocContainer.getInstance('fooInstance');
      return expect(foo2).not.toBe(foo1);
    });
    it('ref: gets existing object by direct reference', function() {
      var foo;
      foo = {};
      iocContainer.setSchema({
        fooInstance: {
          ref: foo
        }
      });
      return expect(iocContainer.getInstance('fooInstance')).toBe(foo);
    });
    return it('factoryFunction: returns function to create new objects accepting any parameters', function() {
      var Foo, foo1, foo2, fooFactory;
      Foo = (function() {

        function Foo(name) {
          this.name = name;
        }

        return Foo;

      })();
      iocContainer.setSchema({
        fooFactory: {
          factoryFunction: Foo
        }
      });
      fooFactory = iocContainer.getInstance('fooFactory');
      foo1 = fooFactory('foo1');
      expect(foo1.name).toEqual('foo1');
      foo2 = fooFactory('foo2');
      expect(foo2).not.toBe(foo1);
      return expect(foo2.name).toEqual('foo2');
    });
  });
  return describe('dependencies are set with field "deps"', function() {
    it('fills instance dependencies with other schema instances using their names in schema', function() {
      var fooInstance;
      iocContainer.setSchema({
        fooInstance: {
          single: function() {},
          deps: {
            'barProperty': 'barInstance'
          }
        },
        barInstance: {
          ref: {}
        }
      });
      fooInstance = iocContainer.getInstance('fooInstance');
      return expect(fooInstance.barProperty).toBe(iocContainer.getInstance('barInstance'));
    });
    return it('for factoryFunction, dependencies are added to resulting objects, not to factory function', function() {
      var Foo, baz, foo1, fooFactory;
      Foo = (function() {

        function Foo() {}

        return Foo;

      })();
      baz = 'baz';
      iocContainer.setSchema({
        fooFactory: {
          factoryFunction: Foo,
          deps: {
            bazDependency: 'bazRef'
          }
        },
        bazRef: {
          ref: baz
        }
      });
      fooFactory = iocContainer.getInstance('fooFactory');
      foo1 = fooFactory('foo1');
      expect(foo1.bazDependency).toBe(baz);
      return expect(fooFactory.bazDependency).toBeUndefined();
    });
  });
});
