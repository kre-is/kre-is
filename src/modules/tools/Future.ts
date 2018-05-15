/**
 * Essentially deferred, but it's also a promise.
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 */
export class Future<T> extends Promise<T>{
    readonly resolve : (value : PromiseLike<T> | T) => void;
    readonly reject : (reason ?: any) => void;

    constructor(executor ?: (
        resolve : (value : PromiseLike<T> | T) => void,
        reject : (reason ?: any) => void)=>void
    ){
        let resolver, rejector;

        super((resolve, reject) => {
            resolver = (resolution : T) => {
                resolve(resolution);
            };
            rejector = (rejection : any) => {
                reject(rejection);
            };
        });

        this.resolve = resolver;
        this.reject = rejector;

        executor && new Promise<T>(executor).then(resolver).catch(rejector);
    }
}