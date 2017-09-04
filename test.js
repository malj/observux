const {expect} = require('chai')
const {Store} = require('./observux')
const {Observable} = require('rxjs/Observable')
require('rxjs/add/operator/skip')
require('rxjs/add/operator/take')

describe('Store constructor', () => {
    it('should be a function', () => {
        expect(Store).to.be.a('function')
    })

    it('should throw a TypeError if passed non-object props', () => {
        const invalidTypes = [
            'string',
            1337,
            true,
            null,
            undefined,
            function () {}
        ]

        invalidTypes.forEach(invalidType => {
            expect(() => new Store(invalidType)).to.throw(TypeError)
        })
    })

    it('should throw a RangeError if passed a props object without ' +
        'own enumerable properties', () =>
    {
        const emptyProps = {}

        expect(() => new Store(emptyProps)).to.throw(RangeError)
    })

    it('should throw a TypeError if passed a props object containing the ' +
        'reserved property name "state"', () =>
    {
        const invalidProps = {state: true}

        expect(() => new Store(invalidProps)).to.throw(TypeError)
    })

    it('should return a Store instance', () => {
        expect(new Store({foo: 'bar'})).to.be.instanceof(Store)
    })
})

describe('Store instance', () => {
    const props = {foo: 'bar', baz: 'qux'}
    const store = new Store(props)

    it('should have all props copied onto itself', () => {
        expect(store).to.deep.equal(props)
    })

    it('should have all props converted to nonconfigurable, enumerable ' +
       'getters and setters', () =>
    {
        Object.keys(store).forEach(key => {
            expect(store).to.have.ownPropertyDescriptor(key)
                .that.has.property('configurable', false)

            expect(store).to.have.ownPropertyDescriptor(key)
                .that.has.property('enumerable', true)

            expect(store).to.have.ownPropertyDescriptor(key)
                .that.has.property('get')

            expect(store).to.have.ownPropertyDescriptor(key)
                .that.has.property('set')
        })
    })

    it('should have have own property "state"', () => {
        expect(store).to.have.own.property('state')
    })
})

describe('State property', () => {
    const store = new Store({foo: 'bar'})

    it('should be an RxJS Observable', () => {
        expect(store.state).to.be.an.instanceof(Observable)
    })

    it('should be nonconfigurable, nonenumerable and nonwritable', () => {
        expect(store).to.have.ownPropertyDescriptor('state', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: store.state
        })
    })

    it('should emit a value on subscription', done => {
        store.state.take(1).subscribe(() => {
            done()
        })
    })

    it('should emit a value on any other observable property ' +
        'assignment', done =>
    {
        store.state.skip(1).take(1).subscribe(state => {
            done()
        })
        store.foo = store.foo
    })

    it('should emit a shallow store clone representing its state', done => {
        store.state.skip(1).take(1).subscribe(state => {
            expect(state).to.not.equal(store)
            expect(state).to.deep.equal(store)
            done()
        })
        store.foo = 'baz'
    })
})
