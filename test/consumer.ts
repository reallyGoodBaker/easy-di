import {IA, IB} from './interface'

export class A implements IA {
    sayHi(): void {
        console.log('Hello!')
    }
}

export class B implements IB {
    foo(): void {
        console.log('World!')
    }
}