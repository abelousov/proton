var IocContainerContract,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

IocContainerContract = (function() {
  var _schemaInstanceChecker;

  function IocContainerContract() {}

  IocContainerContract.prototype.applyToIocContainerPrototype = function(iocContainerPrototype) {
    var methodName, _i, _len, _ref, _results;
    _ref = this._getCheckedMethodNames();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      methodName = _ref[_i];
      _results.push(this._addCheck(iocContainerPrototype, methodName));
    }
    return _results;
  };

  IocContainerContract.prototype._addCheck = function(checkedPrototype, methodName) {
    var contract, decoratedMethod;
    decoratedMethod = checkedPrototype.prototype[methodName];
    contract = this;
    return checkedPrototype.prototype[methodName] = function() {
      var arg, argsArrayToConcat, checkedObject;
      checkedObject = this;
      argsArrayToConcat = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          _results.push(arg);
        }
        return _results;
      }).apply(this, arguments);
      contract[methodName].apply(contract, [checkedObject].concat(argsArrayToConcat));
      return decoratedMethod.apply(checkedObject, arguments);
    };
  };

  IocContainerContract.prototype._getCheckedMethodNames = function() {
    return ['setSchema', 'getInstance'];
  };

  IocContainerContract.prototype.setSchema = function(iocContainer, schema) {
    this._schemaShouldBeNonEmpty(schema);
    return this._checkEachInstanceData(schema);
  };

  IocContainerContract.prototype.getInstance = function(iocContainer, instanceName) {
    var rawInstanceData;
    assert(iocContainer._schema != null, 'Dependency schema is not set');
    rawInstanceData = iocContainer._schema[instanceName];
    return assert(rawInstanceData != null, 'Instance \'' + instanceName + '\' not found in dependency schema');
  };

  IocContainerContract.prototype._schemaShouldBeNonEmpty = function(schema) {
    var instanceName;
    assert(schema != null, 'Dependency schema should be given');
    return assert(((function() {
      var _results;
      _results = [];
      for (instanceName in schema) {
        _results.push(instanceName);
      }
      return _results;
    })()).length > 0, 'Dependency schema should be non-empty');
  };

  IocContainerContract.prototype._checkEachInstanceData = function(schema) {
    var instanceName, _results;
    _results = [];
    for (instanceName in schema) {
      _results.push((new _schemaInstanceChecker(instanceName, schema)).check());
    }
    return _results;
  };

  _schemaInstanceChecker = (function() {

    function _schemaInstanceChecker(instanceName, schema) {
      this.instanceName = instanceName;
      this.schema = schema;
      this.instanceDescription = this.schema[this.instanceName];
    }

    _schemaInstanceChecker.prototype._keySourceSingle = 'single';

    _schemaInstanceChecker.prototype._keySourceReference = 'ref';

    _schemaInstanceChecker.prototype._keySourceFactoryFunction = 'factoryFunction';

    _schemaInstanceChecker.prototype._keyDependencies = 'deps';

    _schemaInstanceChecker.prototype._getAllowedTypes = function() {
      return [this._keySourceSingle, this._keySourceReference, this._keySourceFactoryFunction];
    };

    _schemaInstanceChecker.prototype.check = function() {
      var instanceType;
      this._assertInstance(this.instanceDescription != null, 'contents not set');
      this._checkAllowedFields();
      instanceType = this._getAndCheckInstanceType();
      this._checkSource(instanceType);
      return this._checkDependencies();
    };

    _schemaInstanceChecker.prototype._getAndCheckInstanceType = function() {
      var instancePart, instanceTypes;
      instanceTypes = (function() {
        var _results;
        _results = [];
        for (instancePart in this.instanceDescription) {
          if (__indexOf.call(this._getAllowedTypes(), instancePart) >= 0) {
            _results.push(instancePart);
          }
        }
        return _results;
      }).call(this);
      this._assertInstance(instanceTypes.length > 0, "has no type");
      this._assertInstance(instanceTypes.length === 1, "has several types: " + (instanceTypes.join(', ')));
      return instanceTypes[0];
    };

    _schemaInstanceChecker.prototype._checkSource = function(instanceType) {
      var source;
      source = this.instanceDescription[instanceType];
      this._assertInstance(source != null, "source is undefined or null");
      if (instanceType === this._keySourceFactoryFunction || instanceType === this._keySourceSingle) {
        return this._assertInstance(typeof source === 'function', "source for '" + instanceType + "' should be function");
      }
    };

    _schemaInstanceChecker.prototype._assertInstance = function(condition, message) {
      return assert(condition, ("invalid instance '" + this.instanceName + "': ") + message);
    };

    _schemaInstanceChecker.prototype._checkAllowedFields = function() {
      var allAllowedParts, part, unknownParts;
      allAllowedParts = this._getAllowedTypes().concat(this._keyDependencies);
      unknownParts = (function() {
        var _results;
        _results = [];
        for (part in this.instanceDescription) {
          if (__indexOf.call(allAllowedParts, part) < 0) _results.push(part);
        }
        return _results;
      }).call(this);
      return this._assertInstance(unknownParts.length === 0, "unknown fields: " + (unknownParts.join(', ')) + ". allowed fields: " + (allAllowedParts.join(', ')));
    };

    _schemaInstanceChecker.prototype._checkDependencies = function() {
      var dep, depName, depValue, dependencies, typeofDeps, _results;
      if (this._keyDependencies in this.instanceDescription) {
        dependencies = this.instanceDescription[this._keyDependencies];
        typeofDeps = dependencies === null ? 'null' : typeof this.instanceDescription.deps;
        this._assertInstance(typeofDeps === 'object' && ((function() {
          var _results;
          _results = [];
          for (dep in dependencies) {
            _results.push(dep);
          }
          return _results;
        })()).length > 0, "deps should be non-empty dictionary, " + typeofDeps + " given");
        _results = [];
        for (depName in dependencies) {
          depValue = dependencies[depName];
          this._assertInstance(typeof depValue === 'string', "dependency '" + depName + "' should be a string");
          _results.push(this._assertInstance(__indexOf.call(this.schema, depValue) >= 0, "dependency '" + depName + "': schema doesn't have instance '" + depValue + "'"));
        }
        return _results;
      }
    };

    return _schemaInstanceChecker;

  })();

  return IocContainerContract;

})();
