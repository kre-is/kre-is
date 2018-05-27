import {KreisInternal} from "../KreisInternal";
import {Time} from "../../tools/Time";
import {Chordoid} from "../../chordoid/Chordoid";
import {Connection} from "../../connection/Connection";
import {KIDConfig} from "./config";

/**
 * Kreis Internal Daemon
 */
export class KID{
    private readonly host: KreisInternal;
    private lastAction : Time;
    private activeConnection : Connection = null;
    private flagStop : boolean = false;

    private state : 0 | 1 | 2 | 3; //@see KID.md
    private config: { timeout: number };
    constructor(kreis: KreisInternal, config = KIDConfig){
        this.host = kreis;
        this.lastAction = new Time();
        this.state = 0;
        this.config = config;
    }

    stop() : void{
        this.state = 3;
    }

    async run(forced : boolean = true) : Promise<void>{
        const self = this;
        await null; //purge tail calls

        switch(this.state){
            case 0: {
                this.dispatch()
                    .then(()=>{
                        self.state = 0;
                        self.run(false);
                    })
                    .catch(()=>{
                        self.state = 2;
                        setTimeout(()=>{
                            self.run(false);
                        },self.config.timeout);
                    })
            } return;
            case 1: {
                //pass
            } return;
            case 2: {
                this.state = 0;
                this.run(false);
            } return;
            case 3: {
                if(!forced) return;

                this.state = 0;
                this.run(false);
            } return;
        }
    }

    private async dispatch(){
        let self = this;
        await self.host.daemonComplete(
            await self.host.answer(
                await self.host.daemonOffer(
                    Math.floor(
                        Chordoid.lookupTable.length * Math.random() ** 5 //adding some entropy
                    )
                )
            )
        );
    }


}

