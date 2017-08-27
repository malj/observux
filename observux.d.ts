import {Observable} from 'rxjs'

export as namespace Observux

export class Store {
    [key: string]: any
    readonly state: Observable<any>
    constructor(props: object)
}
