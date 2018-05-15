import {Test} from "./modules/test/Test";
import {Chordoid1} from "./modules/chordoid/Chordoid1";
import {PrivateKey, VerDoc} from "./modules/crypto/PrivateKey";
import {Connection} from "./modules/connection/Connection";
let printf = (str : string) => {
    var h = document.createElement("div");
    var t = document.createTextNode(str);
    h.appendChild(t);
    document.body.appendChild(h);
};

(async ()=>{
    let ct = new Test("Chord", printf);

    ct.assert("distance diff<1e-16", Chordoid1.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);

    let ti = new Chordoid1(0.5, 1);
    ct.assert("indicer", ti.ltoi(0), 0);
    ct.assert("indicer", ti.ltoi(1), 0);
    ct.assert("indicer", ti.ltoi(0.49999), 6);
    ct.assert("indicer", ti.ltoi(0.5), 14);
    ct.assert("indicer", ti.ltoi(0.50001), 22);

    let ti2 = new Chordoid1(0.75, 1);
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
    let reconstructed = await VerDoc.reconstruct(verdoc.original);

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


    let a = new Connection();
    let ac = a.createChannel<A,B>(response);
    let b = new Connection();
    let bc = b.createChannel<A,B>(response);

    let offer = await a.offer();
    let answer = await b.answer(offer);
    a.complete(answer);

    await a.open;

    cn.assert("connection ab echo works", await ac({a: "hello"}).then(m=>m.b), "hello");
    cn.assert("connection ba echo works", await bc({a: "hello"}).then(m=>m.b), "hello");

    cn.run();
})(); // connection test




