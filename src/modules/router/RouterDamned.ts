import {RouterInternal} from "./RouterInternal";
import {Cable, CableOffer, RawCableOffer} from "./Cable";
import {Connector, RouterCableFactory} from "./RouterCableFactory";
import {PrivateKey, VerDoc} from "../crypto/PrivateKey";
import {routerc} from "./config";
import {Arctable} from "./arctable/Arctable";

/**
 * demonized-ish
 *
 * tries to connect, until an error happens.
 * then it goes idle, until something in the network changes.
 * REVIEW
 */
export class RouterDamned extends RouterCableFactory{
    private state: "idle" | "seeking" | "strapped" | "timeout" = "idle";
    // private readonly timeoutreset = 1000;
    // private timeouttime = this.timeoutreset;
    // private timeoutreference : number;

    constructor(key: PrivateKey){
        super(key);

        let self = this;

        this.ready.then(() => {
            self.table.health.observe(()=>{
                self.rumble();
            });
            self.rumble();
        });

    }


    private async rumble(){
        switch(this.state){
            case "idle":
                {
                    this.state = "seeking";
                    let promised = await this.rumbleInitial();
                    if(routerc.verbose) console.log(
                        "node: ", await this.address,
                        " initial rumble: ", promised);
                    this.state = "strapped";
                } return;
            case "strapped": {
                this.state = "seeking";
                try{
                    await this.generateSocket(
                        this.provideInitialConnector(),
                        0 //Math.floor(Math.random()**10 * this.table.maxSize)
                    );
                    this.state = "strapped";
                    this.rumble(); //let this tail expire
                }catch (e) {
                    if(routerc.verbose) console.warn("Damned Idle:", e);
                    this.state = "strapped";
                }
            } return;
            case "seeking": return;
        }
    }

    private async rumbleInitial(){
        // HACK
        let fringes = 10;
        let r = [
            ... new Array(fringes).fill(1).map((e,i)=> i),
            ... new Array(fringes-1).fill(1).map((e,i)=> this.table.maxSize -i)
        ];

        let promises = r.map(async e => {
            await this.generateSocket(this.provideInitialConnector(), e)
                .then(e=>true)
                .catch(e => false)
        });
        return promises;
    }

    private provideInitialConnector() : Connector{
        let self = this;
        return async (offer : CableOffer) => {

            let doc = await VerDoc.reconstruct<RawCableOffer>(offer);

            let target = Arctable.dereference(doc.data.target, doc.key.hashed());
                return self.relayOffer(offer as string, target, 1);
        }
    }




}