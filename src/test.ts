import {Test} from "./modules/test/Test";
import {Chordoid} from "./modules/chordoid/Chordoid";
import {PrivateKey, VerDoc} from "./modules/crypto/PrivateKey";
import {Connection} from "./modules/connection/Connection";
import {TypedConnection} from "./modules/connection/TypedConnection";
import {KreisInternal} from "./modules/kreis/KreisInternal";
import {ConnectionError} from "./modules/connection/ConnectionError";
import {NetworkInternal} from "./modules/network/NetworkInternal";
import {NetworkConnection} from "./modules/network/NetworkConnection";
import {Network} from "./modules/network/Network";
import {Time} from "./modules/tools/Time";
let printf = (str : string) => {
    var h = document.createElement("div");
    var t = document.createTextNode(str);
    h.appendChild(t);
    document.body.appendChild(h);
};
(window as any).PrivateKey = PrivateKey;
(window as any).Network = Network;

(async ()=>{
    let ct = new Test("Chord", printf);

    ct.assert("distance diff<1e-16", Chordoid.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);

    let ti = new Chordoid(0.5, 1);
    ct.assert("indicer", ti.ltoi(0), 0);
    ct.assert("indicer", ti.ltoi(1), 0);
    ct.assert("indicer", ti.ltoi(0.49999), 6);
    ct.assert("indicer", ti.ltoi(0.5), 14);
    ct.assert("indicer", ti.ltoi(0.50001), 22);

    let ti2 = new Chordoid(0.75, 1);
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

    let to2 = {a: 0.1109, b: 234512};
    ct.assert("add 2 (overwrite)", ti2.add(to2.a, to2), to);
    ct.assert("fetch 2", ti2.get(to2.a), to2);

    ct.assert("suggestion order", ti2.getSuggestions()[0].efficiency, ti2.getSuggestions()[1].efficiency, (a, b) => a > b);

    ct.assert("rem 1 fail", ti2.remove(to.a), null);
    ct.assert("rem 1", ti2.remove(to2.a), to2);
    ct.assert("rem 1 empty", ti2.remove(to2.a), null);
    ct.run();
})(); // data structure (chordioid1) test

(async ()=>{
    let cr = new Test("Crypto", printf);

    let to = {a: 0.111, b: 234512};

    let prk = new PrivateKey();
    let verdoc = await prk.sign(to);
    let reconstructed = await VerDoc.reconstruct(verdoc);

    cr.assert("verdoc key comparison", verdoc.key.hashed(), reconstructed.key.hashed());
    cr.assert("verdoc data comparison", JSON.stringify(verdoc.data), JSON.stringify(reconstructed.data));

    cr.run();
})(); // crypto test

(async ()=>{
    let cn = new Test("Connection", printf);

    class A{
        a : string;
    }
    class B{
        b : string;
    }

    let response = ( m : A ) : Promise<B> => {return Promise.resolve({b: m.a})};
    let delayedResponse = ( m : A ) : Promise<B> => {return new Promise(resolve=>setTimeout(()=>resolve({b: m.a}),1000))};


    let a = new TypedConnection();
    let ac = a.createChannel<A,B>(response);
    let acd = a.createChannel<A,B>(delayedResponse);
    let b = new TypedConnection();
    let bc = b.createChannel<A,B>(response);
    let bcd = b.createChannel<A,B>(delayedResponse);

    let offer = await a.offer();
    let answer = await b.answer(offer);
    a.complete(answer);

    await a.open;

    cn.assert("connection ab echo works", await ac({a: "hello"}).then(m=>m.b), "hello");
    cn.assert("connection ba echo works", await bc({a: "hello"}).then(m=>m.b), "hello");

    cn.assert( "outbound limitation works",
        await Promise.all(new Array(100).fill({a: "u"}).map(e => acd(e))).catch(e => e.type),
        ConnectionError.OutbufferExhausted().type
    );

    let requests =  new Array(99).fill(1).map((e,i) => bcd({a:"r"+i}).catch(e=>e.type == 8 && i));
    a.close();

    cn.assert( "bounce works",
        JSON.stringify(await Promise.all(requests)),
        JSON.stringify(new Array(99).fill(8).map((e,i)=>i))
    );





    cn.run();
})(); // connection test

(async ()=>{
    let cn = new Test("KreisInternal", printf);

    let k = new Array(20).fill(null).map(_=> new KreisInternal());
    let kn = new KreisInternal();

    k.reduce((a,e)=>{(async ()=>e.complete(await a.answer(await e.offer(-1))))(); return e}, kn);
    //k[0].complete(await k[1].answer(await k[0].offer(-1)));

    await k[0].open;

    k[0].shout("eyy");
    k[0].sync();

    cn.assert("kreis sync works", (await k[0].sync()).length, 1);

    cn.run();

}); // network test

(async ()=>{
    let cn = new Test("Network", printf);

    let a = new Network(new PrivateKey());
    let b = new Network(new PrivateKey());
    let c = new Network(new PrivateKey());

    a.link(b);
    b.link(c);
    c.link(a);

    await a.bootstrapped;

    cn.assert("remote time fetch", ~~((await Promise.all(a.sync()))[0].millis/10), ~~(new Time().millis/10));

    //hardening
    let num = 20;

    let ar = new Array(num).fill(1).map( ()=> new Network(new PrivateKey()));

    ar.reduce((async (p, n, i) =>{
        await p;
        n.link(c);
        return n;
    }), Promise.resolve(c));

    (window as any).ar = ar;




    cn.run();
})(); // network test



