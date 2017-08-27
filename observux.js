;(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['rxjs'], factory)
    }
    else if (typeof module === 'object' && module.exports) {
        var Rx = {
            Observable: require('rxjs/Observable').Observable,
            BehaviorSubject: require('rxjs/BehaviorSubject').BehaviorSubject
        }
        require('rxjs/add/observable/combineLatest')
        module.exports = factory(Rx)
    }
    else {
        global.Observux = factory(global.Rx)
    }
}(this, function (Rx) {
    'use strict'

    function Store(props) {
        var store = this

        if (props === null || typeof props !== 'object') {
            throw new TypeError('Store props must be an object, got ' + props)
        }

        var keys = Object.keys(props)

        if (keys.length === 0) {
            throw new RangeError('Cannot create a store without props')
        }

        if (keys.indexOf('state') >= 0) {
            throw new TypeError('Cannot assign reserved prop name "state"')
        }

        var subjects = keys.map(function (key) {
            var subject = new Rx.BehaviorSubject(props[key])

            Object.defineProperty(store, key, {
                configurable: false,
                enumerable: true,
                get: function () {
                    return subject.value
                },
                set: function (value) {
                    subject.next(value)
                }
            })

            return subject
        })

        var args = subjects.concat(function () {
            return Object.keys(store).reduce(function (state, key) {
                state[key] = store[key]
                return state
            }, {})
        })

        Object.defineProperty(store, 'state', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: Rx.Observable.combineLatest.apply(null, args)
        })
    }

    return {
        Store: Store
    }
}));
