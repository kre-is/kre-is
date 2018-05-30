import {NetworkInternal} from "./NetworkInternal";
import {NetworkAddress} from "./NetworkAddress";
import {NRequest} from "./NRequest";
import {NResponse} from "./NResponse";
import {PrivateKey, PublicKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {networkc} from "./config";
import {Fasthash} from "../crypto/Fasthash";

export enum NetworkError{
    NoSuchChannel = 2001,
    RemoteApplicationError = 2002,
    BroadcastFromFuture = 2101, // rejected because desynchronized.
}

export class Network extends NetworkInternal{
    private broadcastBuffer : {time : number, hash : number}[] = [];
    private ports : RequestFunction<any, any>[] = [];
    private timeOffset : number = 0;

    constructor(key ?: PrivateKey){
        super(null, key || new PrivateKey());
        this.onmessage = this.reflect;
    }

    /**
     * @param {(arg: A, req?: NRequest) => Promise<B>} onmessage
     * @returns {(arg: A) => (Promise<B> | Promise<B>[])}
     */
    protected addport<A,B>(onmessage : (arg : A, req ?: NRequest)=> Promise<B>): (arg : A, target ?: NetworkAddress) => Promise<B[]> | Promise<B>{
        let self = this;
        let port : number = this.ports.length;

        this.ports.push(async (msg : A, req ?: NRequest)=>{
            return await onmessage(msg, req);
        });

        return async (arg : A, target ?: NetworkAddress) => {

            let payload = port.toString(10) + '|' + JSON.stringify(arg);

            if(target){
                return self.relay(new NRequest(target, payload)).then(r => JSON.parse(r.original))
            }

            //no target, will broadcast
            return (await self.broadcast(payload)).map(p => p.then(e => JSON.parse(e.original)));
        }
    }


    /**
     * @param {(msg: A) => boolean} onmessage operation. boolean response determines whether to rebroadcast the message
     * @param {number} port
     * @returns {(msg: A) => void}
     */
    addBroadcastKernel<A>(onmessage : (msg: A)=>Promise<boolean>, port ?: number) : (msg : A) => Promise<void>{
        let self = this;
        let channel;
        let responder = async (msg : RawDoc<BroadcastFrame<A>>) => {
            let vbcc = await VerDoc.reconstruct(msg);
            let hash = Fasthash.string(vbcc.signature);
            if(vbcc.data.time > new Date().getTime() + self.timeOffset + networkc.maxBroadcastTolerance) // network sent from the future
                throw[NetworkError.BroadcastFromFuture];
            if(
                !self.broadcastBuffer[networkc.maxBroadcastBuffer] || // buffer isn't full yet, or
                (self.broadcastBuffer[networkc.maxBroadcastBuffer].time < vbcc.data.time //not too old and
                && self.broadcastBuffer.findIndex(e => e.hash == hash) == -1 )//not already in buffer
            ){
                if(await onmessage(vbcc.data.data)){
                    self.broadcastBuffer.unshift({time: vbcc.data.time, hash: hash});
                    if(self.broadcastBuffer.length > networkc.maxBroadcastBuffer) self.broadcastBuffer.pop();
                    channel(msg);
                    return true;
                }
            }
            return false;
        };
        channel = this.addport<RawDoc<BroadcastFrame<A>>, boolean>(responder);
        return async (msg : A)=>{
            let frame : BroadcastFrame<A>= {
                data : msg,
                time : new Date().getTime() + self.timeOffset,
            };
            return channel(await self.key.sign(frame));
        }
    }


    private reflect(msg: NRequest){
        let splitr = msg.original.indexOf('|');
        let port = parseInt(msg.original.slice(0, splitr));
        let meat = msg.original.slice(splitr+1);
        if(!this.ports[port]) throw NetworkError.NoSuchChannel;
        try{
            return new NResponse(JSON.stringify(this.ports[port](JSON.parse(meat), msg)));
        }catch(e){
            throw [NetworkError.RemoteApplicationError, ...e]
        }
    }

}
export interface RequestFunction<RequestT, ResponseT>{
    (request :RequestT, req ?: NRequest) : Promise<ResponseT>
}
interface BroadcastFrame<T>{
    data : T;
    time : number;
}