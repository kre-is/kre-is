import {Chordoid} from "./Chordioid";
import {Observable} from "../../tools/Observable";
import {routerc} from "../config";

export class Arctable<T> extends Chordoid<T> {
    private purgatory: { key: number, obj: T, eff: number, idx: number }[] = []; // stores pending addresses;
    private deepStored : number = 0;
    readonly maxSize : number;

    constructor(center : number){
        super(center);
        this.maxSize = Chordoid.lookupTable.length - 1;
    }

    add(location : number, object : T) : T | null{
        let idx = this.ltoi(location);
        let extracted = this.array[idx];

        if(extracted && extracted.key == location)
            return object;

        if(this.isDesirable(location)){
            let idx = this.ltoi(location);
            let extracted = this.array[idx];
            this.array[idx] = {key: location, obj: object};

            if(!extracted){
                this.deepStored++;
                return null;
            }

            location = extracted.key;
            object = extracted.obj;
        }

        if(this.purgatory.findIndex(e => e.key == location)+1)
            return object;

        let efficiency = this.efficiency(location, idx);

        this.purgatory.push({obj: object, key: location, eff: efficiency, idx: idx});

        if(this.purgatory.length <= this.maxSize - this.deepStored) return null;

        this.purgatory.sort((a, b)=> a.eff - b.eff);

        return this.purgatory.pop().obj;

    }

    remove(location : number) : T{
        let removed = super.remove(location);
        if(removed){
            this.deepStored--;

            //find a replacement
            let idx = this.ltoi(location);
            let candidates = this.purgatory.filter(e => e.idx == idx);
            if(candidates.length == 0) return removed;

            candidates.sort((a,b)=> a.eff - b.eff);

            let pindex = this.purgatory.findIndex(e => e.key == location);

            let candidate = this.purgatory.splice(pindex, 1)[0];

            this.deepStored++;
            if(super.add(candidate.key, candidate.obj)) throw "fatal logic error in arctable";


            return removed;
        }else{
            let pindex = this.purgatory.findIndex(e => e.key == location);
            if(pindex == -1) return null;
            return this.purgatory.splice(pindex, 1)[0].obj;
        }
    }

    getAll(){
        return [...this.array.filter(e => e), ...this.purgatory].map(e => e.obj);
    }

    approach(location : number) : T{
        return this.getWithin(location, this.distance(location))
    }

    getSuggestions(){
        if(this.deepStored < 6){
            return [{
                location: (this.locus+0.5)%1,
                exponent: 0,
                efficiency: 0.4999
            },...super.getSuggestions()]
        }

        return super.getSuggestions();
    }
}
