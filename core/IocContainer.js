var IocContainer;

IocContainer = (function() {

  function IocContainer() {
    this._singleInstancesCache = {};
  }

  IocContainer.prototype.setSchema = function(schema) {
    return this._schema = schema;
  };

  IocContainer.prototype.getInstance = function(instanceName) {
    var instance;
    instance = this._createInstance(instanceName);
    if ((this._getInstanceType(instanceName)) !== this._keySourceFactoryFunction) {
      this._addDependencies(instanceName, instance);
    }
    return instance;
  };

  IocContainer.prototype._addDependencies = function(instanceName, instance) {
    var depName, dependencies, dependency, _results;
    dependencies = (this._getInstanceData(instanceName))[this._keyDependencies];
    if (dependencies) {
      _results = [];
      for (depName in dependencies) {
        dependency = dependencies[depName];
        _results.push(instance[depName] = this.getInstance(dependency));
      }
      return _results;
    }
  };

  IocContainer.prototype._createInstance = function(instanceName) {
    var instanceType, source;
    instanceType = this._getInstanceType(instanceName);
    source = this._getInstanceSource(instanceName);
    switch (instanceType) {
      case this._keySourceSingle:
        return this._getSingleInstance(source, instanceName);
      case this._keySourceReference:
        return this._useDirectReference(source);
      case this._keySourceFactoryFunction:
        return this._createFactoryFunction(source, instanceName);
      case this._keySourceMultiple:
        return this._createFromConstructor(source);
    }
  };

  IocContainer.prototype._getSingleInstance = function(ctor, instanceName) {
    if (!(instanceName in this._singleInstancesCache)) {
      this._singleInstancesCache[instanceName] = this._createFromConstructor(ctor);
    }
    return this._singleInstancesCache[instanceName];
  };

  IocContainer.prototype._createFromConstructor = function(ctor) {
    return new ctor;
  };

  IocContainer.prototype._useDirectReference = function(reference) {
    return reference;
  };

  IocContainer.prototype._createFactoryFunction = function(ctor, instanceName) {
    var _this = this;
    return function() {
      var newInstance;
      newInstance = {};
      ctor.apply(newInstance, arguments);
      _this._addDependencies(instanceName, newInstance);
      return newInstance;
    };
  };

  IocContainer.prototype._keySourceSingle = 'single';

  IocContainer.prototype._keySourceReference = 'ref';

  IocContainer.prototype._keySourceFactoryFunction = 'factoryFunction';

  IocContainer.prototype._keySourceMultiple = 'multiple';

  IocContainer.prototype._keyDependencies = 'deps';

  IocContainer.prototype._getInstanceType = function(instanceName) {
    var allowedType, _i, _len, _ref;
    _ref = [this._keySourceSingle, this._keySourceReference, this._keySourceFactoryFunction, this._keySourceMultiple];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      allowedType = _ref[_i];
      if (allowedType in (this._getInstanceData(instanceName))) return allowedType;
    }
  };

  IocContainer.prototype._getInstanceData = function(instanceName) {
    return this._schema[instanceName];
  };

  IocContainer.prototype._getInstanceSource = function(instanceName) {
    var instanceType;
    instanceType = this._getInstanceType(instanceName);
    return (this._getInstanceData(instanceName))[instanceType];
  };

  return IocContainer;

})();
