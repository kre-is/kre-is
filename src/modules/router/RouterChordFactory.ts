import {RouterPorts} from "./RouterPorts";
import {Cable, CableAnswer, CableOffer, RawCableOffer} from "./Cable";
import {Arctable} from "./arctable/Arctable";
import {PrivateKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import has = Reflect.has;
import {Answer} from "../datalink/DataLink";

export class RouterChordFactory extends RouterPorts{
    readonly address : Promise<number>;
    readonly sign : <T>(doc : T)=>Promise<RawDoc<T>>;
    private relayOffer: (msg: string, target: number, tolerance: number) => Promise<String>;
    constructor(key : PrivateKey){
        super();

        this.sign = (o)=>key.sign(o);

        let self = this;
        this.relayOffer = this.createPort(async (msg : CableOffer) => {
            return await self.provideConnector()(msg) as string;
        });

        this.address = key.getPublicHash();

        this.address.then(hash => self.table = new Arctable<Cable>(hash))
    }


    /**
     *
     * @param {Connector} connector
     * @returns {Promise<Cable>} when ready for transmit
     */
    async generateSocket(connector : Connector){

        await this.address;

        let self = this;

        let cable = new Cable();

        let suggestion = this.table.getSuggestions()[0];

        // @todo: investigate the utility of this
        // let suggestion =  this.table.getSuggestions()[
        //     Math.floor(Math.random()**10 * this.table.maxSize)
        //     ];

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

