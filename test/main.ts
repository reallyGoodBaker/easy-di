import {InstantiationService, ServiceCollection} from '../src/index'
import {A} from './consumer-A'
import {IA} from './interface-A'

class App {
    constructor(
        @IA private readonly a: IA,
    ) {}

    startApp() {
        this.a.sayHi()
    }
}

new InstantiationService(
    new ServiceCollection([
        [IA, A]
    ])
).createInstance<App>(App).startApp()