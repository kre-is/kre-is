import {RouterPorts} from "./RouterPorts";
import {Cable, CableAnswer, CableOffer, RawCableOffer} from "./Cable";
import {Arctable} from "./arctable/Arctable";
import {PrivateKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {Answer} from "../datalink/DataLink";
import {ArctableObservable} from "./arctable/ArctableObservable";

export class RouterCableFactory extends RouterPorts{
    readonly address : Promise<number>;
    readonly sign : <T>(doc : T)=>Promise<RawDoc<T>>;
    protected relayOffer: (msg: string, target: number, tolerance: number) => Promise<String>;
    constructor(key : PrivateKey){
        super();

        this.sign = (o)=>key.sign(o);

        let self = this;
        this.relayOffer = this.createPort(async (msg : CableOffer) => {
            return await self.provideConnector()(msg) as string;
        });

        this.address = key.getPublicHash();

        this.address.then(hash => self.table = new ArctableObservable<Cable>(hash))
    }


    /**
     *
     * @param {Connector} connector
     * @param {number} entropy alters the priority of suggested future connections. keep this near 0, and between 0 and 1.
     * @returns {Promise<Cable>} when ready for transmit
     */
    async generateSocket(connector : Connector, offset = 0){

        await this.address;

        let self = this;

        let cable = new Cable();

        let suggestion = this.table.getSuggestions()[
                offset
            ];


        let offer = await this.sign({
            target: suggestion.exponent,
            tolerance : suggestion.efficiency,
            sdp : await cable.offer()
        });

        try{
            let answer = await VerDoc.reconstruct<Answer>(await connector(offer));
            cable.key = answer.key;
            await cable.complete(answer.data);

        }catch(e){
            cable.close();
            throw "Connection failed: " + e;
        }

        await cable.ready;
        cable.closed.then(()=>self.detach(cable));
        self.attach(cable);
        return cable.ready;
    }

    provideConnector() : Connector{
        let self = this;
        return async (offer : CableOffer) => {

            let doc = await VerDoc.reconstruct<RawCableOffer>(offer);

            let target = Arctable.dereference(doc.data.target, doc.key.hashed());

            let distance = Arctable.distance(target, await self.address);

            if (distance >= doc.data.tolerance)
                return self.relayOffer(offer as string, target, distance);

            if( ! this.table.isDesirable(doc.key.hashed()))
                return self.relayOffer(offer as string, target, distance);

            let cable = new Cable();

            cable.key = doc.key;

            cable.ready.then(()=> self.attach(cable));
            cable.closed.then(()=>self.detach(cable));

            return self.sign(await cable.answer(doc.data.sdp));
        }
    }

}

export interface Connector {
    (offer : CableOffer) : Promise<CableAnswer>
}

