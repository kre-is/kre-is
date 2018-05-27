import {PrivateKey, PublicKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
import {Answer, Connection, Offer, RequestFunction} from "../connection/Connection";
import {Chordoid, Exponent} from "../chordoid/Chordoid";
import {TypedConnection} from "../connection/TypedConnection";
import {Future} from "../tools/Future";
import {ConnectionError} from "../connection/ConnectionError";
import {Time} from "../tools/Time";
import {KID} from "./daemons/KID";

/**
 * @property {Promise<KreisInternal>} open - fires when the structure is connected to at least one peer, returns this instance
 */
export class KreisInternal{
    private readonly ready: Promise<void>;
    private readonly privateKey : PrivateKey;
    private pendingConnection : KreisConnection | null;
    private pendingDaemonConnection : KreisConnection | null;
    private structure: Chordoid<KreisConnection>;
    readonly open: Promise<this>;
    private opener: ()=>void; // resolves "opens";
    private operative: Future<this>; // when the datastructure is ready;
    private daemon : KID;
    constructor(){
        this.privateKey = new PrivateKey();
        this.operative = new Future<this>();
        this.privateKey.sign("init")
            .then(verdoc =>
                this.structure = new Chordoid<KreisConnection>(verdoc.key.hashed()))
            .then(()=> this.operative.resolve(this));

        //note: this is guaranteed to be initialized upon use, because any acceptance also requires
        //a verification and a signature
        //note: this is not completely true, but whatever.
        this.open = new Promise(resolve => {
            this.opener = ()=>{resolve()};
        }).then(()=>this);

        this.daemon = new KID(this);
        this.open.then(self=>self.daemon.run());
    }

    private async handleOffer(offer : VerDoc<KreisOffer>) : Promise<RawDoc<KreisAnswer>>{
        let targetAddress = Chordoid.dereference(offer.data.target, offer.key.hashed());
        if (
            this.structure.distance(targetAddress) < offer.data.tolerance
            && this.structure.isDesirable(targetAddress)
        ){
            let connection = this.createConnection();
            connection.publicKey = offer.key;
            return this.privateKey.sign<KreisAnswer>({
                sdp: await connection.answer(offer.data.sdp)
            });
        } else {
            try{
                return this.structure.get(targetAddress).propagateOffer(offer);
            }catch (e) {
                return Promise.reject(ConnectionError.NetworkEmpty())
            }
        }
    }


    private createConnection() : KreisConnection{
        let connection = new KreisConnection(this);
        connection.publicKey = null;
        let self = this;

        connection.open.then(connection => {
            let ejected = this.structure.add(connection.publicKey.hashed(),connection);
            ejected && ejected.close();
            this.opener();
        });

        //** core utility
        connection.propagateOffer = connection.createChannel<RawDoc<KreisOffer>, RawDoc<KreisAnswer>>(
            async (rawOffer)=>{
                return self.handleOffer(await VerDoc.reconstruct(rawOffer))
            });


        return connection;
    }

    async offerConstructor(index, connection : KreisConnection) : Promise<VerDoc<KreisOffer>>{
        let desirable;
        if(index < 0){
            desirable = {exponent: new Exponent(0), efficiency: 1};
        } else {
            desirable = this.structure.getSuggestions()[index];
        }

        return this.privateKey.sign<KreisOffer>({
            sdp: await connection.offer(),
            target: desirable.exponent,
            tolerance: desirable.efficiency
        });
    }

    /**
     * generates an offer, for the RTC handshake.
     * @param {number} index of the desirability map. negative values make a universal offer. todo: add entropy to idx.
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    async offer(index = 0) : Promise<VerDoc<KreisOffer>>{
        await this.operative.then();
        if (this.pendingConnection) throw "there is a pending connection! use reOffer instead to forget this connection";
        this.pendingConnection = this.createConnection();

        return this.offerConstructor(index, this.pendingConnection);
    }

    async reOffer(index = 0) : Promise<VerDoc<KreisOffer>>{
        this.pendingConnection && this.pendingConnection.close();
        this.pendingConnection = null;
        return this.offer(index);
    }

    /**
     * @friend KDaemon
     * @access protected
     * @see offer
     * @param {number} index
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    async daemonOffer(index = 0) : Promise<VerDoc<KreisOffer>>{
        await this.operative.then();
        if (this.pendingDaemonConnection) throw "there is a pending connection! use daemonReOffer instead to forget this connection";
        this.pendingDaemonConnection = this.createConnection();

        return this.offerConstructor(index, this.pendingDaemonConnection);
    }

    /**
     * @friend KDaemon
     * @access protected
     * @see reOffer
     * @param {number} index
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    async daemonReOffer(index = 0){
        this.pendingDaemonConnection && this.pendingDaemonConnection.close();
        this.pendingDaemonConnection = null;
        return this.daemonOffer(index);
    }

    /**
     * @friend KDaemon
     * @access protected
     * @see complete
     * @param {RawDoc<KreisAnswer>} answer
     * @returns {Promise<Promise<void>>}
     */
    async daemonComplete(answer : RawDoc<KreisAnswer>){
        let connection = this.pendingDaemonConnection;
        this.pendingDaemonConnection = null;
        return this.completeConnection(answer, connection);
    }

    /**
     * answer from here, or from deeper within the network.
     * @param {VerDoc<KreisOffer>} offer
     * @returns {Promise<RawDoc<KreisAnswer>>}
     */
    async answer(offer : RawDoc<KreisOffer>) : Promise<RawDoc<KreisAnswer>>{
        await this.operative.then();

        return this.handleOffer(await VerDoc.reconstruct(offer));
    }

    /**
     * @param {RawDoc<KreisAnswer>} answer
     * @param {KreisConnection} connection
     * @returns {Promise<void>}
     */
    async completeConnection(answer : RawDoc<KreisAnswer>, connection : KreisConnection){
        let verAnswer = await VerDoc.reconstruct(answer);
        connection.publicKey = verAnswer.key;
        return connection.complete(verAnswer.data.sdp).catch(()=>{
            //bad answer; try again?
            connection.close()
        });
    }

    /**
     * complete a connection built with "offer";
     * @param {RawDoc<KreisAnswer>} answer
     * @returns {Promise<void>}
     */
    async complete(answer : RawDoc<KreisAnswer>) : Promise<void>{
        let connection = this.pendingConnection;
        this.pendingConnection = null;
        return this.completeConnection(answer, connection);
    }



    /**
     * @friend KreisConnection
     * @access protected
     * @returns {KreisConnection[]}
     */
    getBroadcastList() : KreisConnection[] {
        return this.structure.all();
    }



    shout(arg : string){
        let bcl = this.getBroadcastList();
        bcl.forEach(c => c.chat(arg));
    }

    /**
     * synchronize times with other connections.
     * @returns {Promise<{ping: number; offset: number}[]>}
     */
    sync() : Promise<{ping: number, offset: number, error: number}[]> {
        let t0 = new Time();
        return Promise.all(
            this.getBroadcastList().map(
                c => c.NTP(t0).then(t1 => {
                    return Time.evaluateNTP(t0, t1, t1, new Time())
                }).catch(()=>null)
            )
        )
    }
}

class KreisConnection extends TypedConnection{

    ping : number;
    timeOffset : number;
    timeError: number;

    publicKey : PublicKey;
    propagateOffer : RequestFunction<RawDoc<KreisOffer>, RawDoc<KreisAnswer>>; //reserved for KreisInternal

    chat : RequestFunction<string, string>; //todo: remove.
    NTP : RequestFunction<Time, Time>;

    constructor(kreis : KreisInternal){
        super();
        let self = this;

        //connection.propagate = connection.createChannel<KreisOffer, KreisAnswer>();
        this.chat = this.createChannel<string, string>(
            (message)=>{
                console.log(message);
                return Promise.resolve("ack: "+message);
            }
        );

        this.NTP = this.createChannel<Time, Time>(
            async (message)=>{
                return new Time();
            }
        );


    }
}

interface KreisOffer {
    sdp : Offer;
    target: Exponent;
    tolerance: number;
}
interface KreisAnswer {
    sdp : Answer;
}