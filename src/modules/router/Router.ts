import {RouterDamned} from "./RouterDamned";
import {Connector} from "./RouterCableFactory";
import {PrivateKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {Fasthash} from "../crypto/Fasthash";

export class Router extends RouterDamned{
    timedelta = 0;
    readonly privateKey : PrivateKey;

    constructor(key : PrivateKey){
        super(key);
        this.privateKey = key;
    }

    generateSocket(connector : Connector){
        return super.generateSocket(connector);
    }

    provideConnector(){
        return super.provideConnector();
    }

    createBroadcastChannel(onmessage, bufferSize = 100) : (msg : Object) => void {
        let self = this;
        let buffer : {t: number, h: number}[] = [{t:0, h:0}];

        let channel = this.createFrequency(async msg => {

            let vobj = await VerDoc.reconstruct(msg as RawDoc<{t:number, m:Object}>);


            if(vobj.data.t < buffer[0].t) throw "Message Too Old";
            if(vobj.data.t > new Date().getTime()) throw "Message From Future";

            //see if message is in buffer
            let hash = Fasthash.string(msg);
            let idx = buffer.findIndex(e => e.h == hash);

            if(idx+1) return '1'; // message already received

            buffer.push({t: vobj.data.t, h: hash});

            while(buffer.length > bufferSize){
                buffer.shift();
            }

            try{
                await onmessage(vobj);
                channel(msg);

            }catch(e){
                throw "Message Rejected by Application: "+e;
            }



            return '0';
        });


        return async (msg : Object)=>{
            let time = new Date().getTime() + self.timedelta;

            let tmsg = await self.privateKey.sign({
                t: time,
                m: msg
            }) as any;

            buffer.push({t: time, h: Fasthash.string(tmsg)});
            
            channel(tmsg);
        }

    }

}