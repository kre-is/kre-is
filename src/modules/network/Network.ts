import {TCAnswer, TCOffer, TransmissionControl} from "../transmissioncontrol/TransmissionControl";
import {NResponse} from "./NResponse";
import {NRequest} from "./NRequest";
import {NetworkAddress} from "./NetworkAddress";
import {Arctable} from "./arctable/Arctable";
import {NetLink} from "./NetLink";
import {PrivateKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {Future} from "../tools/Future";

enum NetworkError{
    NoParticipantFound = 1001,
    ProtocolError = 1300,
    HandshakeError1 = 1301,
    HandshakeError2 = 1302
}

export class Network{
    links: Arctable<NetLink>;
    pendingOffers : {link : NetLink, age : number}[] = [];
    pendingAnswers: {link : NetLink, age : number}[] = [];
    onmessage : (request : NRequest) => NResponse;
    ready : Promise<Network>;
    private key : PrivateKey;

    constructor(onmessage : (request : NRequest) => NResponse, key ?: PrivateKey){
        this.onmessage = onmessage;
        this.key = key || new PrivateKey();
        this.ready = new Future<Network>(); //fires when at least one connection is ready;
        (async ()=>{
            //guaranteed-ish to be ready on time because offer/answer awaits this.key
            this.links = new Arctable<NetLink>(await this.key.getPublicHash());
        })();

    }

    connect(link : NetLink){
        let self = this;
        link.ready.then(()=>(self.ready as Future<Network>).resolve(self));
        let ejected = this.links.add(link.address.numeric ,link);
        if(ejected) ejected.close();
        return;
    }
    disconnect(link : NetLink){
        this.links.remove(link.address.numeric).close();
    }


    async relay(request : NRequest) : Promise<NResponse>{
        await this.ready;
        let outlink = this.links.approach(request.target.numeric);
        if(!outlink) throw [NetworkError.NoParticipantFound];
        return await outlink.dispatch(request);
    }

    async broadcast(request : string) : Promise<NResponse[]>{
        if(!this.links ) throw [NetworkError.NoParticipantFound];
        let all = this.links.getAll();
        if(!all.length) throw [NetworkError.NoParticipantFound];
        return await Promise.all(all.map(ol => ol.dispatch(new NRequest(ol.address, request))));
    }

    async offer() : Promise<NOffer>{
        let self = this;
        let link = new NetLink(this);
        let time = new Date().getTime();

        self.pendingOffers.push({link: link, age: time});

        link.ready.then(()=>{
            let element = self.pendingOffers.splice(
                self.pendingOffers.findIndex(e => e.age == time),1)[0];
            self.connect(link);
        });
        //@todo: check if overfull, and disable further offers

        return this.key.sign<{o: TCOffer, t: number}>({o: await link.offer(), t: time});
    }

    async answer(offer : NOffer) : Promise<NAnswer>{
        let self = this;
        try{
            let verdoc = await VerDoc.reconstruct<{o: TCOffer, t: number}>(offer);

            let link = new NetLink(self);
            let answer = await link.answer(verdoc.data.o);
            let time = new Date().getTime();
            self.pendingAnswers.push({age: time, link: link});

            link.setAddress(new NetworkAddress(verdoc.key.hashed()));

            link.ready.then(()=>{
                let element = self.pendingAnswers.splice(
                    self.pendingAnswers.findIndex(e => e.age == time),1)[0];
                self.connect(link);
            });

            //@todo: delete oldest answers on overfull

            return this.key.sign<{a : TCAnswer, t: number}>({a : answer, t: verdoc.data.t});
        }catch(e){
            throw [NetworkError.HandshakeError1];
        }
    }

    async complete(answer : NAnswer){
        let self = this;
        try{
            let verdoc = await VerDoc.reconstruct<{a : TCAnswer, t: number}>(answer);


            let link = this.pendingOffers[
                    this.pendingOffers.findIndex(o => o.age == verdoc.data.t)
                ].link;
            link.complete(verdoc.data.a);

            link.setAddress(new NetworkAddress(verdoc.key.hashed()));
        }catch(e){
            throw [NetworkError.HandshakeError2];
        }
    }

}

class NOffer extends RawDoc<{o: TCOffer, t: number}>{}
class NAnswer extends RawDoc<{a : TCAnswer, t: number}>{}