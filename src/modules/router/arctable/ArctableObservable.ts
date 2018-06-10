import {Arctable} from "./Arctable";
import {Observable} from "../../tools/Observable";

export class ArctableObservable<T> extends Arctable<T>{
    readonly health : Observable<number> = new Observable<number>(0);

    add(location, object){
        let ext = super.add(location, object);

        this.health.set(this.health.get() +1 );

        return ext;
    }

    remove(location){
        let ext = super.remove(location);

        this.health.set(this.health.get() -1 );

        return ext;
    }


}