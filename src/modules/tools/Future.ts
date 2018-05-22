/**
 * Essentially deferred, but it's also a promise.
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 */
export class Future<T> extends Promise<T>{
    readonly resolve : (value : PromiseLike<T> | T) => void;
    readonly reject : (reason ?: any) => void;
    protected state : 0 | 1 | 2; //pending, resolved, rejected;

    constructor(executor ?: (
        resolve : (value : PromiseLike<T> | T) => void,
        reject : (reason ?: any) => void)=>void
    ){
        let resolver, rejector;

        super((resolve, reject) => {
            resolver = (resolution : T) => {
                this.state = 1;
                resolve(resolution);
            };
            rejector = (rejection : any) => {
                this.state = 2;
                reject(rejection);
            };
        });
        this.state = 0;

        this.resolve = resolver;
        this.reject = rejector;

        executor && new Promise<T>(executor).then(resolver).catch(rejector);
    }
}