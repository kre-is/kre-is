import {TransmissionControl} from "../transmissioncontrol/TransmissionControl";
import {PrivateKey, PublicKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {Answer, Offer} from "../datalink/DataLink";
import {Arctable} from "./arctable/Arctable";
import {RouterInternal} from "./RouterInternal";

export class Cable extends TransmissionControl{
    dateOfCreation : number;
    key : PublicKey;

    constructor(){
        super((e)=>{throw e});

    }

    async offer() : Promise<Offer>{
        this.dateOfCreation = new Date().getTime();
        return super.offer();
    }

    async answer(offer : Offer) : Promise<Answer>{
        this.dateOfCreation = new Date().getTime();
        return super.answer(offer)
    }
}


export interface RawCableOffer{
    target: number, //exponent
    tolerance : number,
    sdp : Offer
}

export interface CableOffer extends RawDoc<RawCableOffer>{

}

export interface CableAnswer extends RawDoc<Answer>{

}
