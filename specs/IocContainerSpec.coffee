describe 'IocContainer', ->
	iocContainer = null
	beforeEach ->
		iocContainer = new IocContainer

	it 'sets dependency schema with setSchema() and gives instances by their names with getInstance()', ->
		class Foo
			constructor: -> @name = 'Foo'

		iocContainer.setSchema
			fooInstance:
				single: Foo

		foo1 = iocContainer.getInstance 'fooInstance'

		expect(foo1.name).toEqual 'Foo'

	describe "instance type can be: single, ref, factoryFunction", ->
		it 'single: returns the only instance of given class; doesn\'t accept parameters', ->
			class Foo

			iocContainer.setSchema
				fooInstance:
					single: Foo

			foo1 = iocContainer.getInstance 'fooInstance'
			foo2 = iocContainer.getInstance 'fooInstance'
			expect(foo2).toBe foo1

		it 'multiple: returns new instance for each call; doesn\'t accept parameters', ->
			class Foo

			iocContainer.setSchema
				fooInstance:
					multiple: Foo

			foo1 = iocContainer.getInstance 'fooInstance'
			foo2 = iocContainer.getInstance 'fooInstance'
			expect(foo2).not.toBe foo1

		it 'ref: gets existing object by direct reference', ->
			foo = {}
			iocContainer.setSchema
				fooInstance:
					ref: foo

			expect(iocContainer.getInstance 'fooInstance').toBe foo

		it 'factoryFunction: returns function to create new objects accepting any parameters', ->
			class Foo
				constructor: (@name) ->

			iocContainer.setSchema
				fooFactory:
					factoryFunction: Foo

			fooFactory = iocContainer.getInstance 'fooFactory'
			foo1 = fooFactory 'foo1'
			expect(foo1.name).toEqual 'foo1'

			foo2 = fooFactory 'foo2'
			expect(foo2).not.toBe foo1
			expect(foo2.name).toEqual 'foo2'

	describe 'dependencies are set with field "deps"', ->
		it 'fills instance dependencies with other schema instances using their names in schema', ->

			iocContainer.setSchema
				fooInstance:
					single: ->
					deps:
						'barProperty': 'barInstance'
				barInstance:
					ref: {}

			fooInstance = iocContainer.getInstance 'fooInstance'
			expect(fooInstance.barProperty).toBe (iocContainer.getInstance 'barInstance')

		it 'for factoryFunction, dependencies are added to resulting objects, not to factory function', ->
			class Foo
			baz = 'baz'

			iocContainer.setSchema
				fooFactory:
					factoryFunction: Foo
					deps:
						bazDependency: 'bazRef'
				bazRef:
					ref: baz

			fooFactory = iocContainer.getInstance 'fooFactory'
			foo1 = fooFactory 'foo1'
			expect(foo1.bazDependency).toBe baz
			expect(fooFactory.bazDependency).toBeUndefined()
