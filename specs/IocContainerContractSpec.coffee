describe 'IocContainerContract', ->

	expectAssertFail = (assertionMessage, func) ->
		expect(func).toThrow new AssertException assertionMessage

	class CheckedIocContainer extends IocContainer

	checker = new IocContainerContract
	checker.applyToIocContainerPrototype CheckedIocContainer

	iocContainer = null
	beforeEach ->
		iocContainer = new CheckedIocContainer

	describe 'setSchema', ->
		it 'checks that schema is not empty', ->
			expectAssertFail 'Dependency schema should be given', ->
				iocContainer.setSchema null

			expectAssertFail 'Dependency schema should be given', ->
				iocContainer.setSchema undefined

			expectAssertFail 'Dependency schema should be non-empty', ->
				iocContainer.setSchema {}

		describe 'it checks each instance in schema', ->

			#TODO: разбить на отдельные спеки по смыслу
			assertInvalidSchema = (assertMessage, invalidSchema) ->
				completeMessage = 'invalid instance \'foo\': ' + assertMessage
				expectAssertFail completeMessage, -> iocContainer.setSchema invalidSchema

			throwOnInvalidSchema = (specDescription, assertMessage, invalidSchema) ->
				it specDescription, -> assertInvalidSchema assertMessage, invalidSchema

			throwOnInvalidSchema 'should have only one type', 'has several types: single, factoryFunction',
				foo:
					single: ->
					factoryFunction: ->
			throwOnInvalidSchema 'should have contents', 'contents not set', foo: null
			throwOnInvalidSchema 'type should be given', 'has no type', foo: {}

			throwOnInvalidSchema "source should be set", "source is undefined or null",
				foo:
					single: null

			throwOnInvalidSchema 'source for \'single\' should be function', 'source for \'single\' should be function',
				foo:
					single: {}

			throwOnInvalidSchema 'source for \'factoryFunction\' should be function', 'source for \'factoryFunction\' should be function',
				foo:
					factoryFunction: {}

			throwOnInvalidSchema 'should have only allowed fields', "unknown fields: bar, baz. allowed fields: single, ref, factoryFunction, deps",
				foo:
					single: ->
					bar: null
					baz: {}

			it 'deps should be non-empty dictionary', ->
				for invalidDeps in [undefined, null, 'invalid', {}]
					do (invalidDeps) ->
						typeofDeps = if invalidDeps == null then 'null' else typeof invalidDeps
						assertInvalidSchema "deps should be non-empty dictionary, #{typeofDeps} given",
							foo:
								single: ->
								deps: invalidDeps

			it 'each dependency should be a string name of other instance in schema', ->
				for invalidDep in [null, {}]
					do (invalidDep) ->
						assertInvalidSchema "dependency 'barProperty' should be a string",
							foo:
								single: ->
								deps:
									barProperty: invalidDep
				assertInvalidSchema "dependency 'barProperty': schema doesn't have instance 'bar'",
					foo:
						single: ->
						deps:
							barProperty: 'bar'

	describe 'getInstance', ->
		it 'checks that schema is set and contains instance', ->
			expectAssertFail 'Dependency schema is not set', -> iocContainer.getInstance 'foo'

			iocContainer.setSchema
				bar:
					single: ->
			expectAssertFail 'Instance \'foo\' not found in dependency schema', -> iocContainer.getInstance 'foo'
