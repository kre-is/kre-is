import {Answer, DataLink, Offer} from "../datalink/DataLink";
import {transmissioncontrolc} from "./config";
import {Future} from "../tools/Future";
import {NetworkAddress} from "../network/NetworkAddress";

enum TransmissionControlError{
    ConnectionClosed = 100,
    RemoteError = 200,
    ProtocolError = 300
}

/**
 * cpt 0
 * forward  cpt=1
 * backward cpr=2
 *
 * cpt 1
 * reference
 * 0
 *
 * cpt 2
 * reference if cpt 1 == 0
 * data...
 *
 * cpt 3...
 * data...
 */
export class TransmissionControl extends DataLink{
    address: NetworkAddress;
    relayTable: Future<string>[] = new Array(transmissioncontrolc.maxMessageBuffer+1).fill(null);

    constructor(onmessage : (msg : string)=>Promise<string> | string){
        super((msg)=>console.log(msg));
        const self = this;
        self.datachannel.onmessage = async (msgE)=>{
            try{
                switch (msgE.data.codePointAt(0)){
                    case 2: {
                        let idx = msgE.data.codePointAt(1);
                        if(!idx) {
                            idx = msgE.data.codePointAt(2);
                            self.relayTable[idx-1].reject([TransmissionControlError.RemoteError,
                                ...msgE.data.slice(3).split('').map(c => c.codePointAt(0))]);
                        } else {
                            self.relayTable[idx-1].resolve(msgE.data.slice(2));
                        }
                        return;
                    }
                    case 1: {
                        let idx = msgE.data.codePointAt(1);
                        try{
                            self.reply(String.fromCodePoint(2, idx) + await onmessage(msgE.data.slice(2)));
                        }catch (e){
                            self.reply(String.fromCodePoint(2,0,idx,...e));
                        }
                    }
                }
            } catch (e) {
                console.log("bad actor:");
                console.error(e);
                self.close();
            }


        };
    }

    private reply(msg : string){
        super.send(msg);
    }

    async offer(){
        return "TCO:"+ await super.offer();
    }
    async answer(offer : TCOffer){
        if (offer.slice(0,4) !== "TCO:") throw [TransmissionControlError.ProtocolError];
        return "TCA:"+ await super.answer(offer.slice(4));
    }
    complete(answer: TCAnswer){
        if (answer.slice(0,4) !== "TCA:") throw [TransmissionControlError.ProtocolError];
        return super.complete(answer.slice(4));
    }


    send(msg : string) : Promise<string>{
        let idx = this.relayTable.findIndex(e => !e)+1;
        this.relayTable[idx-1] = new Future<string>();
        super.send(String.fromCodePoint(1, idx) + msg);
        return this.relayTable[idx-1];
    }
    close(){
        this.relayTable.forEach(e => e && e.reject([TransmissionControlError.ConnectionClosed]));
        super.close();
    }
}

export class TCOffer extends Offer{}
export class TCAnswer extends Answer{}
