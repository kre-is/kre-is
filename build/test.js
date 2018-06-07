/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./modules/crypto/PrivateKey.ts":
/*!**************************************!*\
  !*** ./modules/crypto/PrivateKey.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utf8buffer_1 = __webpack_require__(/*! ../tools/utf8buffer */ "./modules/tools/utf8buffer.ts");
class PrivateKey {
    constructor() {
        this.version = 2;
        this.publicKey = null;
        this.ready = window.crypto.subtle.generateKey({
            name: "ECDSA",
            namedCurve: "P-384",
        }, false, ["sign", "verify"]).then(keys => {
            this.privateKey = keys.privateKey;
            return window.crypto.subtle.exportKey("jwk", keys.publicKey);
        }).then(jwk => {
            this.publicKey = new PublicKey(jwk);
            return this.publicKey.ready;
        });
    }
    sign(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            let data = JSON.stringify(obj);
            let puk = this.publicKey.toJSON();
            let header = String.fromCodePoint(this.version, puk.length, data.length);
            let signable = utf8buffer_1.utf8Encoder.encode(header + puk + data);
            let sigbuffer = yield window.crypto.subtle.sign({
                name: "ECDSA",
                hash: { name: "SHA-384" },
            }, this.privateKey, signable);
            let checksm = utf8buffer_1.utf8Encoder.encode(header + puk + data).reduce((a, c, i) => a + c * i, 0);
            let uft = new Uint8Array(sigbuffer);
            let chec2 = new Uint8Array(sigbuffer).reduce((a, c, i) => a + c * i, 0);
            let vd = new VerDoc(header + puk + data + String.fromCodePoint(...new Uint8Array(sigbuffer)));
            vd.key = this.publicKey;
            vd.data = obj;
            vd.signature = JSON.stringify(new Uint8Array(sigbuffer));
            return vd;
        });
    }
    getPublicHash() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            yield this.publicKey.ready;
            return this.publicKey.hashed();
        });
    }
}
exports.PrivateKey = PrivateKey;
/**
 * VerDoc DAO
 */
class RawDoc extends String {
}
exports.RawDoc = RawDoc;
class VerDoc extends RawDoc {
    static reconstruct(rawDoc) {
        return __awaiter(this, void 0, void 0, function* () {
            let version = rawDoc.codePointAt(0);
            switch (version) {
                case 2: {
                    let header = rawDoc.substring(0, 3);
                    let puk = rawDoc.substr(3, rawDoc.codePointAt(1));
                    let data = rawDoc.substr(3 + rawDoc.codePointAt(1), rawDoc.codePointAt(2));
                    let sig = rawDoc.substr(3 + rawDoc.codePointAt(1) + rawDoc.codePointAt(2));
                    let key = yield new PublicKey(JSON.parse(puk)).ready;
                    let checksm = utf8buffer_1.utf8Encoder.encode(header + puk + data).reduce((a, c, i) => a + c * i, 0);
                    let uft = utf8buffer_1.utf8Encoder.encode(sig);
                    let chec2 = utf8buffer_1.utf8Encoder.encode(sig).reduce((a, c, i) => a + c * i, 0);
                    if (yield key.verify(utf8buffer_1.utf8Encoder.encode(header + puk + data), new Uint8Array(sig.split('').map(c => c.codePointAt(0))))) {
                        let vd = new VerDoc(rawDoc);
                        vd.signature = sig;
                        vd.key = key;
                        vd.data = JSON.parse(data);
                        return vd;
                    }
                    return Promise.reject("bad document");
                }
                default: return Promise.reject("version unsupported: " + version);
            }
        });
    }
}
exports.VerDoc = VerDoc;
// hash P-384 SPKI into (0,1) float
function SPKItoNumeric(spki) {
    return new Uint8Array(spki).
        slice(-96).
        reverse().
        reduce((a, e, i) => a + e * Math.pow(256, i), 0) /
        Math.pow(256, 96);
}
class PublicKey {
    constructor(jwk) {
        let protoJWK = { "crv": "P-384", "ext": true, "key_ops": ["verify"], "kty": "EC", "x": jwk["x"], "y": jwk["y"] };
        this.floating = NaN;
        this.jwk = protoJWK;
        this.ready = window.crypto.subtle.importKey("jwk", this.jwk, {
            name: "ECDSA",
            namedCurve: "P-384",
        }, true, ["verify"]).then(publicCryptoKey => {
            this.publicCryptoKey = publicCryptoKey;
            return window.crypto.subtle.exportKey("spki", this.publicCryptoKey).then(spki => {
                this.floating = SPKItoNumeric(spki);
            });
        }).then(() => this);
    }
    hashed() {
        if (isNaN(this.floating))
            throw Error("Not Ready.");
        return this.floating;
    }
    toJSON() {
        return JSON.stringify({ "x": this.jwk["x"], "y": this.jwk["y"] });
    }
    verify(data, signature) {
        return window.crypto.subtle.verify({
            name: "ECDSA",
            hash: { name: "SHA-384" },
        }, this.publicCryptoKey, signature, data);
    }
    static fromString(jwkstring) {
        return new PublicKey(JSON.parse(jwkstring));
    }
}
exports.PublicKey = PublicKey;


/***/ }),

/***/ "./modules/datalink/DataLink.ts":
/*!**************************************!*\
  !*** ./modules/datalink/DataLink.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __webpack_require__(/*! ../modules-old/datalink/config */ "./modules/modules-old/datalink/config.ts");
class DataLink extends RTCPeerConnection {
    constructor(onmessage) {
        super(config_1.datalinkc);
        this.datachannel = this
            .createDataChannel("data", { negotiated: true, id: 0, ordered: false });
        this.ready = new Promise(resolve => this.datachannel.onopen = () => resolve());
        this.closed = new Promise(resolve => this.datachannel.onclose = () => resolve());
        this.datachannel.onmessage = onmessage;
    }
    send(msg) {
        this.datachannel.send(msg);
    }
    offer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setLocalDescription(yield this.createOffer());
            // promise to wait for the sdp
            return new Promise((accept) => {
                this.onicecandidate = event => {
                    if (event.candidate)
                        return;
                    accept(this.localDescription.sdp);
                };
            });
        });
    }
    answer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setRemoteDescription(new RTCSessionDescription({
                type: "offer",
                sdp: offer
            }));
            this.setLocalDescription(yield this.createAnswer());
            // promise to wait for the sdp
            return new Promise((accept) => {
                this.onicecandidate = event => {
                    if (event.candidate)
                        return;
                    accept(this.localDescription.sdp);
                };
            });
        });
    }
    complete(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setRemoteDescription(new RTCSessionDescription({
                type: "answer",
                sdp: answer
            }));
        });
    }
    close() {
        super.close();
    }
}
exports.DataLink = DataLink;
class Offer extends String {
}
exports.Offer = Offer;
class Answer extends String {
}
exports.Answer = Answer;


/***/ }),

/***/ "./modules/modules-old/datalink/config.ts":
/*!************************************************!*\
  !*** ./modules/modules-old/datalink/config.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.datalinkc = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};


/***/ }),

/***/ "./modules/router/Cable.ts":
/*!*********************************!*\
  !*** ./modules/router/Cable.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TransmissionControl_1 = __webpack_require__(/*! ../transmissioncontrol/TransmissionControl */ "./modules/transmissioncontrol/TransmissionControl.ts");
class Cable extends TransmissionControl_1.TransmissionControl {
    constructor() {
        super((e) => { throw e; });
    }
    offer() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            this.dateOfCreation = new Date().getTime();
            return _super("offer").call(this);
        });
    }
    answer(offer) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            this.dateOfCreation = new Date().getTime();
            return _super("answer").call(this, offer);
        });
    }
}
exports.Cable = Cable;


/***/ }),

/***/ "./modules/router/RouterChordFactory.ts":
/*!**********************************************!*\
  !*** ./modules/router/RouterChordFactory.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterPorts_1 = __webpack_require__(/*! ./RouterPorts */ "./modules/router/RouterPorts.ts");
const Cable_1 = __webpack_require__(/*! ./Cable */ "./modules/router/Cable.ts");
const Arctable_1 = __webpack_require__(/*! ./arctable/Arctable */ "./modules/router/arctable/Arctable.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
class RouterChordFactory extends RouterPorts_1.RouterPorts {
    constructor(key) {
        super();
        this.sign = (o) => key.sign(o);
        let self = this;
        this.relayOffer = this.createPort((msg) => __awaiter(this, void 0, void 0, function* () {
            return yield self.provideConnector()(msg);
        }));
        this.address = key.getPublicHash();
        this.address.then(hash => self.table = new Arctable_1.Arctable(hash));
    }
    /**
     *
     * @param {Connector} connector
     * @returns {Promise<Cable>} when ready for transmit
     */
    generateSocket(connector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.address;
            let self = this;
            let cable = new Cable_1.Cable();
            let suggestion = this.table.getSuggestions()[0];
            // @todo: investigate the utility of this
            // let suggestion =  this.table.getSuggestions()[
            //     Math.floor(Math.random()**10 * this.table.maxSize)
            //     ];
            let offer = yield this.sign({
                target: suggestion.exponent,
                tolerance: suggestion.efficiency,
                sdp: yield cable.offer()
            });
            try {
                let answer = yield PrivateKey_1.VerDoc.reconstruct(yield connector(offer));
                cable.key = answer.key;
                yield cable.complete(answer.data);
            }
            catch (e) {
                cable.close();
                throw "Connection failed: " + e;
            }
            yield cable.ready;
            cable.closed.then(() => self.detach(cable));
            self.attach(cable);
            return cable.ready;
        });
    }
    provideConnector() {
        let self = this;
        return (offer) => __awaiter(this, void 0, void 0, function* () {
            let doc = yield PrivateKey_1.VerDoc.reconstruct(offer);
            let target = Arctable_1.Arctable.dereference(doc.data.target, doc.key.hashed());
            let distance = Arctable_1.Arctable.distance(target, yield self.address);
            if (distance >= doc.data.tolerance)
                return self.relayOffer(offer, target, distance);
            if (!this.table.isDesirable(doc.key.hashed()))
                return self.relayOffer(offer, target, distance);
            let cable = new Cable_1.Cable();
            cable.key = doc.key;
            cable.ready.then(() => self.attach(cable));
            cable.closed.then(() => self.detach(cable));
            return self.sign(yield cable.answer(doc.data.sdp));
        });
    }
}
exports.RouterChordFactory = RouterChordFactory;


/***/ }),

/***/ "./modules/router/RouterInternal.ts":
/*!******************************************!*\
  !*** ./modules/router/RouterInternal.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
class RouterInternal {
    constructor() {
        this.ready = new Future_1.Future();
    }
    dispatch(msg, target, tolerance) {
        let closest = this.table.getWithin(target, tolerance);
        if (!closest)
            throw "empty network";
        return this.table.getWithin(target, tolerance).send(msg);
    }
    broadcast(msg) {
        return this.table.getAll().map(c => c.send(msg));
    }
    attach(cable) {
        let self = this;
        cable.closed.then(c => self.detach(c));
        let ejected = this.table.add(cable.key.hashed(), cable);
        ejected && ejected.close();
        this.ready.resolve(this);
    }
    detach(cable) {
        let ejected = this.table.remove(cable.key.hashed());
        ejected && ejected.close();
    }
}
exports.RouterInternal = RouterInternal;


/***/ }),

/***/ "./modules/router/RouterPorts.ts":
/*!***************************************!*\
  !*** ./modules/router/RouterPorts.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterInternal_1 = __webpack_require__(/*! ./RouterInternal */ "./modules/router/RouterInternal.ts");
class RouterPorts extends RouterInternal_1.RouterInternal {
    constructor() {
        super(...arguments);
        this.channels = [];
    }
    sorter(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.channels[msg.codePointAt(0)](msg.slice(1));
        });
    }
    attach(cable) {
        let self = this;
        cable.onmessage = (msg) => { return self.sorter(msg); };
        super.attach(cable);
    }
    createPort(onmessage) {
        let portID = this.channels.length;
        this.channels.push(onmessage);
        let self = this;
        return (msg, target, tolerance) => {
            return self.dispatch(String.fromCodePoint(portID) + msg, target, tolerance);
        };
    }
    /**
     * communicates with all adjacent nodes.
     * @param {OnMessage} onmessage
     * @param maxBroadcastBuffer
     * @returns {OnMessage}
     */
    createFrequency(onmessage, maxBroadcastBuffer) {
        let portID = this.channels.length;
        this.channels.push(onmessage);
        let self = this;
        return (msg) => {
            return self.broadcast(String.fromCodePoint(portID) + msg);
        };
    }
}
exports.RouterPorts = RouterPorts;


/***/ }),

/***/ "./modules/router/arctable/Arctable.ts":
/*!*********************************************!*\
  !*** ./modules/router/arctable/Arctable.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Chordioid_1 = __webpack_require__(/*! ./Chordioid */ "./modules/router/arctable/Chordioid.ts");
class Arctable extends Chordioid_1.Chordoid {
    constructor(center, maxSize = Chordioid_1.Chordoid.lookupTable.length - 1) {
        super(center);
        this.purgatory = []; // stores pending addresses;
        this.deepStored = 0;
        this.maxSize = maxSize;
    }
    add(location, object) {
        if (this.isDesirable(location)) {
            let idx = this.ltoi(location);
            let extracted = this.array[idx];
            this.array[idx] = { key: location, obj: object };
            if (!extracted) {
                this.deepStored++;
                return null;
            }
            location = extracted.key;
            object = extracted.obj;
        }
        let idx = this.ltoi(location);
        let efficiency = this.efficiency(location, idx);
        this.purgatory.push({ obj: object, key: location, eff: efficiency, idx: idx });
        if (this.purgatory.length <= this.maxSize - this.deepStored)
            return null;
        this.purgatory.sort((a, b) => a.eff - b.eff);
        return this.purgatory.pop().obj;
    }
    remove(location) {
        let removed = super.remove(location);
        if (removed) {
            this.deepStored--;
            //find a replacement
            let idx = this.ltoi(location);
            let candidates = this.purgatory.filter(e => e.idx == idx);
            if (candidates.length == 0)
                return removed;
            candidates.sort((a, b) => a.eff - b.eff);
            let pindex = this.purgatory.findIndex(e => e.key == location);
            let candidate = this.purgatory.splice(pindex, 1)[0];
            this.deepStored++;
            if (super.add(candidate.key, candidate.obj))
                throw "fatal logic error in arctable";
            return removed;
        }
        else {
            let pindex = this.purgatory.findIndex(e => e.key == location);
            if (pindex == -1)
                return null;
            return this.purgatory.splice(pindex, 1)[0].obj;
        }
    }
    getAll() {
        return [...this.array.filter(e => e), ...this.purgatory].map(e => e.obj);
    }
    approach(location) {
        return this.getWithin(location, this.distance(location));
    }
    getSuggestions() {
        if (this.deepStored == 0) {
            return [{
                    location: (this.locus + 0.5) % 1,
                    exponent: 0,
                    efficiency: 0.9999999
                }, ...super.getSuggestions()];
        }
        return super.getSuggestions();
    }
}
exports.Arctable = Arctable;


/***/ }),

/***/ "./modules/router/arctable/Chordioid.ts":
/*!**********************************************!*\
  !*** ./modules/router/arctable/Chordioid.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Chordoid {
    constructor(center, circumference = 1) {
        this.locus = center;
        this.array = new Array(Chordoid.lookupTable.length - 1).fill(null);
    }
    isDesirable(location) {
        let idx = this.ltoi(location);
        if (this.array[idx]) {
            if (this.efficiency(this.array[idx].key, idx) > this.efficiency(location, idx)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
    add(location, obj) {
        let idx = this.ltoi(location);
        if (this.array[idx]) {
            if (this.efficiency(this.array[idx].key, idx) > this.efficiency(location, idx)) {
                //efficiency is worse than incoming
                let old = this.array[idx].obj;
                this.array[idx] = { key: location, obj: obj };
                return old;
            }
            else {
                //reject the object;
                return obj;
            }
        }
        else {
            this.array[idx] = { key: location, obj: obj };
            return null;
        }
    }
    /**
     * retrieve closest available object
     * @param {number} location
     * @returns {T | null}
     */
    get(location) {
        let item = this.array[this.ltoi(location, true)];
        return (item || null) && item.obj;
    }
    getWithin(location, tolerance) {
        let item = this.array[this.ltoi(location, true)];
        return (item && Chordoid.distance(item.key, location) < tolerance)
            ? item.obj
            : null;
    }
    remove(location) {
        let idx = this.ltoi(location);
        let old = this.array[idx];
        if (!old || Math.abs(old.key - location) > Chordoid.acceptableError) {
            return null;
        }
        this.array[idx] = null;
        return old.obj;
    }
    static dereference(idx, locus) {
        return (Chordoid.lookupTable[idx.valueOf()] + locus + 1) % 1;
    }
    derelativize(location) {
        console.assert(location >= 0 && location <= 1, "location: " + location);
        return ((1 + location - this.locus + 0.5) % 1) - 0.5;
        //expect in range -0.5, 0.5
    }
    rerelativize(location) {
        return (location + this.locus + 1) % 1;
    }
    static distance(a, b) {
        return Math.min(Math.abs(a - b), Math.abs(a - b + 1), Math.abs(b - a + 1));
    }
    distance(a) {
        return Chordoid.distance(this.locus, a);
    }
    efficiency(location, idx) {
        let derelativized = this.derelativize(location);
        return Chordoid.distance(Chordoid.lookupTable[idx], derelativized);
    }
    ltoi(location, skipEmpty = false) {
        let derelativized = this.derelativize(location);
        let efficiency = 1;
        let veridex = null;
        if (derelativized < 0) {
            //start with 0
            let idx = 0;
            while (efficiency > this.efficiency(location, idx)) {
                if (skipEmpty && !this.array[idx]) {
                    idx++;
                    continue;
                }
                efficiency = this.efficiency(location, idx);
                veridex = idx++;
            }
            return veridex;
        }
        else {
            // start with max
            let idx = Chordoid.lookupTable.length - 1;
            while (efficiency > this.efficiency(location, idx)) {
                if (skipEmpty && !this.array[idx]) {
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
    getSuggestions() {
        return this.array.map((item, idx) => {
            return {
                exponent: new Exponent(idx),
                efficiency: (item) ? this.efficiency(item.key, idx) : Math.abs(Chordoid.lookupTable[idx] / 2),
                location: this.rerelativize(Chordoid.lookupTable[idx]),
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
    }
    all() {
        return this.array.filter(e => e).map(e => e.obj);
    }
}
//FIXME: amp up precision to 64 bit;
Chordoid.lookupTable = [-0.5, -0.25, -0.05555555555555558, -0.0078125, -0.0008000000000000229, -0.0000643004115226109,
    -0.0000042499298761322635, -2.384185791015625e-7, -1.1615286565902494e-8, -4.999999858590343e-10,
    -1.9277190954625212e-11, -6.729616863765386e-13, -2.148281552649678e-14, -6.106226635438361e-16, 0,
    6.106226635438361e-16, 2.148281552649678e-14, 6.729616863765386e-13, 1.9277190954625212e-11,
    4.999999858590343e-10, 1.1615286565902494e-8, 2.384185791015625e-7, 0.0000042499298761322635,
    0.0000643004115226109, 0.0008000000000000229, 0.0078125, 0.05555555555555558, 0.25, 0.5];
Chordoid.locusIDX = 14; // position of the locus
Chordoid.acceptableError = 1e-16;
exports.Chordoid = Chordoid;
class Exponent extends Number {
    constructor(exponent) {
        if (Math.abs(exponent) != exponent ||
            exponent < 0 ||
            exponent >= Chordoid.lookupTable.length)
            throw "invalid exponent";
        super(exponent);
    }
}
exports.Exponent = Exponent;


/***/ }),

/***/ "./modules/test/Test.ts":
/*!******************************!*\
  !*** ./modules/test/Test.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Test {
    constructor(name) {
        this.tests = [];
        this.item = 0; // current item
        this.passed = 0;
        this.name = name;
    }
    pass() {
        this.passed++;
        return true;
    }
    fail(str, objects) {
        console.log("FAILED (" + (++this.item) + "/" + this.tests.length + ")", str, objects);
        return false;
    }
    assert(name, a, b, comparator = (a, b) => a === b) {
        this.tests.push(() => __awaiter(this, void 0, void 0, function* () {
            if (comparator(yield a, yield b)) {
                return this.pass();
            }
            else {
                return this.fail("assert: " + name, [yield a, yield b]);
            }
        }));
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.item = 0;
            this.passed = 0;
            yield Promise.all(this.tests.map(e => e()));
            console.log(((this.passed == this.tests.length) ? "Passed (" : "FAILED! (") + this.passed + "/" + this.tests.length + "). in " + this.name + ".");
        });
    }
}
exports.Test = Test;


/***/ }),

/***/ "./modules/tools/Future.ts":
/*!*********************************!*\
  !*** ./modules/tools/Future.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Essentially deferred, but it's also a promise.
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 */
class Future extends Promise {
    constructor(executor) {
        let resolver, rejector;
        let state = 0;
        super((resolve, reject) => {
            resolver = (resolution) => {
                state = 1;
                resolve(resolution);
            };
            rejector = (rejection) => {
                state = 2;
                reject(rejection);
            };
        });
        this.stateExtractor = () => {
            return state;
        };
        this.resolve = resolver;
        this.reject = rejector;
        executor && new Promise(executor).then(resolver).catch(rejector);
    }
    getState() {
        return (this.stateExtractor() == 0) ? "pending"
            : (this.stateExtractor() == 1) ? "resolved"
                : (this.stateExtractor() == 2) ? "rejected"
                    : "error";
    }
}
exports.Future = Future;


/***/ }),

/***/ "./modules/tools/utf8buffer.ts":
/*!*************************************!*\
  !*** ./modules/tools/utf8buffer.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//todo: include polyfills for Edge
exports.utf8Encoder = new TextEncoder();
exports.utf8Decoder = new TextDecoder();


/***/ }),

/***/ "./modules/transmissioncontrol/TransmissionControl.ts":
/*!************************************************************!*\
  !*** ./modules/transmissioncontrol/TransmissionControl.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __webpack_require__(/*! ./config */ "./modules/transmissioncontrol/config.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
const DataLink_1 = __webpack_require__(/*! ../datalink/DataLink */ "./modules/datalink/DataLink.ts");
var TransmissionControlError;
(function (TransmissionControlError) {
    TransmissionControlError[TransmissionControlError["ConnectionClosed"] = 100] = "ConnectionClosed";
    TransmissionControlError[TransmissionControlError["RemoteError"] = 200] = "RemoteError";
    TransmissionControlError[TransmissionControlError["ProtocolError"] = 300] = "ProtocolError";
})(TransmissionControlError || (TransmissionControlError = {}));
class TransmissionControl extends DataLink_1.DataLink {
    constructor(onmessage) {
        super(null);
        this.relayTable = new Array(config_1.transmissioncontrolc.maxMessageBuffer + 1).fill(null);
        this.onmessage = onmessage;
        const self = this;
        this.datachannel.onmessage = (msgE) => __awaiter(this, void 0, void 0, function* () {
            // step 1: what is it?
            let type = msgE.data.codePointAt(0);
            let reference = msgE.data.codePointAt(1);
            let data = msgE.data.slice(2);
            switch (type) {
                case 0:
                    self.onmessage(data)
                        .then(response => self.datachannel.send(String.fromCodePoint(1, reference) + response))
                        .catch(error => self.datachannel.send(String.fromCodePoint(2, reference) + error));
                    return;
                case 1:
                    try {
                        self.relayTable[reference].resolve(data);
                        self.relayTable[reference] = null;
                    }
                    catch (e) {
                        console.error("bad actor", e);
                        self.close();
                    }
                    break;
                case 2:
                    try {
                        self.relayTable[reference].reject(data);
                        self.relayTable[reference] = null;
                    }
                    catch (e) {
                        console.error("bad actor 2", e);
                        self.close();
                    }
                    break;
                default:
                    console.error("bad actor 2, type: ", type, "reference: ", reference, "data: ", data);
                    self.close();
            }
        });
    }
    send(msg) {
        let idx = this.relayTable.findIndex(e => !e);
        if (idx == -1)
            throw "callback buffer full!";
        this.relayTable[idx] = new Future_1.Future();
        super.send(String.fromCodePoint(0, idx) + msg);
        return this.relayTable[idx];
    }
    close() {
        this.relayTable.forEach(e => e && e.reject([TransmissionControlError.ConnectionClosed]));
        super.close();
    }
}
exports.TransmissionControl = TransmissionControl;


/***/ }),

/***/ "./modules/transmissioncontrol/config.ts":
/*!***********************************************!*\
  !*** ./modules/transmissioncontrol/config.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.transmissioncontrolc = {
    maxMessageBuffer: 100,
    version: "TCDL-1.0.0"
};


/***/ }),

/***/ "./test.ts":
/*!*****************!*\
  !*** ./test.ts ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Test_1 = __webpack_require__(/*! ./modules/test/Test */ "./modules/test/Test.ts");
const PrivateKey_1 = __webpack_require__(/*! ./modules/crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const DataLink_1 = __webpack_require__(/*! ./modules/datalink/DataLink */ "./modules/datalink/DataLink.ts");
const TransmissionControl_1 = __webpack_require__(/*! ./modules/transmissioncontrol/TransmissionControl */ "./modules/transmissioncontrol/TransmissionControl.ts");
const RouterChordFactory_1 = __webpack_require__(/*! ./modules/router/RouterChordFactory */ "./modules/router/RouterChordFactory.ts");
Promise.all([
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Crypto");
        let to = { a: 0.111, b: 234512 };
        let prk = new PrivateKey_1.PrivateKey();
        let verdoc = yield prk.sign(to);
        let reconstructed = yield PrivateKey_1.VerDoc.reconstruct(verdoc);
        cr.assert("verdoc key comparison", verdoc.key.hashed(), reconstructed.key.hashed());
        cr.assert("verdoc data comparison", JSON.stringify(verdoc.data), JSON.stringify(reconstructed.data));
        return cr.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("DataLink");
        let transmitted = yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let a = new DataLink_1.DataLink(m => resolve(m.data));
            let b = new DataLink_1.DataLink(m => b.send("b responds to " + m.data));
            a.complete(yield b.answer(yield a.offer()));
            yield b.ready;
            a.send("a says beep");
        }));
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
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Transmission Control");
        let a = new TransmissionControl_1.TransmissionControl((m) => __awaiter(this, void 0, void 0, function* () { return "a reflects: " + m; }));
        let b = new TransmissionControl_1.TransmissionControl((m) => __awaiter(this, void 0, void 0, function* () { return "b returns: " + (yield b.send("b reflects: " + m)); }));
        a.complete(yield b.answer(yield a.offer()));
        yield a.ready;
        let response = yield a.send("aaa");
        cr.assert("dual tcp bounce", response, "b returns: a reflects: b reflects: aaa");
        let f = null;
        let c = new TransmissionControl_1.TransmissionControl(m => Promise.reject("failure"));
        let d = new TransmissionControl_1.TransmissionControl((m) => __awaiter(this, void 0, void 0, function* () { return f(); }));
        c.complete(yield d.answer(yield c.offer()));
        yield d.ready;
        cr.assert("remote handling propagation", JSON.stringify(yield d.send("boop").catch(e => e)), '"failure"');
        cr.assert("remote handling propagation", JSON.stringify(yield c.send("boop").catch(e => e)), '"TypeError: f is not a function"');
        return cr.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Router Ports");
        let ak = new PrivateKey_1.PrivateKey();
        let bk = new PrivateKey_1.PrivateKey();
        let ck = new PrivateKey_1.PrivateKey();
        let a = new RouterChordFactory_1.RouterChordFactory(ak);
        let as1 = a.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "a1 reflects: " + msg; }));
        let as2 = a.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "a2 reflects: " + msg; }));
        let asb = a.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "ab reflects: " + msg; }));
        let b = new RouterChordFactory_1.RouterChordFactory(bk);
        let bs1 = b.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "b1 reflects: " + msg; }));
        let bs2 = b.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "b2 reflects: " + msg; }));
        let bsb = b.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "bb reflects: " + msg; }));
        let c = new RouterChordFactory_1.RouterChordFactory(ck);
        let cs1 = c.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "c1 reflects: " + msg; }));
        let cs2 = c.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "c2 reflects: " + msg; }));
        let csb = c.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "cb reflects: " + msg; }));
        a.generateSocket(b.provideConnector());
        c.generateSocket(a.provideConnector());
        yield a.ready;
        cr.assert("channel test 1", yield as1("as1", 0.5, 1), "b1 reflects: as1");
        yield b.ready;
        cr.assert("channel test 2", yield bs1("bs1", 0.5, 1), "a1 reflects: bs1");
        cr.assert("channel test 3", yield bs2("bs2", 0.5, 1), "a2 reflects: bs2");
        yield c.ready;
        cr.assert("channel test 3", JSON.stringify((yield Promise.all(asb("asb", 0.5, 1)))
            .sort((a, b) => a.localeCompare(b))), JSON.stringify(['bb reflects: asb', 'cb reflects: asb']));
        return cr.run();
    }))(),
]).then(a => {
    console.log("Testing complete.");
    window.close();
}).catch(e => {
    console.error("CRITICAL FAILURE! Uncaught Exception: ", e);
    window.close();
});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2RhdGFsaW5rL0RhdGFMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbW9kdWxlcy1vbGQvZGF0YWxpbmsvY29uZmlnLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL0NhYmxlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL1JvdXRlckNob3JkRmFjdG9yeS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9Sb3V0ZXJJbnRlcm5hbC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9Sb3V0ZXJQb3J0cy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9hcmN0YWJsZS9BcmN0YWJsZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9hcmN0YWJsZS9DaG9yZGlvaWQudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90ZXN0L1Rlc3QudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy9GdXR1cmUudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy91dGY4YnVmZmVyLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdHJhbnNtaXNzaW9uY29udHJvbC9UcmFuc21pc3Npb25Db250cm9sLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdHJhbnNtaXNzaW9uY29udHJvbC9jb25maWcudHMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFD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LEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVkLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FDdEMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFZLENBQUMsYUFBYSxDQUFDLENBQVcsQ0FBQyxDQUFDLENBQUMsRUFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFFLGtCQUFrQixFQUFFLGtCQUFrQixDQUFFLENBQUMsQ0FDekQsQ0FBQztRQUdOLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUMsRUFBQyxFQUFFO0NBR1AsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2xCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUU7SUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFDbEIsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3Rlc3QudHNcIik7XG4iLCJpbXBvcnQge3V0ZjhEZWNvZGVyLCB1dGY4RW5jb2Rlcn0gZnJvbSBcIi4uL3Rvb2xzL3V0ZjhidWZmZXJcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUHJpdmF0ZUtleSB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZUxpa2U8YW55PjtcclxuICAgIHByaXZhdGUgcHJpdmF0ZUtleSA6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgcHVibGljS2V5IDogUHVibGljS2V5O1xyXG4gICAgcmVhZG9ubHkgdmVyc2lvbiA9IDI7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucHVibGljS2V5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgICAgICBuYW1lZEN1cnZlOiBcIlAtMzg0XCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBbXCJzaWduXCIsIFwidmVyaWZ5XCJdXHJcbiAgICAgICAgICAgICkudGhlbihrZXlzID0+IHsgLy9rZXlzOiB7cHJpdmF0ZUtleTogQ3J5cHRvS2V5LCBwdWJsaWNLZXk6IENyeXB0b0tleX1cclxuICAgICAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSA9IGtleXMucHJpdmF0ZUtleTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIFwiandrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdWJsaWNLZXlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oandrID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGljS2V5ID0gbmV3IFB1YmxpY0tleShqd2spO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVibGljS2V5LnJlYWR5O1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcbiAgICBhc3luYyBzaWduPFQ+KG9iaiA6IFQpIDogUHJvbWlzZTxWZXJEb2M8VD4+IHtcclxuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5O1xyXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcclxuICAgICAgICBsZXQgcHVrID0gdGhpcy5wdWJsaWNLZXkudG9KU09OKCk7XHJcbiAgICAgICAgbGV0IGhlYWRlciA9IFN0cmluZy5mcm9tQ29kZVBvaW50KHRoaXMudmVyc2lvbiwgcHVrLmxlbmd0aCwgZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBzaWduYWJsZSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpO1xyXG5cclxuICAgICAgICBsZXQgc2lnYnVmZmVyID0gYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuc2lnbihcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wcml2YXRlS2V5LFxyXG4gICAgICAgICAgICBzaWduYWJsZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxldCBjaGVja3NtID0gdXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSkucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG4gICAgICAgIGxldCB1ZnQgPSAgbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKTtcclxuICAgICAgICBsZXQgY2hlYzIgPSBuZXcgVWludDhBcnJheShzaWdidWZmZXIpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuXHJcblxyXG4gICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oIGhlYWRlcitwdWsrZGF0YStTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5uZXcgVWludDhBcnJheShzaWdidWZmZXIpKSk7XHJcblxyXG4gICAgICAgIHZkLmtleSA9IHRoaXMucHVibGljS2V5O1xyXG4gICAgICAgIHZkLmRhdGEgPSBvYmo7XHJcbiAgICAgICAgdmQuc2lnbmF0dXJlID0gSlNPTi5zdHJpbmdpZnkobmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB2ZDtcclxuICAgIH1cclxuICAgIGFzeW5jIGdldFB1YmxpY0hhc2goKSA6IFByb21pc2U8bnVtYmVyPntcclxuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5O1xyXG4gICAgICAgIGF3YWl0IHRoaXMucHVibGljS2V5LnJlYWR5O1xyXG4gICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0tleS5oYXNoZWQoKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFZlckRvYyBEQU9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBSYXdEb2M8VD4gZXh0ZW5kcyBTdHJpbmd7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVmVyRG9jPFQ+IGV4dGVuZHMgUmF3RG9jPFQ+e1xyXG4gICAgZGF0YTogVDtcclxuICAgIGtleTogUHVibGljS2V5O1xyXG4gICAgc2lnbmF0dXJlOiBzdHJpbmc7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmVjb25zdHJ1Y3Q8VD4ocmF3RG9jIDogUmF3RG9jPFQ+KSA6IFByb21pc2U8VmVyRG9jPFQ+PntcclxuICAgICAgICBsZXQgdmVyc2lvbiA9IHJhd0RvYy5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0gcmF3RG9jLnN1YnN0cmluZygwLDMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHB1ayA9IHJhd0RvYy5zdWJzdHIoMywgcmF3RG9jLmNvZGVQb2ludEF0KDEpKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gcmF3RG9jLnN1YnN0cigzICsgcmF3RG9jLmNvZGVQb2ludEF0KDEpLCByYXdEb2MuY29kZVBvaW50QXQoMikpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNpZyA9IHJhd0RvYy5zdWJzdHIoMyArIHJhd0RvYy5jb2RlUG9pbnRBdCgxKSArIHJhd0RvYy5jb2RlUG9pbnRBdCgyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IGF3YWl0IG5ldyBQdWJsaWNLZXkoXHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVrXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKS5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICAgICAgICAgIGxldCB1ZnQgPSAgdXRmOEVuY29kZXIuZW5jb2RlKHNpZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlYzIgPSB1dGY4RW5jb2Rlci5lbmNvZGUoc2lnKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQga2V5LnZlcmlmeSh1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKSwgbmV3IFVpbnQ4QXJyYXkoc2lnLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNvZGVQb2ludEF0KDApKSkpXHJcbiAgICAgICAgICAgICAgICApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4ocmF3RG9jKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5zaWduYXR1cmUgPSBzaWc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQua2V5ID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2ZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJiYWQgZG9jdW1lbnRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFByb21pc2UucmVqZWN0KFwidmVyc2lvbiB1bnN1cHBvcnRlZDogXCIrdmVyc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBoYXNoIFAtMzg0IFNQS0kgaW50byAoMCwxKSBmbG9hdFxyXG5mdW5jdGlvbiBTUEtJdG9OdW1lcmljKHNwa2k6IEFycmF5QnVmZmVyKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc3BraSkuXHJcbiAgICAgICAgc2xpY2UoLTk2KS5cclxuICAgICAgICByZXZlcnNlKCkuXHJcbiAgICAgICAgcmVkdWNlKChhLGUsaSk9PmErZSpNYXRoLnBvdygyNTYsaSksIDApIC9cclxuICAgICAgICBNYXRoLnBvdygyNTYsIDk2KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFB1YmxpY0tleSB7XHJcbiAgICBwcml2YXRlIHB1YmxpY0NyeXB0b0tleTogQ3J5cHRvS2V5O1xyXG4gICAgcHJpdmF0ZSBmbG9hdGluZzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBqd2s6IEpzb25XZWJLZXk7XHJcbiAgICByZWFkeTtcclxuICAgIGNvbnN0cnVjdG9yKGp3azogSnNvbldlYktleSl7XHJcbiAgICAgICAgbGV0IHByb3RvSldLID0ge1wiY3J2XCI6XCJQLTM4NFwiLCBcImV4dFwiOnRydWUsIFwia2V5X29wc1wiOltcInZlcmlmeVwiXSwgXCJrdHlcIjpcIkVDXCIsIFwieFwiOmp3a1tcInhcIl0sIFwieVwiOmp3a1tcInlcIl19O1xyXG4gICAgICAgIHRoaXMuZmxvYXRpbmcgPSBOYU47XHJcbiAgICAgICAgdGhpcy5qd2sgPSBwcm90b0pXSztcclxuICAgICAgICB0aGlzLnJlYWR5ID0gd2luZG93LmNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxyXG4gICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICB0aGlzLmp3ayxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICBbXCJ2ZXJpZnlcIl1cclxuICAgICAgICApLnRoZW4ocHVibGljQ3J5cHRvS2V5ID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXkgPSBwdWJsaWNDcnlwdG9LZXk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgXCJzcGtpXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0NyeXB0b0tleVxyXG4gICAgICAgICAgICApLnRoZW4oc3BraSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsb2F0aW5nID0gU1BLSXRvTnVtZXJpYyhzcGtpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KS50aGVuKCgpPT50aGlzKTtcclxuICAgIH1cclxuICAgIGhhc2hlZCgpe1xyXG4gICAgICAgIGlmKGlzTmFOKHRoaXMuZmxvYXRpbmcpKSB0aHJvdyBFcnJvcihcIk5vdCBSZWFkeS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmc7XHJcbiAgICB9XHJcbiAgICB0b0pTT04oKXtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1wieFwiOiB0aGlzLmp3a1tcInhcIl0sIFwieVwiOiB0aGlzLmp3a1tcInlcIl19KTtcclxuICAgIH1cclxuICAgIHZlcmlmeShkYXRhOiBVaW50OEFycmF5LCBzaWduYXR1cmU6IEFycmF5QnVmZmVyKTogUHJvbWlzZUxpa2U8Ym9vbGVhbj57XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLnZlcmlmeShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXksXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZnJvbVN0cmluZyhqd2tzdHJpbmc6IHN0cmluZyk6IFB1YmxpY0tleXtcclxuICAgICAgICByZXR1cm4gbmV3IFB1YmxpY0tleShKU09OLnBhcnNlKGp3a3N0cmluZykpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtkYXRhbGlua2N9IGZyb20gXCIuLi9tb2R1bGVzLW9sZC9kYXRhbGluay9jb25maWdcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEYXRhTGluayBleHRlbmRzIFJUQ1BlZXJDb25uZWN0aW9ue1xyXG4gICAgcHJvdGVjdGVkIGRhdGFjaGFubmVsIDogUlRDRGF0YUNoYW5uZWw7XHJcbiAgICByZWFkb25seSByZWFkeSA6IFByb21pc2U8dGhpcz47XHJcbiAgICByZWFkb25seSBjbG9zZWQgOiBQcm9taXNlPHRoaXM+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9ubWVzc2FnZSA6IChtc2cgOiBNZXNzYWdlRXZlbnQpPT4gdm9pZCApe1xyXG4gICAgICAgIHN1cGVyKGRhdGFsaW5rYyk7XHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbCA9ICh0aGlzIGFzIGFueSlcclxuICAgICAgICAgICAgLmNyZWF0ZURhdGFDaGFubmVsKFwiZGF0YVwiLCB7bmVnb3RpYXRlZDogdHJ1ZSwgaWQ6IDAsIG9yZGVyZWQ6IGZhbHNlfSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSBuZXcgUHJvbWlzZTx0aGlzPiggcmVzb2x2ZSA9PiB0aGlzLmRhdGFjaGFubmVsLm9ub3BlbiA9ICgpPT4gcmVzb2x2ZSgpKTtcclxuICAgICAgICB0aGlzLmNsb3NlZCA9IG5ldyBQcm9taXNlPHRoaXM+KCByZXNvbHZlID0+IHRoaXMuZGF0YWNoYW5uZWwub25jbG9zZSA9ICgpPT4gcmVzb2x2ZSgpKTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcgfCBCbG9iIHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbC5zZW5kKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKSA6IFByb21pc2U8T2ZmZXI+e1xyXG4gICAgICAgIHRoaXMuc2V0TG9jYWxEZXNjcmlwdGlvbihhd2FpdCB0aGlzLmNyZWF0ZU9mZmVyKCkpO1xyXG5cclxuICAgICAgICAvLyBwcm9taXNlIHRvIHdhaXQgZm9yIHRoZSBzZHBcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8T2ZmZXI+KChhY2NlcHQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGFjY2VwdCh0aGlzLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgYW5zd2VyKG9mZmVyIDogT2ZmZXIpIDogUHJvbWlzZTxBbnN3ZXI+e1xyXG4gICAgICAgIHRoaXMuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2ZmZXJcIixcclxuICAgICAgICAgICAgc2RwOiBvZmZlciBhcyBzdHJpbmdcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5zZXRMb2NhbERlc2NyaXB0aW9uKGF3YWl0IHRoaXMuY3JlYXRlQW5zd2VyKCkpO1xyXG5cclxuICAgICAgICAvLyBwcm9taXNlIHRvIHdhaXQgZm9yIHRoZSBzZHBcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QW5zd2VyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQodGhpcy5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGNvbXBsZXRlKGFuc3dlciA6IEFuc3dlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcImFuc3dlclwiLFxyXG4gICAgICAgICAgICBzZHA6IGFuc3dlciBhcyBzdHJpbmdcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT2ZmZXIgZXh0ZW5kcyBTdHJpbmd7fVxyXG5leHBvcnQgY2xhc3MgQW5zd2VyIGV4dGVuZHMgU3RyaW5ne31cclxuXHJcbmludGVyZmFjZSBSVENEYXRhQ2hhbm5lbCBleHRlbmRzIEV2ZW50VGFyZ2V0e1xyXG4gICAgb25jbG9zZTogRnVuY3Rpb247XHJcbiAgICBvbmVycm9yOiBGdW5jdGlvbjtcclxuICAgIG9ubWVzc2FnZTogRnVuY3Rpb247XHJcbiAgICBvbm9wZW46IEZ1bmN0aW9uO1xyXG4gICAgY2xvc2UoKTtcclxuICAgIHNlbmQobXNnIDogc3RyaW5nIHwgQmxvYiB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3KTtcclxufSIsImV4cG9ydCBjb25zdCBkYXRhbGlua2MgPSB7XHJcbiAgICBpY2VTZXJ2ZXJzOiBbe3VybHM6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV1cclxufTsiLCJpbXBvcnQge1RyYW5zbWlzc2lvbkNvbnRyb2x9IGZyb20gXCIuLi90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2xcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5LCBQdWJsaWNLZXksIFJhd0RvYywgVmVyRG9jfSBmcm9tIFwiLi4vY3J5cHRvL1ByaXZhdGVLZXlcIjtcclxuaW1wb3J0IHtBbnN3ZXIsIE9mZmVyfSBmcm9tIFwiLi4vZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHtBcmN0YWJsZX0gZnJvbSBcIi4vYXJjdGFibGUvQXJjdGFibGVcIjtcclxuaW1wb3J0IHtSb3V0ZXJJbnRlcm5hbH0gZnJvbSBcIi4vUm91dGVySW50ZXJuYWxcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDYWJsZSBleHRlbmRzIFRyYW5zbWlzc2lvbkNvbnRyb2x7XHJcbiAgICBkYXRlT2ZDcmVhdGlvbiA6IG51bWJlcjtcclxuICAgIGtleSA6IFB1YmxpY0tleTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKChlKT0+e3Rocm93IGV9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKSA6IFByb21pc2U8T2ZmZXI+e1xyXG4gICAgICAgIHRoaXMuZGF0ZU9mQ3JlYXRpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gc3VwZXIub2ZmZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBPZmZlcikgOiBQcm9taXNlPEFuc3dlcj57XHJcbiAgICAgICAgdGhpcy5kYXRlT2ZDcmVhdGlvbiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHJldHVybiBzdXBlci5hbnN3ZXIob2ZmZXIpXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJhd0NhYmxlT2ZmZXJ7XHJcbiAgICB0YXJnZXQ6IG51bWJlciwgLy9leHBvbmVudFxyXG4gICAgdG9sZXJhbmNlIDogbnVtYmVyLFxyXG4gICAgc2RwIDogT2ZmZXJcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWJsZU9mZmVyIGV4dGVuZHMgUmF3RG9jPFJhd0NhYmxlT2ZmZXI+e1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWJsZUFuc3dlciBleHRlbmRzIFJhd0RvYzxBbnN3ZXI+e1xyXG5cclxufVxyXG4iLCJpbXBvcnQge1JvdXRlclBvcnRzfSBmcm9tIFwiLi9Sb3V0ZXJQb3J0c1wiO1xyXG5pbXBvcnQge0NhYmxlLCBDYWJsZUFuc3dlciwgQ2FibGVPZmZlciwgUmF3Q2FibGVPZmZlcn0gZnJvbSBcIi4vQ2FibGVcIjtcclxuaW1wb3J0IHtBcmN0YWJsZX0gZnJvbSBcIi4vYXJjdGFibGUvQXJjdGFibGVcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCBoYXMgPSBSZWZsZWN0LmhhcztcclxuaW1wb3J0IHtBbnN3ZXJ9IGZyb20gXCIuLi9kYXRhbGluay9EYXRhTGlua1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJvdXRlckNob3JkRmFjdG9yeSBleHRlbmRzIFJvdXRlclBvcnRze1xyXG4gICAgcmVhZG9ubHkgYWRkcmVzcyA6IFByb21pc2U8bnVtYmVyPjtcclxuICAgIHJlYWRvbmx5IHNpZ24gOiA8VD4oZG9jIDogVCk9PlByb21pc2U8UmF3RG9jPFQ+PjtcclxuICAgIHByaXZhdGUgcmVsYXlPZmZlcjogKG1zZzogc3RyaW5nLCB0YXJnZXQ6IG51bWJlciwgdG9sZXJhbmNlOiBudW1iZXIpID0+IFByb21pc2U8U3RyaW5nPjtcclxuICAgIGNvbnN0cnVjdG9yKGtleSA6IFByaXZhdGVLZXkpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2lnbiA9IChvKT0+a2V5LnNpZ24obyk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnJlbGF5T2ZmZXIgPSB0aGlzLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZyA6IENhYmxlT2ZmZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHNlbGYucHJvdmlkZUNvbm5lY3RvcigpKG1zZykgYXMgc3RyaW5nO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZHJlc3MgPSBrZXkuZ2V0UHVibGljSGFzaCgpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZHJlc3MudGhlbihoYXNoID0+IHNlbGYudGFibGUgPSBuZXcgQXJjdGFibGU8Q2FibGU+KGhhc2gpKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Nvbm5lY3Rvcn0gY29ubmVjdG9yXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDYWJsZT59IHdoZW4gcmVhZHkgZm9yIHRyYW5zbWl0XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdlbmVyYXRlU29ja2V0KGNvbm5lY3RvciA6IENvbm5lY3Rvcil7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMuYWRkcmVzcztcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgY2FibGUgPSBuZXcgQ2FibGUoKTtcclxuXHJcbiAgICAgICAgbGV0IHN1Z2dlc3Rpb24gPSB0aGlzLnRhYmxlLmdldFN1Z2dlc3Rpb25zKClbMF07XHJcblxyXG4gICAgICAgIC8vIEB0b2RvOiBpbnZlc3RpZ2F0ZSB0aGUgdXRpbGl0eSBvZiB0aGlzXHJcbiAgICAgICAgLy8gbGV0IHN1Z2dlc3Rpb24gPSAgdGhpcy50YWJsZS5nZXRTdWdnZXN0aW9ucygpW1xyXG4gICAgICAgIC8vICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKjEwICogdGhpcy50YWJsZS5tYXhTaXplKVxyXG4gICAgICAgIC8vICAgICBdO1xyXG5cclxuICAgICAgICBsZXQgb2ZmZXIgPSBhd2FpdCB0aGlzLnNpZ24oe1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHN1Z2dlc3Rpb24uZXhwb25lbnQsXHJcbiAgICAgICAgICAgIHRvbGVyYW5jZSA6IHN1Z2dlc3Rpb24uZWZmaWNpZW5jeSxcclxuICAgICAgICAgICAgc2RwIDogYXdhaXQgY2FibGUub2ZmZXIoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGxldCBhbnN3ZXIgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3Q8QW5zd2VyPihhd2FpdCBjb25uZWN0b3Iob2ZmZXIpKTtcclxuICAgICAgICAgICAgY2FibGUua2V5ID0gYW5zd2VyLmtleTtcclxuICAgICAgICAgICAgYXdhaXQgY2FibGUuY29tcGxldGUoYW5zd2VyLmRhdGEpO1xyXG5cclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNhYmxlLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRocm93IFwiQ29ubmVjdGlvbiBmYWlsZWQ6IFwiICsgZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IGNhYmxlLnJlYWR5O1xyXG4gICAgICAgIGNhYmxlLmNsb3NlZC50aGVuKCgpPT5zZWxmLmRldGFjaChjYWJsZSkpO1xyXG4gICAgICAgIHNlbGYuYXR0YWNoKGNhYmxlKTtcclxuICAgICAgICByZXR1cm4gY2FibGUucmVhZHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdmlkZUNvbm5lY3RvcigpIDogQ29ubmVjdG9ye1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICByZXR1cm4gYXN5bmMgKG9mZmVyIDogQ2FibGVPZmZlcikgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvYyA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdDxSYXdDYWJsZU9mZmVyPihvZmZlcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gQXJjdGFibGUuZGVyZWZlcmVuY2UoZG9jLmRhdGEudGFyZ2V0LCBkb2Mua2V5Lmhhc2hlZCgpKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IEFyY3RhYmxlLmRpc3RhbmNlKHRhcmdldCwgYXdhaXQgc2VsZi5hZGRyZXNzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+PSBkb2MuZGF0YS50b2xlcmFuY2UpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5yZWxheU9mZmVyKG9mZmVyIGFzIHN0cmluZywgdGFyZ2V0LCBkaXN0YW5jZSk7XHJcblxyXG4gICAgICAgICAgICBpZiggISB0aGlzLnRhYmxlLmlzRGVzaXJhYmxlKGRvYy5rZXkuaGFzaGVkKCkpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYucmVsYXlPZmZlcihvZmZlciBhcyBzdHJpbmcsIHRhcmdldCwgZGlzdGFuY2UpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNhYmxlID0gbmV3IENhYmxlKCk7XHJcblxyXG4gICAgICAgICAgICBjYWJsZS5rZXkgPSBkb2Mua2V5O1xyXG5cclxuICAgICAgICAgICAgY2FibGUucmVhZHkudGhlbigoKT0+IHNlbGYuYXR0YWNoKGNhYmxlKSk7XHJcbiAgICAgICAgICAgIGNhYmxlLmNsb3NlZC50aGVuKCgpPT5zZWxmLmRldGFjaChjYWJsZSkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2lnbihhd2FpdCBjYWJsZS5hbnN3ZXIoZG9jLmRhdGEuc2RwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25uZWN0b3Ige1xyXG4gICAgKG9mZmVyIDogQ2FibGVPZmZlcikgOiBQcm9taXNlPENhYmxlQW5zd2VyPlxyXG59XHJcblxyXG4iLCJpbXBvcnQge0NhYmxlfSBmcm9tIFwiLi9DYWJsZVwiO1xyXG5pbXBvcnQge0FyY3RhYmxlfSBmcm9tIFwiLi9hcmN0YWJsZS9BcmN0YWJsZVwiO1xyXG5pbXBvcnQge0Z1dHVyZX0gZnJvbSBcIi4uL3Rvb2xzL0Z1dHVyZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSb3V0ZXJJbnRlcm5hbCB7XHJcbiAgICBwcm90ZWN0ZWQgdGFibGUgOiBBcmN0YWJsZTxDYWJsZT47XHJcbiAgICByZWFkb25seSByZWFkeSA6IFByb21pc2U8dGhpcz47XHJcblxyXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IG5ldyBGdXR1cmU8dGhpcz4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2gobXNnIDogc3RyaW5nLCB0YXJnZXQgOiBudW1iZXIsIHRvbGVyYW5jZSA6IG51bWJlcikgOiBQcm9taXNlPHN0cmluZz57XHJcbiAgICAgICAgbGV0IGNsb3Nlc3QgPSB0aGlzLnRhYmxlLmdldFdpdGhpbih0YXJnZXQsIHRvbGVyYW5jZSk7XHJcbiAgICAgICAgaWYoIWNsb3Nlc3QpIHRocm93IFwiZW1wdHkgbmV0d29ya1wiO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRhYmxlLmdldFdpdGhpbih0YXJnZXQsIHRvbGVyYW5jZSkuc2VuZChtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBicm9hZGNhc3QobXNnIDogc3RyaW5nKSA6IFByb21pc2U8c3RyaW5nPltde1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRhYmxlLmdldEFsbCgpLm1hcChjID0+IGMuc2VuZChtc2cpKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2goY2FibGUgOiBDYWJsZSl7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGNhYmxlLmNsb3NlZC50aGVuKGMgPT4gc2VsZi5kZXRhY2goYykpO1xyXG4gICAgICAgIGxldCBlamVjdGVkID0gdGhpcy50YWJsZS5hZGQoY2FibGUua2V5Lmhhc2hlZCgpLCBjYWJsZSk7XHJcbiAgICAgICAgZWplY3RlZCAmJiBlamVjdGVkLmNsb3NlKCk7XHJcbiAgICAgICAgKHRoaXMucmVhZHkgYXMgRnV0dXJlPHRoaXM+KS5yZXNvbHZlKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFjaChjYWJsZSA6IENhYmxlKXtcclxuICAgICAgICBsZXQgZWplY3RlZCA9IHRoaXMudGFibGUucmVtb3ZlKGNhYmxlLmtleS5oYXNoZWQoKSk7XHJcbiAgICAgICAgZWplY3RlZCAmJiBlamVjdGVkLmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICBcclxufSIsImltcG9ydCB7Um91dGVySW50ZXJuYWx9IGZyb20gXCIuL1JvdXRlckludGVybmFsXCI7XHJcbmltcG9ydCB7Q2FibGV9IGZyb20gXCIuL0NhYmxlXCI7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUm91dGVyUG9ydHMgZXh0ZW5kcyBSb3V0ZXJJbnRlcm5hbHtcclxuICAgIHByaXZhdGUgY2hhbm5lbHMgOiBPbk1lc3NhZ2VbXSA9IFtdO1xyXG5cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBzb3J0ZXIobXNnIDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+e1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jaGFubmVsc1ttc2cuY29kZVBvaW50QXQoMCldKG1zZy5zbGljZSgxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoKGNhYmxlIDogQ2FibGUpe1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBjYWJsZS5vbm1lc3NhZ2UgPSAobXNnKT0+e3JldHVybiBzZWxmLnNvcnRlcihtc2cpfTtcclxuICAgICAgICBzdXBlci5hdHRhY2goY2FibGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVBvcnQob25tZXNzYWdlIDogT25NZXNzYWdlKSA6IChtc2cgOiBzdHJpbmcsIHRhcmdldCA6IG51bWJlciwgdG9sZXJhbmNlIDogbnVtYmVyKSA9PiBQcm9taXNlPFN0cmluZz57XHJcbiAgICAgICAgbGV0IHBvcnRJRCA9IHRoaXMuY2hhbm5lbHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbHMucHVzaChvbm1lc3NhZ2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiAobXNnIDogc3RyaW5nLCB0YXJnZXQgOiBudW1iZXIsIHRvbGVyYW5jZSA6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaXNwYXRjaChTdHJpbmcuZnJvbUNvZGVQb2ludChwb3J0SUQpICsgbXNnLCB0YXJnZXQsIHRvbGVyYW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29tbXVuaWNhdGVzIHdpdGggYWxsIGFkamFjZW50IG5vZGVzLlxyXG4gICAgICogQHBhcmFtIHtPbk1lc3NhZ2V9IG9ubWVzc2FnZVxyXG4gICAgICogQHBhcmFtIG1heEJyb2FkY2FzdEJ1ZmZlclxyXG4gICAgICogQHJldHVybnMge09uTWVzc2FnZX1cclxuICAgICAqL1xyXG4gICAgY3JlYXRlRnJlcXVlbmN5KG9ubWVzc2FnZSA6IE9uTWVzc2FnZSwgbWF4QnJvYWRjYXN0QnVmZmVyKSA6IChtc2cgOiBzdHJpbmcpID0+IFByb21pc2U8U3RyaW5nPltde1xyXG4gICAgICAgIGxldCBwb3J0SUQgPSB0aGlzLmNoYW5uZWxzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmNoYW5uZWxzLnB1c2gob25tZXNzYWdlKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gKG1zZyA6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5icm9hZGNhc3QoU3RyaW5nLmZyb21Db2RlUG9pbnQocG9ydElEKSArIG1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuaW50ZXJmYWNlIE9uTWVzc2FnZSB7XHJcbiAgICAobXNnIDogc3RyaW5nKSA6IFByb21pc2U8c3RyaW5nPlxyXG59XHJcblxyXG5cclxuIiwiaW1wb3J0IHtDaG9yZG9pZH0gZnJvbSBcIi4vQ2hvcmRpb2lkXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQXJjdGFibGU8VD4gZXh0ZW5kcyBDaG9yZG9pZDxUPiB7XHJcbiAgICBwcml2YXRlIHB1cmdhdG9yeTogeyBrZXk6IG51bWJlciwgb2JqOiBULCBlZmY6IG51bWJlciwgaWR4OiBudW1iZXIgfVtdID0gW107IC8vIHN0b3JlcyBwZW5kaW5nIGFkZHJlc3NlcztcclxuICAgIHByaXZhdGUgZGVlcFN0b3JlZCA6IG51bWJlciA9IDA7XHJcbiAgICByZWFkb25seSBtYXhTaXplIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbnRlciA6IG51bWJlciwgbWF4U2l6ZSA9IENob3Jkb2lkLmxvb2t1cFRhYmxlLmxlbmd0aCAtIDEpe1xyXG4gICAgICAgIHN1cGVyKGNlbnRlcik7XHJcbiAgICAgICAgdGhpcy5tYXhTaXplID0gbWF4U2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGQobG9jYXRpb24gOiBudW1iZXIsIG9iamVjdCA6IFQpIDogVCB8IG51bGx7XHJcbiAgICAgICAgaWYodGhpcy5pc0Rlc2lyYWJsZShsb2NhdGlvbikpe1xyXG4gICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICAgICAgbGV0IGV4dHJhY3RlZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqZWN0fTtcclxuXHJcbiAgICAgICAgICAgIGlmKCFleHRyYWN0ZWQpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWVwU3RvcmVkKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbG9jYXRpb24gPSBleHRyYWN0ZWQua2V5O1xyXG4gICAgICAgICAgICBvYmplY3QgPSBleHRyYWN0ZWQub2JqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IGVmZmljaWVuY3kgPSB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCk7XHJcblxyXG4gICAgICAgIHRoaXMucHVyZ2F0b3J5LnB1c2goe29iajogb2JqZWN0LCBrZXk6IGxvY2F0aW9uLCBlZmY6IGVmZmljaWVuY3ksIGlkeDogaWR4fSk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMucHVyZ2F0b3J5Lmxlbmd0aCA8PSB0aGlzLm1heFNpemUgLSB0aGlzLmRlZXBTdG9yZWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLnB1cmdhdG9yeS5zb3J0KChhLCBiKT0+IGEuZWZmIC0gYi5lZmYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5wdXJnYXRvcnkucG9wKCkub2JqO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUobG9jYXRpb24gOiBudW1iZXIpIDogVHtcclxuICAgICAgICBsZXQgcmVtb3ZlZCA9IHN1cGVyLnJlbW92ZShsb2NhdGlvbik7XHJcbiAgICAgICAgaWYocmVtb3ZlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0b3JlZC0tO1xyXG5cclxuICAgICAgICAgICAgLy9maW5kIGEgcmVwbGFjZW1lbnRcclxuICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBjYW5kaWRhdGVzID0gdGhpcy5wdXJnYXRvcnkuZmlsdGVyKGUgPT4gZS5pZHggPT0gaWR4KTtcclxuICAgICAgICAgICAgaWYoY2FuZGlkYXRlcy5sZW5ndGggPT0gMCkgcmV0dXJuIHJlbW92ZWQ7XHJcblxyXG4gICAgICAgICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsYik9PiBhLmVmZiAtIGIuZWZmKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwaW5kZXggPSB0aGlzLnB1cmdhdG9yeS5maW5kSW5kZXgoZSA9PiBlLmtleSA9PSBsb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2FuZGlkYXRlID0gdGhpcy5wdXJnYXRvcnkuc3BsaWNlKHBpbmRleCwgMSlbMF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlZXBTdG9yZWQrKztcclxuICAgICAgICAgICAgaWYoc3VwZXIuYWRkKGNhbmRpZGF0ZS5rZXksIGNhbmRpZGF0ZS5vYmopKSB0aHJvdyBcImZhdGFsIGxvZ2ljIGVycm9yIGluIGFyY3RhYmxlXCI7XHJcblxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxldCBwaW5kZXggPSB0aGlzLnB1cmdhdG9yeS5maW5kSW5kZXgoZSA9PiBlLmtleSA9PSBsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGlmKHBpbmRleCA9PSAtMSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnB1cmdhdG9yeS5zcGxpY2UocGluZGV4LCAxKVswXS5vYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbCgpe1xyXG4gICAgICAgIHJldHVybiBbLi4udGhpcy5hcnJheS5maWx0ZXIoZSA9PiBlKSwgLi4udGhpcy5wdXJnYXRvcnldLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBhcHByb2FjaChsb2NhdGlvbiA6IG51bWJlcikgOiBUe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFdpdGhpbihsb2NhdGlvbiwgdGhpcy5kaXN0YW5jZShsb2NhdGlvbikpXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3VnZ2VzdGlvbnMoKXtcclxuICAgICAgICBpZih0aGlzLmRlZXBTdG9yZWQgPT0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246ICh0aGlzLmxvY3VzKzAuNSklMSxcclxuICAgICAgICAgICAgICAgIGV4cG9uZW50OiAwLFxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeTogMC45OTk5OTk5XHJcbiAgICAgICAgICAgIH0sLi4uc3VwZXIuZ2V0U3VnZ2VzdGlvbnMoKV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdXBlci5nZXRTdWdnZXN0aW9ucygpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBDaG9yZG9pZDxUPntcclxuICAgIHJlYWRvbmx5IGxvY3VzIDogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIGFycmF5IDoge2tleSA6IG51bWJlciwgb2JqIDogVH1bXTtcclxuXHJcbiAgICAvL0ZJWE1FOiBhbXAgdXAgcHJlY2lzaW9uIHRvIDY0IGJpdDtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb29rdXBUYWJsZSA9IFstMC41LCAtMC4yNSwgLTAuMDU1NTU1NTU1NTU1NTU1NTgsIC0wLjAwNzgxMjUsIC0wLjAwMDgwMDAwMDAwMDAwMDAyMjksIC0wLjAwMDA2NDMwMDQxMTUyMjYxMDksXHJcbiAgICAgICAgLTAuMDAwMDA0MjQ5OTI5ODc2MTMyMjYzNSwgLTIuMzg0MTg1NzkxMDE1NjI1ZS03LCAtMS4xNjE1Mjg2NTY1OTAyNDk0ZS04LCAtNC45OTk5OTk4NTg1OTAzNDNlLTEwLFxyXG4gICAgICAgIC0xLjkyNzcxOTA5NTQ2MjUyMTJlLTExLCAtNi43Mjk2MTY4NjM3NjUzODZlLTEzLCAtMi4xNDgyODE1NTI2NDk2NzhlLTE0LCAtNi4xMDYyMjY2MzU0MzgzNjFlLTE2LCAwLFxyXG4gICAgICAgIDYuMTA2MjI2NjM1NDM4MzYxZS0xNiwgMi4xNDgyODE1NTI2NDk2NzhlLTE0LCA2LjcyOTYxNjg2Mzc2NTM4NmUtMTMsIDEuOTI3NzE5MDk1NDYyNTIxMmUtMTEsXHJcbiAgICAgICAgNC45OTk5OTk4NTg1OTAzNDNlLTEwLCAxLjE2MTUyODY1NjU5MDI0OTRlLTgsIDIuMzg0MTg1NzkxMDE1NjI1ZS03LCAwLjAwMDAwNDI0OTkyOTg3NjEzMjI2MzUsXHJcbiAgICAgICAgMC4wMDAwNjQzMDA0MTE1MjI2MTA5LCAwLjAwMDgwMDAwMDAwMDAwMDAyMjksIDAuMDA3ODEyNSwgMC4wNTU1NTU1NTU1NTU1NTU1OCwgMC4yNSwgMC41XTtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb2N1c0lEWCA9IDE0OyAvLyBwb3NpdGlvbiBvZiB0aGUgbG9jdXNcclxuICAgIHN0YXRpYyBhY2NlcHRhYmxlRXJyb3IgPSAxZS0xNjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZW50ZXIgOiBudW1iZXIsIGNpcmN1bWZlcmVuY2UgOiBudW1iZXIgPSAxKXtcclxuICAgICAgICB0aGlzLmxvY3VzID0gY2VudGVyO1xyXG4gICAgICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTEpLmZpbGwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEZXNpcmFibGUobG9jYXRpb246IG51bWJlcil7IC8vdG9kbzogcmVmYWN0b3IgdGhpcyBpbnRvIFwiYWRkXCJcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGQobG9jYXRpb246IG51bWJlciwgb2JqIDogVCkgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICAvL2VmZmljaWVuY3kgaXMgd29yc2UgdGhhbiBpbmNvbWluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XS5vYmo7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vcmVqZWN0IHRoZSBvYmplY3Q7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqfTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0cmlldmUgY2xvc2VzdCBhdmFpbGFibGUgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb25cclxuICAgICAqIEByZXR1cm5zIHtUIHwgbnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0KGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSB8fCBudWxsKSAmJiBpdGVtLm9iajtcclxuICAgIH1cclxuICAgIGdldFdpdGhpbihsb2NhdGlvbjogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlcikgOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSAmJiBDaG9yZG9pZC5kaXN0YW5jZShpdGVtLmtleSAsIGxvY2F0aW9uKSA8IHRvbGVyYW5jZSlcclxuICAgICAgICAgICAgPyBpdGVtLm9ialxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZC5hY2NlcHRhYmxlRXJyb3Ipe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcnJheVtpZHhdID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gb2xkLm9iajtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGRlcmVmZXJlbmNlIChpZHg6IEV4cG9uZW50LCBsb2N1czogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeC52YWx1ZU9mKCldICsgbG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGxvY2F0aW9uPj0wICYmIGxvY2F0aW9uIDw9IDEsIFwibG9jYXRpb246IFwiK2xvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gKCgxICsgbG9jYXRpb24gLSB0aGlzLmxvY3VzICsgMC41KSAlIDEpIC0gMC41O1xyXG4gICAgICAgIC8vZXhwZWN0IGluIHJhbmdlIC0wLjUsIDAuNVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAobG9jYXRpb24gKyB0aGlzLmxvY3VzICsgMSApICUgMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlzdGFuY2UoYSA6IG51bWJlciwgYiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhhIC0gYiksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiICsgMSksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGIgLSBhICsgMSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZGlzdGFuY2UoYTogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UodGhpcy5sb2N1cywgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSwgZGVyZWxhdGl2aXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgbHRvaShsb2NhdGlvbiA6IG51bWJlciwgc2tpcEVtcHR5IDogYm9vbGVhbiA9IGZhbHNlKSA6IG51bWJlcnsgLy9sb2NhdGlvbiB0byBpbmRleFxyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IDE7XHJcbiAgICAgICAgbGV0IHZlcmlkZXggPSBudWxsO1xyXG4gICAgICAgIGlmKGRlcmVsYXRpdml6ZWQgPCAwKXtcclxuICAgICAgICAgICAgLy9zdGFydCB3aXRoIDBcclxuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIG1heFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlciwgZWZmaWNpZW5jeTogbnVtYmVyLCBleHBvbmVudDogRXhwb25lbnR9W119IHNvcnRlZCwgYmlnZ2VzdCB0byBzbWFsbGVzdCBnYXAuXHJcbiAgICAgKi9cclxuICAgIGdldFN1Z2dlc3Rpb25zKCkgOiB7bG9jYXRpb24gOiBudW1iZXIsIGVmZmljaWVuY3kgOiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5Lm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBleHBvbmVudDogbmV3IEV4cG9uZW50KGlkeCksXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAoaXRlbSk/IHRoaXMuZWZmaWNpZW5jeShpdGVtLmtleSwgaWR4KSA6IE1hdGguYWJzKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeF0vMiksXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5yZXJlbGF0aXZpemUoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsbCgpIDogVFtde1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFeHBvbmVudCBleHRlbmRzIE51bWJlcntcclxuICAgIGNvbnN0cnVjdG9yKGV4cG9uZW50IDogbnVtYmVyKXtcclxuICAgICAgICBpZihcclxuICAgICAgICAgICAgTWF0aC5hYnMoZXhwb25lbnQpICE9IGV4cG9uZW50IHx8XHJcbiAgICAgICAgICAgIGV4cG9uZW50IDwgMCAgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPj0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoXHJcbiAgICAgICAgKSB0aHJvdyBcImludmFsaWQgZXhwb25lbnRcIjtcclxuICAgICAgICBzdXBlcihleHBvbmVudCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgVGVzdHtcclxuICAgIG5hbWUgOiBzdHJpbmc7XHJcbiAgICB0ZXN0cyA6ICgoKT0+UHJvbWlzZTxib29sZWFuPilbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBpdGVtIDogbnVtYmVyID0gMDsgLy8gY3VycmVudCBpdGVtXHJcbiAgICBwcml2YXRlIHBhc3NlZCA6IG51bWJlciA9IDA7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lIDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcGFzcygpIDogYm9vbGVhbntcclxuICAgICAgICB0aGlzLnBhc3NlZCsrO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBmYWlsKHN0cjogc3RyaW5nLCBvYmplY3RzOiBhbnlbXSkgOiBib29sZWFue1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRkFJTEVEIChcIisoKyt0aGlzLml0ZW0pK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKVwiLFxyXG4gICAgICAgICAgICBzdHIsIG9iamVjdHMpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQobmFtZSA6IHN0cmluZywgYSA6IGFueSwgYiA6IGFueSwgY29tcGFyYXRvciA6IChhLCBiKT0+Ym9vbGVhbiA9IChhLGIpPT5hPT09Yil7XHJcbiAgICAgICAgdGhpcy50ZXN0cy5wdXNoKGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgIGlmKGNvbXBhcmF0b3IoYXdhaXQgYSwgYXdhaXQgYikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFzcygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChcImFzc2VydDogXCIgKyBuYW1lLCBbYXdhaXQgYSwgYXdhaXQgYl0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICB0aGlzLml0ZW0gPSAwO1xyXG4gICAgICAgIHRoaXMucGFzc2VkID0gMDtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLnRlc3RzLm1hcChlID0+IGUoKSkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCgodGhpcy5wYXNzZWQgPT0gdGhpcy50ZXN0cy5sZW5ndGgpPyBcIlBhc3NlZCAoXCIgOiBcIkZBSUxFRCEgKFwiKSt0aGlzLnBhc3NlZCtcIi9cIit0aGlzLnRlc3RzLmxlbmd0aCtcIikuIGluIFwiK3RoaXMubmFtZStcIi5cIik7XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogRXNzZW50aWFsbHkgZGVmZXJyZWQsIGJ1dCBpdCdzIGFsc28gYSBwcm9taXNlLlxyXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvSmF2YVNjcmlwdF9jb2RlX21vZHVsZXMvUHJvbWlzZS5qc20vRGVmZXJyZWQjYmFja3dhcmRzX2ZvcndhcmRzX2NvbXBhdGlibGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBGdXR1cmU8VD4gZXh0ZW5kcyBQcm9taXNlPFQ+e1xyXG4gICAgcmVhZG9ubHkgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZDtcclxuICAgIHJlYWRvbmx5IHJlamVjdCA6IChyZWFzb24gPzogYW55KSA9PiB2b2lkO1xyXG4gICAgcHJvdGVjdGVkIHN0YXRlIDogMCB8IDEgfCAyOyAvL3BlbmRpbmcsIHJlc29sdmVkLCByZWplY3RlZDtcclxuICAgIHByaXZhdGUgc3RhdGVFeHRyYWN0b3I7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZXhlY3V0b3IgPzogKFxyXG4gICAgICAgIHJlc29sdmUgOiAodmFsdWUgOiBQcm9taXNlTGlrZTxUPiB8IFQpID0+IHZvaWQsXHJcbiAgICAgICAgcmVqZWN0IDogKHJlYXNvbiA/OiBhbnkpID0+IHZvaWQpPT52b2lkXHJcbiAgICApe1xyXG4gICAgICAgIGxldCByZXNvbHZlciwgcmVqZWN0b3I7XHJcbiAgICAgICAgbGV0IHN0YXRlIDogMCB8IDEgfCAyID0gMDtcclxuICAgICAgICBzdXBlcigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmVyID0gKHJlc29sdXRpb24gOiBUKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc29sdXRpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZWplY3RvciA9IChyZWplY3Rpb24gOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gMjtcclxuICAgICAgICAgICAgICAgIHJlamVjdChyZWplY3Rpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhdGVFeHRyYWN0b3IgPSAoKSA9PiB7IC8vIHRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2VsZiBjYW5ub3QgYmUgc2V0IGluIHN1cGVyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZXI7XHJcbiAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3RvcjtcclxuXHJcbiAgICAgICAgZXhlY3V0b3IgJiYgbmV3IFByb21pc2U8VD4oZXhlY3V0b3IpLnRoZW4ocmVzb2x2ZXIpLmNhdGNoKHJlamVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRTdGF0ZSgpIDogXCJwZW5kaW5nXCIgfCBcInJlc29sdmVkXCIgfCBcInJlamVjdGVkXCIgfCBcImVycm9yXCIge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0ZUV4dHJhY3RvcigpID09IDApPyBcInBlbmRpbmdcIlxyXG4gICAgICAgICAgICA6ICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMSkgPyBcInJlc29sdmVkXCJcclxuICAgICAgICAgICAgOiAodGhpcy5zdGF0ZUV4dHJhY3RvcigpID09IDIpID8gXCJyZWplY3RlZFwiXHJcbiAgICAgICAgICAgIDogXCJlcnJvclwiO1xyXG4gICAgfVxyXG5cclxufSIsIi8vdG9kbzogaW5jbHVkZSBwb2x5ZmlsbHMgZm9yIEVkZ2VcclxuZXhwb3J0IGNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbmV4cG9ydCBjb25zdCB1dGY4RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG5cclxuIiwiaW1wb3J0IHt0cmFuc21pc3Npb25jb250cm9sY30gZnJvbSBcIi4vY29uZmlnXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7RGF0YUxpbmt9IGZyb20gXCIuLi9kYXRhbGluay9EYXRhTGlua1wiO1xyXG5cclxuZW51bSBUcmFuc21pc3Npb25Db250cm9sRXJyb3J7XHJcbiAgICBDb25uZWN0aW9uQ2xvc2VkID0gMTAwLFxyXG4gICAgUmVtb3RlRXJyb3IgPSAyMDAsXHJcbiAgICBQcm90b2NvbEVycm9yID0gMzAwXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFuc21pc3Npb25Db250cm9sIGV4dGVuZHMgRGF0YUxpbmt7XHJcbiAgICByZWxheVRhYmxlOiBGdXR1cmU8c3RyaW5nPltdID0gbmV3IEFycmF5KHRyYW5zbWlzc2lvbmNvbnRyb2xjLm1heE1lc3NhZ2VCdWZmZXIrMSkuZmlsbChudWxsKTtcclxuICAgIG9ubWVzc2FnZSA6IChtc2cgOiBzdHJpbmcpPT4gUHJvbWlzZTxzdHJpbmc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9ubWVzc2FnZSA6IChtc2cgOiBzdHJpbmcpPT5Qcm9taXNlPHN0cmluZz4pe1xyXG4gICAgICAgIHN1cGVyKG51bGwpO1xyXG4gICAgICAgIHRoaXMub25tZXNzYWdlID0gb25tZXNzYWdlO1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZGF0YWNoYW5uZWwub25tZXNzYWdlID0gYXN5bmMgKG1zZ0UpPT57XHJcbiAgICAgICAgICAgIC8vIHN0ZXAgMTogd2hhdCBpcyBpdD9cclxuICAgICAgICAgICAgbGV0IHR5cGUgPSBtc2dFLmRhdGEuY29kZVBvaW50QXQoMCk7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2UgPSBtc2dFLmRhdGEuY29kZVBvaW50QXQoMSk7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gbXNnRS5kYXRhLnNsaWNlKDIpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBzZWxmLm9ubWVzc2FnZShkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHNlbGYuZGF0YWNoYW5uZWwuc2VuZChTdHJpbmcuZnJvbUNvZGVQb2ludCgxLCByZWZlcmVuY2UpICsgcmVzcG9uc2UpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBzZWxmLmRhdGFjaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoMiwgcmVmZXJlbmNlKSArIGVycm9yKSk7IHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXlUYWJsZVtyZWZlcmVuY2VdLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXlUYWJsZVtyZWZlcmVuY2VdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9Y2F0Y2ggKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiYmFkIGFjdG9yXCIsIGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWxheVRhYmxlW3JlZmVyZW5jZV0ucmVqZWN0KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF5VGFibGVbcmVmZXJlbmNlXSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfWNhdGNoIChlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImJhZCBhY3RvciAyXCIsIGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiYmFkIGFjdG9yIDIsIHR5cGU6IFwiLCB0eXBlLCBcInJlZmVyZW5jZTogXCIsIHJlZmVyZW5jZSwgXCJkYXRhOiBcIiwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcpIDogUHJvbWlzZTxzdHJpbmc+e1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLnJlbGF5VGFibGUuZmluZEluZGV4KGUgPT4gIWUpO1xyXG4gICAgICAgIGlmKGlkeCA9PSAtMSkgdGhyb3cgXCJjYWxsYmFjayBidWZmZXIgZnVsbCFcIjtcclxuICAgICAgICB0aGlzLnJlbGF5VGFibGVbaWR4XSA9IG5ldyBGdXR1cmU8c3RyaW5nPigpO1xyXG4gICAgICAgIHN1cGVyLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoMCwgaWR4KSArIG1zZyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXlUYWJsZVtpZHhdO1xyXG4gICAgfVxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICB0aGlzLnJlbGF5VGFibGUuZm9yRWFjaChlID0+IGUgJiYgZS5yZWplY3QoW1RyYW5zbWlzc2lvbkNvbnRyb2xFcnJvci5Db25uZWN0aW9uQ2xvc2VkXSkpO1xyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsImV4cG9ydCBjb25zdCB0cmFuc21pc3Npb25jb250cm9sYyA9IHtcclxuICAgIG1heE1lc3NhZ2VCdWZmZXI6IDEwMCxcclxuICAgIHZlcnNpb246IFwiVENETC0xLjAuMFwiXHJcbn0iLCJpbXBvcnQge1Rlc3R9IGZyb20gXCIuL21vZHVsZXMvdGVzdC9UZXN0XCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgVmVyRG9jfSBmcm9tIFwiLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7RGF0YUxpbmt9IGZyb20gXCIuL21vZHVsZXMvZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHtUcmFuc21pc3Npb25Db250cm9sfSBmcm9tIFwiLi9tb2R1bGVzL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbFwiO1xyXG5pbXBvcnQge1JvdXRlclBvcnRzfSBmcm9tIFwiLi9tb2R1bGVzL3JvdXRlci9Sb3V0ZXJQb3J0c1wiO1xyXG5pbXBvcnQge0NhYmxlfSBmcm9tIFwiLi9tb2R1bGVzL3JvdXRlci9DYWJsZVwiO1xyXG5pbXBvcnQge1JvdXRlckNob3JkRmFjdG9yeX0gZnJvbSBcIi4vbW9kdWxlcy9yb3V0ZXIvUm91dGVyQ2hvcmRGYWN0b3J5XCI7XHJcblxyXG5cclxuUHJvbWlzZS5hbGwoW1xyXG4gICAgKGFzeW5jICgpPT57bGV0IGNyID0gbmV3IFRlc3QoXCJDcnlwdG9cIik7XHJcblxyXG4gICAgICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICAgICAgbGV0IHByayA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgbGV0IHZlcmRvYyA9IGF3YWl0IHByay5zaWduKHRvKTtcclxuICAgICAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2MpO1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJ2ZXJkb2Mga2V5IGNvbXBhcmlzb25cIiwgdmVyZG9jLmtleS5oYXNoZWQoKSwgcmVjb25zdHJ1Y3RlZC5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIGNyLmFzc2VydChcInZlcmRvYyBkYXRhIGNvbXBhcmlzb25cIiwgSlNPTi5zdHJpbmdpZnkodmVyZG9jLmRhdGEpLCBKU09OLnN0cmluZ2lmeShyZWNvbnN0cnVjdGVkLmRhdGEpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gY3J5cHRvIHRlc3RcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIkRhdGFMaW5rXCIpO1xyXG5cclxuICAgICAgICBsZXQgdHJhbnNtaXR0ZWQgPSBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgbGV0IGEgPSBuZXcgRGF0YUxpbmsobSA9PiByZXNvbHZlKG0uZGF0YSkpO1xyXG4gICAgICAgICAgICBsZXQgYiA9IG5ldyBEYXRhTGluayhtID0+IGIuc2VuZChcImIgcmVzcG9uZHMgdG8gXCIrbS5kYXRhKSk7XHJcblxyXG4gICAgICAgICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgIGEuc2VuZChcImEgc2F5cyBiZWVwXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNyLmFzc2VydChcInNpbXBsZSBkYXRhIGJvdW5jZVwiLCB0cmFuc21pdHRlZCwgXCJiIHJlc3BvbmRzIHRvIGEgc2F5cyBiZWVwXCIpO1xyXG5cclxuICAgICAgICAvLy8vIHRlc3QgbWVtb3J5IHVzYWdlIC0gaXQncyBzdGF0aWMuXHJcbiAgICAgICAgLy8gZm9yKGxldCBpID0gMDsgaTwxMDAwOyBpKyspe1xyXG4gICAgICAgIC8vICAgICBsZXQgYSA9IG5ldyBEYXRhTGluayhtID0+IGNvbnNvbGUubG9nKTtcclxuICAgICAgICAvLyAgICAgbGV0IGIgPSBuZXcgRGF0YUxpbmsobSA9PiBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgLy8gICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcbiAgICAgICAgLy8gICAgIGF3YWl0IGEucmVhZHk7XHJcbiAgICAgICAgLy8gICAgIGEuY2xvc2UoKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIERhdGEgTGlua1xyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiVHJhbnNtaXNzaW9uIENvbnRyb2xcIik7XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcImEgcmVmbGVjdHM6IFwiK20pO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcImIgcmV0dXJuczogXCIgKyBhd2FpdCBiLnNlbmQoXCJiIHJlZmxlY3RzOiBcIittKSk7XHJcblxyXG4gICAgICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcblxyXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGEuc2VuZChcImFhYVwiKTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwiZHVhbCB0Y3AgYm91bmNlXCIsIHJlc3BvbnNlLCBcImIgcmV0dXJuczogYSByZWZsZWN0czogYiByZWZsZWN0czogYWFhXCIpO1xyXG4gICAgICAgIGxldCBmID0gbnVsbDtcclxuXHJcbiAgICAgICAgbGV0IGMgPSBuZXcgVHJhbnNtaXNzaW9uQ29udHJvbChtID0+IFByb21pc2UucmVqZWN0KFwiZmFpbHVyZVwiKSk7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgVHJhbnNtaXNzaW9uQ29udHJvbChhc3luYyBtID0+IGYoKSk7XHJcblxyXG4gICAgICAgIGMuY29tcGxldGUoYXdhaXQgZC5hbnN3ZXIoYXdhaXQgYy5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGQucmVhZHk7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcInJlbW90ZSBoYW5kbGluZyBwcm9wYWdhdGlvblwiLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShhd2FpdCBkLnNlbmQoXCJib29wXCIpLmNhdGNoKGUgPT4gZSkpLCAnXCJmYWlsdXJlXCInKTtcclxuICAgICAgICBjci5hc3NlcnQoXCJyZW1vdGUgaGFuZGxpbmcgcHJvcGFnYXRpb25cIixcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgYy5zZW5kKFwiYm9vcFwiKS5jYXRjaChlID0+IGUpKSwgJ1wiVHlwZUVycm9yOiBmIGlzIG5vdCBhIGZ1bmN0aW9uXCInKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gVHJhbnNtaXNzaW9uIENvbnRyb2xcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIlJvdXRlciBQb3J0c1wiKTtcclxuXHJcbiAgICAgICAgbGV0IGFrID0gbmV3IFByaXZhdGVLZXkoKTtcclxuICAgICAgICBsZXQgYmsgPSBuZXcgUHJpdmF0ZUtleSgpO1xyXG4gICAgICAgIGxldCBjayA9IG5ldyBQcml2YXRlS2V5KCk7XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFJvdXRlckNob3JkRmFjdG9yeShhayk7XHJcbiAgICAgICAgbGV0IGFzMSA9IChhIGFzIGFueSkuY3JlYXRlUG9ydChhc3luYyAobXNnKSA9PlwiYTEgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGFzMiA9IChhIGFzIGFueSkuY3JlYXRlUG9ydChhc3luYyAobXNnKSA9PlwiYTIgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGFzYiA9IChhIGFzIGFueSkuY3JlYXRlRnJlcXVlbmN5KGFzeW5jIChtc2cpID0+XCJhYiByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICBsZXQgYiA9IG5ldyBSb3V0ZXJDaG9yZEZhY3RvcnkoYmspO1xyXG4gICAgICAgIGxldCBiczEgPSAoYiBhcyBhbnkpLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZykgPT5cImIxIHJlZmxlY3RzOiBcIittc2cpO1xyXG4gICAgICAgIGxldCBiczIgPSAoYiBhcyBhbnkpLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZykgPT5cImIyIHJlZmxlY3RzOiBcIittc2cpO1xyXG4gICAgICAgIGxldCBic2IgPSAoYiBhcyBhbnkpLmNyZWF0ZUZyZXF1ZW5jeShhc3luYyAobXNnKSA9PlwiYmIgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGMgPSBuZXcgUm91dGVyQ2hvcmRGYWN0b3J5KGNrKTtcclxuICAgICAgICBsZXQgY3MxID0gKGMgYXMgYW55KS5jcmVhdGVQb3J0KGFzeW5jIChtc2cpID0+XCJjMSByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICBsZXQgY3MyID0gKGMgYXMgYW55KS5jcmVhdGVQb3J0KGFzeW5jIChtc2cpID0+XCJjMiByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICBsZXQgY3NiID0gKGMgYXMgYW55KS5jcmVhdGVGcmVxdWVuY3koYXN5bmMgKG1zZykgPT5cImNiIHJlZmxlY3RzOiBcIittc2cpO1xyXG5cclxuICAgICAgICBhLmdlbmVyYXRlU29ja2V0KGIucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBjLmdlbmVyYXRlU29ja2V0KGEucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuXHJcbiAgICAgICAgYXdhaXQgYS5yZWFkeTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwiY2hhbm5lbCB0ZXN0IDFcIiwgYXdhaXQgYXMxKFwiYXMxXCIsIDAuNSwgMSksIFwiYjEgcmVmbGVjdHM6IGFzMVwiKTtcclxuXHJcbiAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwiY2hhbm5lbCB0ZXN0IDJcIiwgYXdhaXQgYnMxKFwiYnMxXCIsIDAuNSwgMSksIFwiYTEgcmVmbGVjdHM6IGJzMVwiKTtcclxuICAgICAgICBjci5hc3NlcnQoXCJjaGFubmVsIHRlc3QgM1wiLCBhd2FpdCBiczIoXCJiczJcIiwgMC41LCAxKSwgXCJhMiByZWZsZWN0czogYnMyXCIpO1xyXG5cclxuICAgICAgICBhd2FpdCBjLnJlYWR5O1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJjaGFubmVsIHRlc3QgM1wiLCBKU09OLnN0cmluZ2lmeShcclxuICAgICAgICAgICAgKGF3YWl0IFByb21pc2UuYWxsKGFzYihcImFzYlwiLCAwLjUsIDEpKSlcclxuICAgICAgICAgICAgICAgIC5zb3J0KChhLGIpID0+IChhIGFzIHN0cmluZykubG9jYWxlQ29tcGFyZShiIGFzIHN0cmluZykpKSxcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoWyAnYmIgcmVmbGVjdHM6IGFzYicsICdjYiByZWZsZWN0czogYXNiJyBdKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gUm91dGVyIFBvcnRzXHJcblxyXG5cclxuXSkudGhlbihhID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiVGVzdGluZyBjb21wbGV0ZS5cIik7XHJcbiAgICB3aW5kb3cuY2xvc2UoKVxyXG59KS5jYXRjaChlPT57XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQ1JJVElDQUwgRkFJTFVSRSEgVW5jYXVnaHQgRXhjZXB0aW9uOiBcIixlKTtcclxuICAgIHdpbmRvdy5jbG9zZSgpXHJcbn0pO1xyXG5cclxuXHJcblxyXG4iXSwic291cmNlUm9vdCI6IiJ9