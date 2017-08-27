# Observux

Reactive state management for JavaScript apps with a minimal API and full power of RxJS.

## Requirements

- [RxJS](https://github.com/ReactiveX/rxjs)

## Installation

```bash
npm install rxjs observux
```

## Usage

Observux stores are state containers with observable properties. Assigning values to the properties emits an updated state to its subscribers:

```javascript
import {Store} from 'observux'

const counter = new Store({count: 0})

const subscription = counter.state.subscribe(state => {
    console.log(state)
})  // logs {count: 0}

counter.count++  // logs {count: 1}
counter.count--  // logs {count: 0}

subscription.unsubscribe()
```

Stores can be extended, and their observable `state` values can be adjusted using RxJS operators:

```javascript
import {Store} from 'observux'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operators/map'
import 'rxjs/add/operators/filter'
import 'rxjs/add/operators/pluck'
import 'rxjs/add/operators/skip'
import 'rxjs/add/operators/take'
import 'rxjs/add/operators/distinctUntilKeyChanged'

class GithubUserService extends Store {
    constructor() {
        // Observable properties are passed to the superclass
        super({
            users: [],
            lastFetched: null
        })

        // Non-observable properties are assigned to the subclass
        this.name = 'Github user service'
    }

    fetchUsers(...usernames) {
        const request = Promise.all(usernames.map(username =>
            fetch(`https://api.github.com/users/${username}`).then(response => {
                if (response.ok) return response.json()
                else throw new Error(response.statusText)
            })
        ))

        this.lastFetched = new Date()

        // Monitor future timestamp changes to generate an abort signal
        const abortSignal = this.state.distinctUntilKeyChanged('lastFetched')
            .skip(1)
            .take(1)

        // Wrap the request promise in an Observable to make it cancellable
        Observable.fromPromise(request).takeUntil(abortSignal).subscribe({
            next: users => this.users = users,
            error: console.error
        })
    }
}

const githubUserService = new GithubUserService()

githubUserService.state.pluck('users')
    .filter(users => users.length)
    .take(1)
    .map(users => users.map(user => user.name))
    .subscribe(names => console.log(...names))

githubUserService.fetchUsers('octocat', 'torvalds')  // logs 'The Octocat', 'Linus Torvalds'
```

## API

### Store(props)

Base class for Observux stores.

A `Store` instance's observable properties are defined in `props` object. It also has a special `state` property, an [observable](http://reactivex.io/rxjs/manual/overview.html#observable) sequence of its state values. Assigning values to its observable properties emits a new state value to subscribers.

*Under the hood, `props` are converted to getters/setters to allow tracking of state changes. Due to ES5 limitations (and poor ES6 Proxy support), it is currently not possible to detect new observable properties once a store has been created.*


## Resources

- [RxJS](http://reactivex.io/rxjs/manual/overview.html)
- [RxJS operators](https://www.learnrxjs.io/#operators)
