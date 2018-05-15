export class Test{
    name : string;
    tests : (()=>Promise<boolean>)[] = [];
    private item : number = 0; // current item
    private passed : number = 0;
    outputFunction : (output : string)=>void;
    constructor(name : string, outputFunction : (output : string) => void) {
        this.name = name;
        this.outputFunction = outputFunction;
    }
    private pass(str: string, objects: any[]) : boolean{
        this.passed++;
        console.log("%c✔", 'color: green;',
            "("+(++this.item)+"/"+this.tests.length+")",
            str,
            "items: ", objects);
        return false;
    }
    private fail(str: string, objects: any[]) : boolean{
        console.log("%c✖", 'color: red;',
            "("+(++this.item)+"/"+this.tests.length+")",
            str,
            "items: ", objects);
        return false;
    }

    assert(name : string, a : any, b : any, comparator : (a, b)=>boolean = (a,b)=>a===b){
        this.tests.push(async ()=>{
            if(comparator(await a, await b)){
                return this.pass("assert: " + name, [await a, await b]);
            } else {
                return this.fail("assert: " + name, [await a, await b]);
            }
        });
    }
    async run(){
        this.item = 0;
        this.passed = 0;
        console.log("Starting test: "+ this.name+" ...");
        await Promise.all(this.tests.map(e => e()));
        console.log("Passed "+this.passed+"/"+this.tests.length+". This concludes the test of "+this.name+".");
        this.outputFunction &&
            this.outputFunction(
                ((this.passed == this.tests.length)? "Success!" : "Failed.")
                +" ("+this.passed+"/"+this.tests.length+"): "+this.name+" testing complete.");
    }
}