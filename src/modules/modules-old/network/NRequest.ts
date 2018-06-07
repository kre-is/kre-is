import {NetworkAddress} from "./NetworkAddress";
import {NetLink} from "./NetLink";


export class NRequest {
    original: string;
    target: NetworkAddress;
    inlink: NetLink;
    constructor(destination : NetworkAddress, original : string, inlink ?: NetLink){
        this.original = original;
        this.target = destination;
        this.inlink = inlink || null;
    }
}