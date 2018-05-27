import {Chordoid, Exponent} from "../chordoid/Chordoid";
import {Answer, Connection, Offer, RequestFunction} from "../connection/Connection";
import {PrivateKey, PublicKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {TypedConnection} from "../connection/TypedConnection";
import {NetworkConnection} from "./NetworkConnection";
import {Future} from "../tools/Future";
import {ConnectionError} from "../connection/ConnectionError";
import {NetworkInternalDaemon} from "./daemons/NetworkInternalDaemon";

/**
 * no need to await readiness, when the offer comes / answer is provided, the network is guaranteed to be ready.
 */
export class NetworkInternal{
    private privateKey : PrivateKey;
    protected table : Chordoid<NetworkConnection>;
    private ready : Future<void>; // ready for accepting connections
    public bootstrapped : Promise<this>; // it's integrated into the network, network functions should work now

    private daemon : NetworkInternalDaemon;

    constructor(privateKey : PrivateKey){
        this.privateKey = privateKey;
        this.ready = new Future<void>();
        (async ()=>{
            this.table = new Chordoid<NetworkConnection>(await privateKey.getPublicHash());

            this.ready.resolve(null);
        })();
        this.bootstrapped = new Future();

        this.daemon = new NetworkInternalDaemon(this);
    }

    private insertOnReady(connection : NetworkConnection, key: PublicKey){
        let self = this;
        connection.foreignKey = key;
        connection.open.then(conn => {
            let oldconn = self.table.add(key.hashed(), conn);

            (this.bootstrapped as Future<this>).resolve(self);
            this.daemon.run();

            oldconn && oldconn.close();
            return connection.closed;
        }).then(()=>{
            //when it's closed
            self.table.remove(key.hashed());
        }).catch( ()=>{
            //when it's closed
            self.table.remove(key.hashed()).close();

            //TODO: IP ban implementation goes here
        });
    }


    async offer(connection : NetworkConnection, selection = 0) : Promise<RawDoc<NetworkOffer>>{
        let suggestion;
        if((this.bootstrapped as Future<this>).getState() == "pending"){
            suggestion = {exponent: 14, efficiency: 1}
        } else {
            suggestion = this.table.getSuggestions()[selection];
        }
        return this.privateKey.sign<NetworkOffer>({
            sdp: await connection.offer(),
            target: suggestion.exponent,
            tolerance: suggestion.efficiency
        });
    }
    async answer(rawdoc : RawDoc<NetworkOffer>, origin ?: PublicKey) : Promise<RawDoc<NetworkAnswer>>{
        let self = this;
        let doc = await VerDoc.reconstruct(rawdoc);

        await this.privateKey.getPublicHash();

        //what do they want?
        let target = Chordoid.dereference(doc.data.target, doc.key.hashed());
        let distanceToUs = Chordoid.distance(target, await self.privateKey.getPublicHash());

        if( //they want us and we want them
            distanceToUs < doc.data.tolerance
            && this.table.isDesirable(doc.key.hashed())
        ){
            await this.ready;
            let connection = new NetworkConnection(this);
            this.insertOnReady(connection, doc.key);

            return this.privateKey.sign({sdp: await connection.answer(doc.data.sdp)});
        } else { //propagate
            let nextStop = self.table.getWithin(target,
                origin
                    ? Math.min(
                        distanceToUs,
                        Chordoid.distance(target, origin.hashed())
                    )
                    : 1
            );
            if(!nextStop) throw ConnectionError.NetworkEmpty();
            return nextStop.channelPropagateOffer(rawdoc).catch(e => {
                if((e as ConnectionError).type == 8) return this.answer(rawdoc, origin);
                throw e;
            });
        }
    }
    async complete(rawdoc : RawDoc<NetworkAnswer>, connection : NetworkConnection) : Promise<void>{
        let self = this;
        let doc = await VerDoc.reconstruct(rawdoc);

        await this.ready;

        this.insertOnReady(connection, doc.key);
        await connection.complete(doc.data.sdp);
    }
}

export interface NetworkOffer{
    sdp : Offer;
    target: Exponent;
    tolerance: number;
}
export interface NetworkAnswer{
    sdp : Answer;
}