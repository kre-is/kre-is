import {TypedConnection} from "../connection/TypedConnection";
import {PublicKey, RawDoc} from "../crypto/PrivateKey";
import {NetworkAnswer, NetworkInternal, NetworkOffer} from "./NetworkInternal";
import {RequestFunction} from "../connection/Connection";
import {Time} from "../tools/Time";

export class NetworkConnection extends TypedConnection
{
    network : NetworkInternal;
    foreignKey : PublicKey;

    channelPropagateOffer : RequestFunction<RawDoc<NetworkOffer>, RawDoc<NetworkAnswer>>;

    channelRequestRemoteTime : RequestFunction<Time, Time>;


    private constructChannels(){
        let self = this;

        this.channelPropagateOffer = this.createChannel(msg => {
           return self.network.answer(msg, self.foreignKey);
        });

        this.channelRequestRemoteTime = this.createChannel( msg => {
            return Promise.resolve(new Time());
        });
    }

    constructor(network : NetworkInternal){
        super();
        this.network = network;
        this.constructChannels();
    }

}