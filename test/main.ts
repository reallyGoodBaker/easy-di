import {InstantiationService, ServiceCollection} from '../src/index'
import {A} from './consumer-A'
import {IA} from './interface-A'

class App {
    constructor(
        //将 IA 对应的接口注入 App 类
        @IA private readonly a: IA,
    ) {}

    startApp() {
        this.a.sayHi()
    }
}

//通过初始化服务构建类实例
new InstantiationService(
    //为初始化服务提供接口identifier与实现类的绑定
    new ServiceCollection([
        //[Identifier, {new(): any}, any[]]
        //Index 0: createIdentifier<T>(uid: string) 函数返回的Identifier对象
        //Index 1: 实现类
        //Index 2: 初始化类时的静态参数（选填）
        [IA, A]
    ])
).createInstance<App>(App).startApp()