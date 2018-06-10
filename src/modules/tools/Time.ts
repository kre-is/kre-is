export class Time {
    readonly millis: number;
    constructor(time ?: Time){
        this.millis = time && time.millis || new Date().getTime();
    }
    static evaluateNTP(t0: Time, t1: Time, t2: Time, t3: Time) : {ping: number, offset: number}{
        return {
            ping: t3.millis - t0.millis - (t2.millis - t1.millis),
            offset: ((t1.millis - t0.millis) + (t2.millis - t3.millis))/2
        }
    }
}

function encodeTime(time : number) : string{
    return String.fromCodePoint(
        Math.floor((time / (2**0)) % (1<<16)),
        Math.floor((time / (2**16))% (1<<16)),
        Math.floor((time / (2**32))% (1<<16)),
        Math.floor((time / (2**48))% (1<<16))
    )
}
function decodeTime(time : string) : number{
    return time.codePointAt(0) +
        time.codePointAt(1) * (2**16) +
        time.codePointAt(2) * (2**32) +
        time.codePointAt(3) * (2**48)
}