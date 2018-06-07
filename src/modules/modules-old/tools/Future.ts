/**
 * Essentially deferred, but it's also a promise.
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 */
export class Future<T> extends Promise<T>{
    readonly resolve : (value : PromiseLike<T> | T) => void;
    readonly reject : (reason ?: any) => void;
    protected state : 0 | 1 | 2; //pending, resolved, rejected;
    private stateExtractor;

    constructor(executor ?: (
        resolve : (value : PromiseLike<T> | T) => void,
        reject : (reason ?: any) => void)=>void
    ){
        let resolver, rejector;
        let state : 0 | 1 | 2 = 0;
        super((resolve, reject) => {
            resolver = (resolution : T) => {
                state = 1;
                resolve(resolution);
            };
            rejector = (rejection : any) => {
                state = 2;
                reject(rejection);
            };
        });
        this.stateExtractor = () => { // this is necessary because self cannot be set in super;
            return state;
        };

        this.resolve = resolver;
        this.reject = rejector;

        executor && new Promise<T>(executor).then(resolver).catch(rejector);
    }

    getState() : "pending" | "resolved" | "rejected" | "error" {
        return (this.stateExtractor() == 0)? "pending"
            : (this.stateExtractor() == 1) ? "resolved"
            : (this.stateExtractor() == 2) ? "rejected"
            : "error";
    }

}