import {Test} from "./modules/test/Test";
import {PrivateKey, VerDoc} from "./modules/crypto/PrivateKey";
import {DataLink} from "./modules/datalink/DataLink";
import {TransmissionControl} from "./modules/transmissioncontrol/TransmissionControl";
import {Chordoid} from "./modules/network/arctable/Chordioid";
import {Arctable} from "./modules/network/arctable/Arctable";
import {NetworkAddress} from "./modules/network/NetworkAddress";
import {NetworkInternal} from "./modules/network/NetworkInternal";
import {NResponse} from "./modules/network/NResponse";
import {NetLink} from "./modules/network/NetLink";
import {NRequest} from "./modules/network/NRequest";
import {Network} from "./modules/network/Network";
import {Synchronicity} from "./modules/tools/Synchronicity";

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

        let a = new TransmissionControl(m => "a reflects: "+m);
        let b = new TransmissionControl(async m => "b returns: " + await b.send("b reflects: "+m));

        a.complete(await b.answer(await a.offer()));

        await a.ready;

        let response = await a.send("aaa");

        cr.assert("dual tcp bounce", response, "b returns: a reflects: b reflects: aaa");

        let c = new TransmissionControl(m => Promise.reject([40,50,60]));
        let d = new TransmissionControl(async m => "nothing");

        c.complete(await d.answer(await c.offer()));

        await d.ready;

        cr.assert("remote handling propagation",
            JSON.stringify(await d.send("boop").catch(e => e)),
            JSON.stringify([200, 40, 50, 60]));

        return cr.run();
    })(), // Transmission Control

    (async ()=>{let ct = new Test("Arctable");

        let maxSize = 30;

        ct.assert("distance diff<1e-16", Arctable.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);

        let ti = new Arctable(0.5);
        ct.assert("indicer", ti.ltoi(0), 0);
        ct.assert("indicer", ti.ltoi(1), 0);
        ct.assert("indicer", ti.ltoi(0.49999), 6);
        ct.assert("indicer", ti.ltoi(0.5), 14);
        ct.assert("indicer", ti.ltoi(0.50001), 22);

        let ti2 = new Arctable(0.75);
        ct.assert("indicer 2", ti2.ltoi(0.25), 0);
        ct.assert("indicer 2", ti2.ltoi(0.74999), 6);
        ct.assert("indicer 2", ti2.ltoi(0.75), 14);
        ct.assert("indicer 2", ti2.ltoi(0.75001), 22);

        let to = {a: 0.111, b: 234512};
        ct.assert("fetch 0", ti2.get(to.a), null);
        ct.assert("add 1", ti2.add(to.a, to), null);
        ct.assert("fetch 1", ti2.get(to.a), to);
        ct.assert("fetch 1", ti2.get(0.9), to);
        ct.assert("fetch 1", ti2.get(0.74), to);

        let to2 = {a: 0.1109, b: 234512}; //higher efficiency same index
        ct.assert("add 2 (attempt overwrite)", ti2.add(to2.a, to2), null);
        ct.assert("fetch 2", ti2.get(to.a), to2);
        ct.assert("fetch 2.2", ti2.get(to2.a), to2);

        ct.assert("suggestion order", ti2.getSuggestions()[0].efficiency, ti2.getSuggestions()[1].efficiency, (a, b) => a > b);

        ct.assert("rem 1 arced", ti2.remove(to.a), to);
        ct.assert("rem 1", ti2.remove(to2.a), to2);
        ct.assert("rem 1 empty", ti2.remove(to2.a), null);

        let ti3 = new Arctable(0.5, maxSize);
        for(let i = 0; i<maxSize; i++){
            let item = {a: Math.random(), b: Math.random()};
            ct.assert("battery item "+i+":", !!ti3.add(item.a, item), false)
        }
        let item = {a: Math.random(), b: Math.random()};
        ct.assert("completely full ejected something:", !!ti3.add(item.a, item), true);


        return ct.run();
    })(), // chordioid

    (async ()=>{let cr = new Test("NetworkInternal");
        (window as any).NetworkInternal = NetworkInternal;
        (window as any).NetworkAddress = NetworkAddress;
        (window as any).NResponse = NResponse;

        let a = new NetworkInternal((msg)=> new NResponse("a replies to "+msg.original, null), new PrivateKey());
        let b = new NetworkInternal((msg)=> new NResponse("b replies to "+msg.original, null), new PrivateKey());
        let c = new NetworkInternal((msg)=> new NResponse("c replies to "+msg.original, null), new PrivateKey());


        cr.assert("network is empty", JSON.stringify(a.broadcast("A broadcasts")), JSON.stringify([]));

        a.complete(await b.answer(await a.offer()));
        b.complete(await c.answer(await b.offer()));
        c.complete(await a.answer(await c.offer()));

        await new Promise(a => setTimeout(()=>a(), 1000));

        await a.ready;
        await b.ready;
        await c.ready;



        cr.assert("network is empty", (await a.broadcast("A broadcasts")).length, 2);

        return cr.run();
    })(), // NetworkInternal

    (async ()=>{let cr = new Test("Network");
        (window as any).Network = Network;
        (window as any).NetworkAddress = NetworkAddress;

        class TestNet extends Network{
            bcc;
            constructor(){
                let key = new PrivateKey();
                super(key);
                this.bcc = this.addBroadcastKernel<string>(async (msg)=>{
                    console.log(await key.getPublicHash()+"says I RECEIVED THIS BROADCAST!: "+msg);
                    return true;
                })
            }
        }
        (window as any).TestNet = TestNet;

        let a = new TestNet();
        let b = new TestNet();
        let c = new TestNet();
        let d = new TestNet();

        a.complete(await b.answer(await a.offer()));
        b.complete(await c.answer(await b.offer()));
        c.complete(await a.answer(await c.offer()));
        d.complete(await c.answer(await d.offer()));

        await new Promise(a => setTimeout(()=>a(), 1000));

        await a.ready;
        await b.ready;
        await c.ready;
        await d.ready;

        cr.assert("successful broadcast sent", (await d.bcc("D broadcasts")).length, 1);

        return cr.run();
    })(), // NetworkInternal


]).then(a => {
    console.log("Testing complete.");
    window.close()
}).catch(e=>{
    console.error("CRITICAL FAILURE! Uncaught Exception: ",e);
    window.close()
});



