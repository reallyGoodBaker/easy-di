import {IA} from './interface-A'

export class A implements IA {
    sayHi(): void {
        console.log('Hello!')
    }
}