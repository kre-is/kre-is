import {TransmissionControl} from "../transmissioncontrol/TransmissionControl";
import {NetworkInternal} from "./NetworkInternal";
import {NRequest} from "./NRequest";
import {NetworkAddress} from "./NetworkAddress";
import {NResponse} from "./NResponse";

export class NetLink extends TransmissionControl{
    address : NetworkAddress = null;
    constructor(network : NetworkInternal) {
        super(async reqstr => {
            let splitr = reqstr.indexOf('|');
            let address = parseFloat(reqstr.slice(0, splitr));

            return (await network.onmessage(new NRequest(new NetworkAddress(address), reqstr.slice(splitr+1), this))).original;
        });
    }
    setAddress(address : NetworkAddress){
        this.address = address;
    }

    /**
     * @deprecated
     * @see dispatch
     * @param arg
     * @returns {Promise<void>}
     */
    send(arg : any) : Promise<any>{
        throw "Not available: use dispatch.";
    }

    /**
     * use this instead of send
     * this is not called send, because typescript.
     * @param {NRequest} message
     * @returns {Promise<NResponse>}
     */
    async dispatch(message : NRequest) : Promise<NResponse>{
        let self = this;
        return new NResponse(
            await super.send(message.target.numeric.toString() + "|" + message.original),
            self
        );
    }
}