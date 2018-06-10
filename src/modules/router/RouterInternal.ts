import {Cable} from "./Cable";
import {ArctableObservable} from "./arctable/ArctableObservable";
import {Future} from "../tools/Future";


export abstract class RouterInternal {
    protected table : ArctableObservable<Cable>;
    readonly ready : Promise<this>;

    protected constructor(){
        this.ready = new Future<this>();
    }

    protected dispatch(msg : string, target : number, tolerance : number) : Promise<string>{
        let closest = this.table.getWithin(target, tolerance);
        if(!closest) throw "empty network";
        return this.table.getWithin(target, tolerance).send(msg);
    }

    protected broadcast(msg : string) : Promise<string>[]{
        return this.table.getAll().map(c => c.send(msg));
    }

    protected attach(cable : Cable){
        let self = this;
        cable.closed.then(c => self.detach(c));
        let ejected = this.table.add(cable.key.hashed(), cable);
        ejected && ejected.close();
        (this.ready as Future<this>).resolve(this);
    }

    protected detach(cable : Cable){
        let ejected = this.table.remove(cable.key.hashed());
        ejected && ejected.close();
    }
    
}