import {RouterInternal} from "./RouterInternal";
import {Cable} from "./Cable";

/**
 * demonized-ish
 */
export class RouterDamned extends RouterInternal{
    state: "idle" | "seeking" = "idle";

    async attach(cable : Cable){
        try{
            await cable.ready;
            super.attach(cable);
        }catch (e) {
            this.state = "idle";
        }
        if(this.state == "idle"){
            this.state = "seeking";

        }
    }
}