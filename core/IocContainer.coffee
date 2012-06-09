class IocContainer
	constructor: -> @_singleInstancesCache = {}

	setSchema: (schema) -> @_schema = schema

	getInstance: (instanceName) ->
		instance = @_createInstance instanceName

		#don't set up dependencies for factoryFunction itself
		# - they will be set directly for objects created by it
		if (@_getInstanceType instanceName) != @_keySourceFactoryFunction
			@_addDependencies instanceName, instance

		return instance

	_addDependencies: (instanceName, instance) ->
		dependencies = (@_getInstanceData instanceName)[@_keyDependencies]

		if dependencies
			for depName, dependency of dependencies
				instance[depName] = @getInstance dependency

	_createInstance: (instanceName) ->
		instanceType = @_getInstanceType instanceName
		source = @_getInstanceSource instanceName
		switch instanceType
			when @_keySourceSingle then @_getSingleInstance source, instanceName
			when @_keySourceReference then @_useDirectReference source
			when @_keySourceFactoryFunction then @_createFactoryFunction source, instanceName
			when @_keySourceMultiple then @_createFromConstructor source

	_getSingleInstance: (ctor, instanceName) ->
		if not (instanceName of @_singleInstancesCache)
			@_singleInstancesCache[instanceName] = @_createFromConstructor ctor

		return @_singleInstancesCache[instanceName]

	_createFromConstructor: (ctor) -> new ctor

	_useDirectReference: (reference) -> reference

	_createFactoryFunction: (ctor, instanceName) ->
		return =>
			newInstance = {}
			ctor.apply newInstance, arguments
			@_addDependencies instanceName, newInstance
			return newInstance

	_keySourceSingle: 'single'
	_keySourceReference: 'ref'
	_keySourceFactoryFunction: 'factoryFunction'
	_keySourceMultiple: 'multiple'
	_keyDependencies: 'deps'

	_getInstanceType: (instanceName) ->
		for allowedType in [@_keySourceSingle, @_keySourceReference, @_keySourceFactoryFunction, @_keySourceMultiple]
			if allowedType of (@_getInstanceData instanceName)
				return allowedType

	_getInstanceData: (instanceName) -> @_schema[instanceName]

	_getInstanceSource: (instanceName) ->
		#in dependency schema, type/source are given as key/value pair
		instanceType = @_getInstanceType instanceName
		return (@_getInstanceData instanceName)[instanceType]
