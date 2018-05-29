export class Chordoid<T>{
    private locus : number;
    protected array : {key : number, obj : T}[];

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
        this.array = new Array(Chordoid.lookupTable.length-1).fill(null);
    }

    isDesirable(location: number){ //todo: refactor this into "add"
        let idx = this.ltoi(location);
        if(this.array[idx]){
            if(this.efficiency(this.array[idx].key, idx) > this.efficiency(location, idx)){
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
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

    /**
     * retrieve closest available object
     * @param {number} location
     * @returns {T | null}
     */
    get(location: number) : T | null{
        let item = this.array[this.ltoi(location, true)];
        return (item || null) && item.obj;
    }
    getWithin(location: number, tolerance: number) : T | null {
        let item = this.array[this.ltoi(location, true)];
        return (item && Chordoid.distance(item.key , location) < tolerance)
            ? item.obj
            : null;
    }

    remove(location: number) : T | null{
        let idx = this.ltoi(location);
        let old = this.array[idx];
        if(!old || Math.abs(old.key - location) > Chordoid.acceptableError){
            return null;
        }
        this.array[idx] = null;
        return old.obj;
    }


    static dereference (idx: Exponent, locus: number) : number{
        return (Chordoid.lookupTable[idx.valueOf()] + locus + 1 ) % 1;
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
    distance(a: number) : number{
        return Chordoid.distance(this.locus, a);
    }

    efficiency(location : number, idx : number) : number{
        let derelativized = this.derelativize(location);
        return Chordoid.distance(Chordoid.lookupTable[idx], derelativized);
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
            let idx = Chordoid.lookupTable.length-1;
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
     * @returns {{location: number, efficiency: number, exponent: Exponent}[]} sorted, biggest to smallest gap.
     */
    getSuggestions() : {location : number, efficiency : number, exponent: Exponent}[] {

        return this.array.map((item, idx) => {
            return {
                exponent: new Exponent(idx),
                efficiency: (item)? this.efficiency(item.key, idx) : Math.abs(Chordoid.lookupTable[idx]/2),
                location: this.rerelativize(Chordoid.lookupTable[idx]),
            }
        }).sort((a,b)=>b.efficiency - a.efficiency);
    }

    all() : T[]{
        return this.array.filter(e => e).map(e => e.obj);
    }

}

export class Exponent extends Number{
    constructor(exponent : number){
        if(
            Math.abs(exponent) != exponent ||
            exponent < 0  ||
            exponent >= Chordoid.lookupTable.length
        ) throw "invalid exponent";
        super(exponent);
    }
}