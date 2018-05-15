export class Chordoid1<T>{
    private locus : number;
    private array : {key : number, obj : T}[];

    //FIXME: amp up precision to 64 bit;

    static readonly lookupTable = [-0.5, -0.25, -0.05555555555555558, -0.0078125, -0.0008000000000000229, -0.0000643004115226109,
        -0.0000042499298761322635, -2.384185791015625e-7, -1.1615286565902494e-8, -4.999999858590343e-10,
        -1.9277190954625212e-11, -6.729616863765386e-13, -2.148281552649678e-14, -6.106226635438361e-16, 0,
        6.106226635438361e-16, 2.148281552649678e-14, 6.729616863765386e-13, 1.9277190954625212e-11,
        4.999999858590343e-10, 1.1615286565902494e-8, 2.384185791015625e-7, 0.0000042499298761322635,
        0.0000643004115226109, 0.0008000000000000229, 0.0078125, 0.05555555555555558, 0.25, 0.5];
    static readonly locusIDX = 14; // position of the locus

    static acceptableError = 1e-16;

    constructor(center : number, circumference : number = 1){
        this.locus = center;
        this.array = new Array(Chordoid1.lookupTable.length-1).fill(null);
    }

    add(location: number, obj : T) : T | null{
        let idx = this.ltoi(location);
        if(this.array[idx]){
            if(this.efficiency(this.array[idx].key, idx) > this.efficiency(location, idx)){
                //efficiency is worse than incoming
                let old = this.array[idx].obj;
                this.array[idx] = {key: location, obj: obj};
                return old;
            } else {
                //reject the object;
                return obj;
            }
        } else {
            this.array[idx] = {key: location, obj: obj};
            return null;
        }
    }

    get(location: number) : T | null{
        let item = this.array[this.ltoi(location, true)]
        return (item || null) && item.obj;
    }

    remove(location: number) : T | null{
        let idx = this.ltoi(location);
        let old = this.array[idx];
        if(!old || Math.abs(old.key - location) > Chordoid1.acceptableError){
            return null;
        }
        this.array[idx] = null;
        return old.obj;
    }



    private derelativize(location : number) : number{
        console.assert(location>=0 && location <= 1, "location: "+location);
        return ((1 + location - this.locus + 0.5) % 1) - 0.5;
        //expect in range -0.5, 0.5
    }
    private rerelativize(location : number) : number{
        return (location + this.locus + 1 ) % 1;
    }

    static distance(a : number, b : number) : number{
        return Math.min(
            Math.abs(a - b),
            Math.abs(a - b + 1),
            Math.abs(b - a + 1)
        );
    }

    efficiency(location : number, idx : number) : number{
        let derelativized = this.derelativize(location);
        return Chordoid1.distance(Chordoid1.lookupTable[idx], derelativized);
    }

    ltoi(location : number, skipEmpty : boolean = false) : number{ //location to index
        let derelativized = this.derelativize(location);

        let efficiency = 1;
        let veridex = null;
        if(derelativized < 0){
            //start with 0
            let idx = 0;
            while(efficiency > this.efficiency(location, idx)){
                if(skipEmpty && !this.array[idx]){
                    idx++;
                    continue;
                }
                efficiency = this.efficiency(location, idx);
                veridex = idx++;
            }
            return veridex;
        } else {
            // start with max
            let idx = Chordoid1.lookupTable.length-1;
            while(efficiency > this.efficiency(location, idx)){
                if(skipEmpty && !this.array[idx]){
                    idx--;
                    continue;
                }
                efficiency = this.efficiency(location, idx);
                veridex = idx--;
            }
            return veridex;
        }
    }

    /**
     * get a sorted list of suggestions, on which addressees are most desirable, with which tolerances.
     * @returns {{location: number; efficiency: number}[]} sorted, biggest to smallest gap.
     */
    getSuggestions() : {location : number, efficiency : number}[] {
        return this.array.map((item, idx) => {
            return {
                efficiency: (item)? this.efficiency(item.key, idx) : Math.abs(Chordoid1.lookupTable[idx]/2),
                location: this.rerelativize(Chordoid1.lookupTable[idx]),
            }
        }).sort((a,b)=>b.efficiency - a.efficiency);
    }

}