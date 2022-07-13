import {createIdentifier} from '../src/index'

export interface IA {
    sayHi(): void;    
}

export const IA = createIdentifier<IA>('A')


export interface IB {
    foo(): void;
}

export const IB = createIdentifier<IB>('B')