import {KreisInternal} from "../KreisInternal";
import {Time} from "../../tools/Time";
import {Chordoid} from "../../chordoid/Chordoid";
import {Connection} from "../../connection/Connection";

/**
 * Kreis Internal Daemon
 */
class KID{
    private readonly host: KreisInternal;
    private lastAction : Time;
    private activeConnection : Connection = null;
    /**
     * private state
     * 0: idle
     * 1: waiting for answer
     * 2: in timeout
     */
    private state : 0 | 1 | 2;
    constructor(kreis: KreisInternal){
        this.host = kreis;
        this.lastAction = new Time();
        this.state = 0;
    }

    async run() : Promise<void> {
        if(this.state == 1) return;
        this.state = 1;
        this.lastAction = new Time();
        this.host.answer(
            await this.host.offer(
                Math.floor(
                    Chordoid.lookupTable.length * Math.random() ** 5 //adding some entropy
                )
            )
        ).
        then(_=>{
            this.state = 0;
            setTimeout(_=>this.run(), 0);
        }).
        catch(_=>{
            this.state = 2;
            setTimeout(_=>this.run(), kdaemonconfig.timeout);
        })

    }

}

