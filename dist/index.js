var di = (function (exports) {
    'use strict';

    class Dependency {
        _deps = [];
        set(index, serviceKey) {
            this._deps[index] = serviceKey;
        }
        get() {
            return this._deps;
        }
    }
    const _deps = new Map();
    function storeDependency(target, index, key) {
        let dep = _deps.get(target);
        if (!dep) {
            dep = new Dependency();
        }
        dep.set(index, key);
        _deps.set(target, dep);
    }
    function valideDependencies(target, col, exists = []) {
        const deps = _deps.get(target);
        if (!deps) {
            return true;
        }
        for (const dep of deps.get()) {
            const desc = col.get(dep);
            if (!desc) {
                throw ReferenceError('No corresponding target found in collection');
            }
            if (exists.includes(desc.ctor)) {
                throw new CircularDependencyError(exists);
            }
            exists.push(desc.ctor);
            valideDependencies(desc.ctor, col, exists);
        }
        return true;
    }
    class CircularDependencyError extends Error {
        constructor(arr) {
            super(`Find circular dependencies: ${arr.join(', ')}`);
        }
    }

    function createDescriptor(service, singleton = true, staticArgs = []) {
        const desc = {
            ctor: service,
            singleton,
            staticArguments: staticArgs
        };
        return desc;
    }
    const _identifiers = new Map();
    class ServiceCollection {
        _entries = new Map();
        constructor(singletonOpt, basicOpt) {
            if (Array.isArray(singletonOpt)) {
                for (const _opt of singletonOpt) {
                    const [id, ctor, args] = _opt;
                    this.setSingleton(id, ctor, args);
                }
            }
            if (Array.isArray(basicOpt)) {
                for (const _opt of basicOpt) {
                    const [id, ctor, args] = _opt;
                    this.set(id, ctor, args);
                }
            }
        }
        setSingleton(id, service, args = []) {
            this._entries.set(typeof id === 'string' ? id : id._key, createDescriptor(service, true, args));
            return this;
        }
        set(id, service, args = []) {
            this._entries.set(typeof id === 'string' ? id : id._key, createDescriptor(service, false, args));
            return this;
        }
        get(id) {
            return this._entries.get(typeof id === 'string' ? id : id._key);
        }
        has(id) {
            return this._entries.has(typeof id === 'string' ? id : id._key);
        }
    }

    function createIdentifier(key) {
        if (_identifiers.has(key)) {
            return _identifiers.get(key);
        }
        const id = function (target, _, index) {
            if (arguments.length !== 3) {
                throw 'Identifier can only be used as a decorator in a class constructor';
            }
            storeDependency(target, index, key);
        };
        id._key = key;
        _identifiers.set(key, id);
        return id;
    }

    function _gatherDeps(service) {
        const dep = _deps.get(service);
        if (!dep) {
            return null;
        }
        return dep;
    }
    const _store = new Map();
    const IInstantiationService = createIdentifier('builtin-InstantiationService');
    class InstantiationService {
        _collection;
        constructor(collection) {
            this._collection = collection;
        }
        getCollection() {
            return new Proxy(this._collection, {
                set() {
                    return false;
                },
                get(t, p) {
                    return t[p];
                }
            });
        }
        _getOrCreateServiceByKey(key, args = []) {
            if (!this._collection.has(key)) {
                return null;
            }
            const desc = this._collection.get(key);
            if (!desc) {
                return null;
            }
            const { ctor, singleton, staticArguments } = desc;
            if (singleton && _store.has(key)) {
                return _store.get(key);
            }
            const _service = this._createInstance(ctor, args.length ? args : staticArguments);
            if (singleton) {
                _store.set(key, _service);
            }
            return _service;
        }
        _createInstance(service, args = []) {
            try {
                valideDependencies(service, this._collection);
            }
            catch (err) {
                this.onError.call(this, err);
            }
            let deps = _gatherDeps(service)?.get().map(key => this._getOrCreateServiceByKey(key));
            if (!deps) {
                deps = [];
            }
            return Reflect.construct(service, [...deps, ...args]);
        }
        createInstance(service, args = []) {
            return this._createInstance(service, args);
        }
        invoke(func) {
            const self = this;
            Reflect.apply(func, undefined, [{
                    get(k, args = []) {
                        return self._getOrCreateServiceByKey(k, args);
                    }
                }]);
        }
        /**
         * @override
         */
        onError(err) {
            console.log(err);
        }
        register(id, service, args = []) {
            this._collection.set(id, service, args);
            return this;
        }
        registerSingleton(id, service, args = []) {
            this._collection.setSingleton(id, service, args);
            return this;
        }
    }

    exports.IInstantiationService = IInstantiationService;
    exports.InstantiationService = InstantiationService;
    exports.ServiceCollection = ServiceCollection;
    exports.createIdentifier = createIdentifier;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=index.js.map
