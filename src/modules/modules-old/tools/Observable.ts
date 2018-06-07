export class Observable<T> {
    private value: T;
    private listeners: ((value: T) => void)[];

    constructor(initial: T) {
        this.value = initial;
        this.listeners = [];
    }

    observe(callback: (value: T) => void) {
        this.listeners.push(callback);
    }

    set(value: T) {
        if (value !== this.value) {
            this.value = value;
            this.listeners.forEach(e => e(value));
        }
    }
    get() : T {
        return this.value;
    }

    //remove all subscribers "no more relevant changes happening"
    flush() : void {
        delete this.listeners;
        this.listeners = [];
    }
}
