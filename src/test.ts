import {Test} from "./modules/test/Test";
import {PrivateKey, VerDoc} from "./modules/crypto/PrivateKey";
import {DataLink} from "./modules/datalink/DataLink";
import {TransmissionControl} from "./modules/transmissioncontrol/TransmissionControl";
import {RouterPorts} from "./modules/router/RouterPorts";
import {Cable} from "./modules/router/Cable";
import {RouterCableFactory} from "./modules/router/RouterCableFactory";
import {RouterDamned} from "./modules/router/RouterDamned";
import {sleep} from "./modules/tools/sleep";
import {Router} from "./modules/router/Router";


Promise.all([
    (async ()=>{let cr = new Test("Crypto");

        let to = {a: 0.111, b: 234512};

        let prk = new PrivateKey();
        let verdoc = await prk.sign(to);
        let reconstructed = await VerDoc.reconstruct(verdoc);

        cr.assert("verdoc key comparison", verdoc.key.hashed(), reconstructed.key.hashed());
        cr.assert("verdoc data comparison", JSON.stringify(verdoc.data), JSON.stringify(reconstructed.data));

        return cr.run();
    })(), // crypto test

    (async ()=>{let cr = new Test("DataLink");

        let transmitted = await new Promise(async resolve => {
            let a = new DataLink(m => resolve(m.data));
            let b = new DataLink(m => b.send("b responds to "+m.data));

            a.complete(await b.answer(await a.offer()));

            await b.ready;

            a.send("a says beep");
        });
        cr.assert("simple data bounce", transmitted, "b responds to a says beep");

        //// test memory usage - it's static.
        // for(let i = 0; i<1000; i++){
        //     let a = new DataLink(m => console.log);
        //     let b = new DataLink(m => console.log);
        //     a.complete(await b.answer(await a.offer()));
        //     await a.ready;
        //     a.close();
        // }

        return cr.run();
    })(), // Data Link

    (async ()=>{let cr = new Test("Transmission Control");

        let a = new TransmissionControl(async m => "a reflects: "+m);
        let b = new TransmissionControl(async m => "b returns: " + await b.send("b reflects: "+m));

        a.complete(await b.answer(await a.offer()));

        await a.ready;

        let response = await a.send("aaa");

        cr.assert("dual tcp bounce", response, "b returns: a reflects: b reflects: aaa");
        let f = null;

        let c = new TransmissionControl(m => Promise.reject("failure"));
        let d = new TransmissionControl(async m => f());

        c.complete(await d.answer(await c.offer()));

        await d.ready;

        cr.assert("remote handling propagation",
            JSON.stringify(await d.send("boop").catch(e => e)), '"failure"');
        cr.assert("remote handling propagation",
            JSON.stringify(await c.send("boop").catch(e => e)), '"TypeError: f is not a function"');

        return cr.run();
    })(), // Transmission Control

    (async ()=>{let cr = new Test("Router Ports");

        let ak = new PrivateKey();
        let bk = new PrivateKey();
        let ck = new PrivateKey();

        let a = new RouterCableFactory(ak);
        let as1 = (a as any).createPort(async (msg) =>"a1 reflects: "+msg);
        let as2 = (a as any).createPort(async (msg) =>"a2 reflects: "+msg);
        let asb = (a as any).createFrequency(async (msg) =>"ab reflects: "+msg);
        let b = new RouterCableFactory(bk);
        let bs1 = (b as any).createPort(async (msg) =>"b1 reflects: "+msg);
        let bs2 = (b as any).createPort(async (msg) =>"b2 reflects: "+msg);
        let bsb = (b as any).createFrequency(async (msg) =>"bb reflects: "+msg);
        let c = new RouterCableFactory(ck);
        let cs1 = (c as any).createPort(async (msg) =>"c1 reflects: "+msg);
        let cs2 = (c as any).createPort(async (msg) =>"c2 reflects: "+msg);
        let csb = (c as any).createFrequency(async (msg) =>"cb reflects: "+msg);

        a.generateSocket(b.provideConnector());

        await a.ready;

        cr.assert("channel test 1", await as1("as1", 0.5, 1), "b1 reflects: as1");

        await c.generateSocket(a.provideConnector());

        await b.ready;

        cr.assert("channel test 2", await bs1("bs1", 0.5, 1), "a1 reflects: bs1");
        cr.assert("channel test 3", await bs2("bs2", 0.5, 1), "a2 reflects: bs2");

        await c.ready;

        cr.assert("channel test 3", JSON.stringify(
            (await Promise.all(asb("asb", 0.5, 1)))
                .sort((a,b) => (a as string).localeCompare(b as string))),
            JSON.stringify([ 'bb reflects: asb', 'cb reflects: asb' ])
            );


        return cr.run();
    })(), // Router Ports

    (async ()=>{let cr = new Test("Router Daemon");

        class RouterTest extends RouterDamned{
            b1: (msg: string) => Promise<String>[];
            c1: (msg: string, target: number, tolerance: number) => Promise<String>;
            c2: (msg: string, target: number, tolerance: number) => Promise<String>;
            constructor(name : string){
                super(new PrivateKey());

                this.c1 = this.createPort(async (msg) =>name+"c1 reflects: "+msg);
                this.c2 = this.createPort(async (msg) =>name+"c2 reflects: "+msg);
                this.b1 = this.createFrequency(async (msg) =>name+"b1 reflects: "+msg);
            }
        }

        let a = new RouterTest("a");
        let b = new RouterTest("b");
        let c = new RouterTest("c");
        let d = new RouterTest("d");
        let e = new RouterTest("e");

        a.generateSocket(b.provideConnector());
        b.generateSocket(c.provideConnector());
        c.generateSocket(d.provideConnector());
        d.generateSocket(e.provideConnector());

        await a.ready;
        await b.ready;
        await c.ready;
        await d.ready;
        await e.ready;

        await sleep(5000);


        cr.assert("daemon test 1", JSON.stringify(
            (await Promise.all(a.b1("asb")))
                .sort((a,b) => (a as string).localeCompare(b as string))),
            JSON.stringify([ 'bb reflects: asb', 'cb reflects: asb' ])
        );

        // (window as any).a = a;
        // (window as any ).b = b;
        // (window as any ).c = c;


        return cr.run();
    })(), // Router Daemon


    (async ()=>{let cr = new Test("Router");

        class RouterTest extends Router{
            b1: (msg: string) => void;
            constructor(name : string){
                super(new PrivateKey());
                this.b1 = this.createBroadcastChannel(msg => console.log(msg));
            }
        }

        let a = new RouterTest("a");
        let b = new RouterTest("b");
        let c = new RouterTest("c");
        let d = new RouterTest("d");
        let e = new RouterTest("e");

        a.generateSocket(b.provideConnector());
        b.generateSocket(c.provideConnector());
        c.generateSocket(d.provideConnector());
        d.generateSocket(e.provideConnector());

        await a.ready;
        await b.ready;
        await c.ready;
        await d.ready;
        await e.ready;

        await sleep(5000);

        (window as any).a = a;
        (window as any ).b = b;
        (window as any ).c = c;


        return cr.run();
    })(), // Router


]).then(a => {
    console.log("Testing complete.");
    window.close()
}).catch(e=>{
    console.error("CRITICAL FAILURE! Uncaught Exception: ",e);
    window.close()
});



