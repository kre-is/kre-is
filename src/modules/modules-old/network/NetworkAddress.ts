import {PublicKey} from "../crypto/PrivateKey";

export class NetworkAddress {
    readonly numeric : number;
    constructor(hash: number){
        if(hash >= 1 || hash <= 0) throw "Invalid address";
        this.numeric = hash;
    }
}