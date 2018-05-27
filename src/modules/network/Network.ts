import {NetworkInternal} from "./NetworkInternal";
import {PrivateKey} from "../crypto/PrivateKey";
import {Time} from "../tools/Time";
import {NetworkConnection} from "./NetworkConnection";
import {ConnectionError} from "../connection/ConnectionError";
import {NetworkError} from "./NetworkError";

export class Network extends NetworkInternal{
    constructor(privateKey : PrivateKey){
        super(privateKey);
    }

    /**
     * try to ascertain the lag and time discrepancy between this client and the remote clients.
     */
    sync(){
        return this.table.all().map(c => c.channelRequestRemoteTime(new Time()));
    }

    /**
     * link to a possibly disparate network.
     * @param {Network} network
     * @returns {Promise<Network>}
     */
    async link(network : Network){
        let conn = new NetworkConnection(this);
        try{
            let offer = await this.offer(conn);
            let answer = await network.answer(offer);
            await this.complete(answer, conn);
        } catch (e) {
            e;
            if ((e as ConnectionError).type == 6){
                throw NetworkError.NoCandidates()
            }
        }
        await conn.open;
        await network.bootstrapped;
        await this.bootstrapped;
        return network;
    }

}