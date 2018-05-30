import {utf8Encoder} from "../tools/utf8buffer";

export class Fasthash {
    static string(input : string){
        return utf8Encoder.encode(input).reverse().slice(0,50).
        reverse().
        reduce((a,e,i)=>a+e*Math.pow(256,i), 0) /
        Math.pow(256, 50);
    }
}