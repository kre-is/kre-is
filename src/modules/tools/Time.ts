export class Time {
    readonly millis: number;
    constructor(time ?: Time){
        this.millis = time && time.millis || Date.now();
    }
    static evaluateNTP(t0: Time, t1: Time, t2: Time, t3: Time) : {ping: number, offset: number}{
        return {
            ping: t3.millis - t0.millis - (t2.millis - t1.millis),
            offset: ((t1.millis - t0.millis) + (t2.millis - t3.millis))/2
        }
    }
}