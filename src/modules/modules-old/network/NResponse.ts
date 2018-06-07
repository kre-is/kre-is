import {TransmissionControl} from "../transmissioncontrol/TransmissionControl";
import {NetLink} from "./NetLink";

/**
 * if inlink is 0, assume you created it.
 */
export class NResponse{
    original : string;
    inlink : NetLink;
    constructor(original : string, inlink ?: NetLink){
        this.original = original;
        this.inlink = inlink || null;
    }
}