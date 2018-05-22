import {Future} from "./Future";

/**
 * Thenable logical AND convergence of Promises.
 * unlike Promise.all, it is runtime pushable.
 * @see add
 * @see Promise.all
 * @see Future
 */
export class Synchronicity extends Future<any[]>{
    private futures : Promise<any>[];

    /**
     * SuperExecutor acts as an optional logical OR Promise to the Synchronicity.
     * included for newpromisecapability compatibility.
     * @see add
     * @see Future
     * @see https://www.ecma-international.org/ecma-262/7.0/index.html#sec-newpromisecapability
     * @param {(resolve: (value: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) => void} superExecutor
     */
    constructor(superExecutor ?: (
        resolve : (value : PromiseLike<any> | any) => void,
        reject : (reason ?: any) => void)=>void
    ){
        super(superExecutor);
        this.futures = [];
    }

    /**
     * add a promise to the convergence. when all added promises resolve, you can no longer add any.
     * @param {Promise<any>} future
     */
    add(future : Promise<any>){
        let self = this;
        if(!this.state){
            this.futures.push(future);
            Promise.all(this.futures).then(a=>self.responder(a)).catch(e=>self.reject(e));
        } else {
            throw "Runtime Error: Synchronicity already converged in the past."
        }
    }

    /**
     * todo: optimize this
     * resolves the Synchronicity only when all events resolved.
     * @param {any[]} resolutions
     */
    private responder(resolutions : any[]){
        if (resolutions.length == this.futures.length){
            this.resolve(resolutions);
        }
    }
}

