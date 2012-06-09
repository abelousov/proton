class IocContainerContract
	#TODO: проверять соответствие методов в обоих сущностях
	#TODO: вынести в отдельную сущность работы с АОП
	applyToIocContainerPrototype: (iocContainerPrototype) ->
		@_addCheck iocContainerPrototype, methodName for methodName in @_getCheckedMethodNames()

	_addCheck: (checkedPrototype, methodName) ->
		decoratedMethod = checkedPrototype::[methodName]
		contract = this
		checkedPrototype::[methodName] = ->
			checkedObject = this
			argsArrayToConcat = (arg for arg in arguments)
			contract[methodName].apply contract, [checkedObject].concat argsArrayToConcat
			decoratedMethod.apply checkedObject, arguments

	_getCheckedMethodNames: -> ['setSchema', 'getInstance']

	setSchema: (iocContainer, schema) ->
		@_schemaShouldBeNonEmpty schema
		@_checkEachInstanceData schema

	getInstance: (iocContainer, instanceName) ->
		assert iocContainer._schema?, 'Dependency schema is not set'
		rawInstanceData = iocContainer._schema[instanceName]
		assert rawInstanceData?, 'Instance \'' + instanceName + '\' not found in dependency schema'

	_schemaShouldBeNonEmpty: (schema) ->
		assert schema?, 'Dependency schema should be given'
		assert (instanceName for instanceName of schema).length > 0, 'Dependency schema should be non-empty'

	_checkEachInstanceData: (schema) ->
		(new _schemaInstanceChecker instanceName, schema).check() for instanceName of schema

	class _schemaInstanceChecker
		constructor: (@instanceName, @schema) ->
			@instanceDescription = @schema[@instanceName]

		_keySourceSingle: 'single'
		_keySourceReference: 'ref'
		_keySourceFactoryFunction: 'factoryFunction'
		_keyDependencies: 'deps'

		_getAllowedTypes: -> [@_keySourceSingle, @_keySourceReference, @_keySourceFactoryFunction]

		check: ->
			@_assertInstance @instanceDescription?, 'contents not set'

			@_checkAllowedFields()
			instanceType = @_getAndCheckInstanceType()
			@_checkSource instanceType
			@_checkDependencies()

		_getAndCheckInstanceType: ->
			instanceTypes = (instancePart for instancePart of @instanceDescription when instancePart in @_getAllowedTypes())
	
			@_assertInstance instanceTypes.length > 0, "has no type"
			@_assertInstance instanceTypes.length == 1, "has several types: #{instanceTypes.join ', '}"
	
			return instanceTypes[0]
	
		_checkSource: (instanceType) ->
			source = @instanceDescription[instanceType]

			@_assertInstance source?, "source is undefined or null"
	
			if instanceType in [@_keySourceFactoryFunction, @_keySourceSingle]
				@_assertInstance typeof source == 'function', "source for '#{instanceType}' should be function"
	
		_assertInstance: (condition, message) -> assert condition, "invalid instance '#{@instanceName}': " + message

		_checkAllowedFields: ->
			allAllowedParts = @_getAllowedTypes().concat @_keyDependencies
			unknownParts = (part for part of @instanceDescription when part not in allAllowedParts)
			@_assertInstance unknownParts.length == 0, "unknown fields: #{unknownParts.join ', '}. allowed fields: #{allAllowedParts.join ', '}"

		_checkDependencies: ->
			if @_keyDependencies of @instanceDescription
				dependencies = @instanceDescription[@_keyDependencies]
				typeofDeps = if dependencies == null then 'null' else typeof @instanceDescription.deps
				@_assertInstance typeofDeps == 'object' and (dep for dep of dependencies).length > 0, "deps should be non-empty dictionary, #{typeofDeps} given"

				for depName, depValue of dependencies
					@_assertInstance typeof depValue == 'string', "dependency '#{depName}' should be a string"
					@_assertInstance depValue in @schema, "dependency '#{depName}': schema doesn't have instance '#{depValue}'"
