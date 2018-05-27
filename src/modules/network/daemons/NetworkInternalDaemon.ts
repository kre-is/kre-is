import {Future} from "../../tools/Future";
import {NetworkInternal} from "../NetworkInternal";
import {Chordoid} from "../../chordoid/Chordoid";
import {NetworkConnection} from "../NetworkConnection";
import {ConnectionError} from "../../connection/ConnectionError";

/**
 * Daemon to curate the network, and interlink itself automatically with optimal nodes.
 */
export class NetworkInternalDaemon {
    network: NetworkInternal;
    state : 0 | 1 | 2 = 0; // idle, working, timed-out
    timeout : number;
    constructor(network : NetworkInternal, timeout = 10000){
        this.network = network;

        this.network.bootstrapped.then(()=>this.run());

        this.timeout = timeout;
    }

    /**
     * call this every time a connection is added to the network.
     * recursive, but the tails should resolve long before execute() is over.
     */
    async run(){
        await null;

        switch(this.state){
            case 0: {
                this.state = 1;
                this.execute();
                return;
            }
            case 1: {
                return; //do nothing
            }
            case 2: {
                this.state = 1;
                this.execute();
                return;
            }
        }
    }

    private execute(){
        let self = this;
        let connection = new NetworkConnection(this.network);
        this.network.offer(connection)
            .then(o => this.network.answer(o))
            .then(a => this.network.complete(a, connection))
            .then(() => self.state = 0)
            .then(() => self.run())
            .catch( e => {
                self.state = 0;
                if((e as ConnectionError).local){
                    //this means we couldn't send it anywhere. this means that the network is empty or our code is trash
                    self.state = 0;
                    return; // set to idle, do nothing.
                }

                switch ((e as ConnectionError).type){
                    case 6: { // no peer accepted our offer. try again later.
                        self.state = 2;
                        setTimeout(()=>self.run(), self.timeout);
                        return;
                    }
                    default: {
                        //nothing happens, state is 0; daemon is idle.
                    }
                }

            });
    }
}