import {transmissioncontrolc} from "./config";
import {Future} from "../tools/Future";
import {DataLink} from "../datalink/DataLink";

enum TransmissionControlError{
    ConnectionClosed = 100,
    RemoteError = 200,
    ProtocolError = 300
}

export class TransmissionControl extends DataLink{
    relayTable: Future<string>[] = new Array(transmissioncontrolc.maxMessageBuffer+1).fill(null);
    onmessage : (msg : string)=> Promise<string>;

    constructor(onmessage : (msg : string)=>Promise<string>){
        super(null);
        this.onmessage = onmessage;
        const self = this;
        this.datachannel.onmessage = async (msgE)=>{
            // step 1: what is it?
            let type = msgE.data.codePointAt(0);
            let reference = msgE.data.codePointAt(1);
            let data = msgE.data.slice(2);

            switch(type){
                case 0: self.onmessage(data)
                    .then(response => self.datachannel.send(String.fromCodePoint(1, reference) + response))
                    .catch(error => self.datachannel.send(String.fromCodePoint(2, reference) + error)); return;
                case 1:
                    try{
                        self.relayTable[reference].resolve(data);
                        self.relayTable[reference] = null;
                    }catch (e){
                        console.error("bad actor", e);
                        self.close();
                    }break;
                case 2:
                    try{
                        self.relayTable[reference].reject(data);
                        self.relayTable[reference] = null;
                    }catch (e){
                        console.error("bad actor 2", e);
                        self.close();
                    }break;
                default:
                    console.error("bad actor 2, type: ", type, "reference: ", reference, "data: ", data);
                    self.close();
            }
        };
    }


    send(msg : string) : Promise<string>{
        let idx = this.relayTable.findIndex(e => !e);
        if(idx == -1) throw "callback buffer full!";
        this.relayTable[idx] = new Future<string>();
        super.send(String.fromCodePoint(0, idx) + msg);
        return this.relayTable[idx];
    }
    close(){
        this.relayTable.forEach(e => e && e.reject([TransmissionControlError.ConnectionClosed]));
        super.close();
    }
}

