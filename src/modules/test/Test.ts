export class Test{
    name : string;
    tests : (()=>Promise<boolean>)[] = [];
    private item : number = 0; // current item
    private passed : number = 0;
    constructor(name : string) {
        this.name = name;
    }
    private pass() : boolean{
        this.passed++;
        return true;
    }
    private fail(str: string, objects: any[]) : boolean{
        console.log("FAILED ("+(++this.item)+"/"+this.tests.length+")",
            str, objects);
        return false;
    }

    assert(name : string, a : any, b : any, comparator : (a, b)=>boolean = (a,b)=>a===b){
        this.tests.push(async ()=>{
            if(comparator(await a, await b)){
                return this.pass();
            } else {
                return this.fail("assert: " + name, [await a, await b]);
            }
        });
    }
    async run(){
        this.item = 0;
        this.passed = 0;
        await Promise.all(this.tests.map(e => e()));
        console.log(((this.passed == this.tests.length)? "Passed " : "FAILED! (")+this.passed+"/"+this.tests.length+"). in "+this.name+".");
    }
}