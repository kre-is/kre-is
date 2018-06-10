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

/***/ "./modules/crypto/Fasthash.ts":
/*!************************************!*\
  !*** ./modules/crypto/Fasthash.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utf8buffer_1 = __webpack_require__(/*! ../tools/utf8buffer */ "./modules/tools/utf8buffer.ts");
class Fasthash {
    static string(input) {
        return utf8buffer_1.utf8Encoder.encode(input).reverse().slice(0, 50).
            reverse().
            reduce((a, e, i) => a + e * Math.pow(256, i), 0) /
            Math.pow(256, 50);
    }
}
exports.Fasthash = Fasthash;


/***/ }),

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
        let self = this;
        this.ready = new Promise(resolve => this.datachannel.onopen = () => resolve(self));
        this.closed = new Promise(resolve => this.datachannel.onclose = () => resolve(self));
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

/***/ "./modules/router/Router.ts":
/*!**********************************!*\
  !*** ./modules/router/Router.ts ***!
  \**********************************/
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
const RouterDamned_1 = __webpack_require__(/*! ./RouterDamned */ "./modules/router/RouterDamned.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const Fasthash_1 = __webpack_require__(/*! ../crypto/Fasthash */ "./modules/crypto/Fasthash.ts");
class Router extends RouterDamned_1.RouterDamned {
    constructor(key) {
        super(key);
        this.timedelta = 0;
        this.privateKey = key;
    }
    generateSocket(connector) {
        return super.generateSocket(connector);
    }
    provideConnector() {
        return super.provideConnector();
    }
    createBroadcastChannel(onmessage, bufferSize = 100) {
        let self = this;
        let buffer = [{ t: 0, h: 0 }];
        let channel = this.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () {
            let vobj = yield PrivateKey_1.VerDoc.reconstruct(msg);
            if (vobj.data.t < buffer[0].t)
                throw "Message Too Old";
            if (vobj.data.t > new Date().getTime())
                throw "Message From Future";
            //see if message is in buffer
            let hash = Fasthash_1.Fasthash.string(msg);
            let idx = buffer.findIndex(e => e.h == hash);
            if (idx + 1)
                return '1'; // message already received
            buffer.push({ t: vobj.data.t, h: hash });
            while (buffer.length > bufferSize) {
                buffer.shift();
            }
            try {
                yield onmessage(vobj);
                channel(msg);
            }
            catch (e) {
                throw "Message Rejected by Application: " + e;
            }
            return '0';
        }));
        return (msg) => __awaiter(this, void 0, void 0, function* () {
            let time = new Date().getTime() + self.timedelta;
            let tmsg = yield self.privateKey.sign({
                t: time,
                m: msg
            });
            buffer.push({ t: time, h: Fasthash_1.Fasthash.string(tmsg) });
            channel(tmsg);
        });
    }
}
exports.Router = Router;


/***/ }),

/***/ "./modules/router/RouterCableFactory.ts":
/*!**********************************************!*\
  !*** ./modules/router/RouterCableFactory.ts ***!
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
const ArctableObservable_1 = __webpack_require__(/*! ./arctable/ArctableObservable */ "./modules/router/arctable/ArctableObservable.ts");
class RouterCableFactory extends RouterPorts_1.RouterPorts {
    constructor(key) {
        super();
        this.sign = (o) => key.sign(o);
        let self = this;
        this.relayOffer = this.createPort((msg) => __awaiter(this, void 0, void 0, function* () {
            return yield self.provideConnector()(msg);
        }));
        this.address = key.getPublicHash();
        this.address.then(hash => self.table = new ArctableObservable_1.ArctableObservable(hash));
    }
    /**
     *
     * @param {Connector} connector
     * @param {number} entropy alters the priority of suggested future connections. keep this near 0, and between 0 and 1.
     * @returns {Promise<Cable>} when ready for transmit
     */
    generateSocket(connector, offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.address;
            let self = this;
            let cable = new Cable_1.Cable();
            let suggestion = this.table.getSuggestions()[offset];
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
exports.RouterCableFactory = RouterCableFactory;


/***/ }),

/***/ "./modules/router/RouterDamned.ts":
/*!****************************************!*\
  !*** ./modules/router/RouterDamned.ts ***!
  \****************************************/
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
const RouterCableFactory_1 = __webpack_require__(/*! ./RouterCableFactory */ "./modules/router/RouterCableFactory.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const config_1 = __webpack_require__(/*! ./config */ "./modules/router/config.ts");
const Arctable_1 = __webpack_require__(/*! ./arctable/Arctable */ "./modules/router/arctable/Arctable.ts");
/**
 * demonized-ish
 *
 * tries to connect, until an error happens.
 * then it goes idle, until something in the network changes.
 * REVIEW
 */
class RouterDamned extends RouterCableFactory_1.RouterCableFactory {
    // private readonly timeoutreset = 1000;
    // private timeouttime = this.timeoutreset;
    // private timeoutreference : number;
    constructor(key) {
        super(key);
        this.state = "idle";
        let self = this;
        this.ready.then(() => {
            self.table.health.observe(() => {
                self.rumble();
            });
            self.rumble();
        });
    }
    rumble() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.state) {
                case "idle":
                    {
                        this.state = "seeking";
                        let promised = yield this.rumbleInitial();
                        if (config_1.routerc.verbose)
                            console.log("node: ", yield this.address, " initial rumble: ", promised);
                        this.state = "strapped";
                    }
                    return;
                case "strapped":
                    {
                        this.state = "seeking";
                        try {
                            yield this.generateSocket(this.provideInitialConnector(), 0 //Math.floor(Math.random()**10 * this.table.maxSize)
                            );
                            this.state = "strapped";
                            this.rumble(); //let this tail expire
                        }
                        catch (e) {
                            if (config_1.routerc.verbose)
                                console.warn("Damned Idle:", e);
                            this.state = "strapped";
                        }
                    }
                    return;
                case "seeking": return;
            }
        });
    }
    rumbleInitial() {
        return __awaiter(this, void 0, void 0, function* () {
            // HACK
            let fringes = 10;
            let r = [
                ...new Array(fringes).fill(1).map((e, i) => i),
                ...new Array(fringes - 1).fill(1).map((e, i) => this.table.maxSize - i)
            ];
            let promises = r.map((e) => __awaiter(this, void 0, void 0, function* () {
                yield this.generateSocket(this.provideInitialConnector(), e)
                    .then(e => true)
                    .catch(e => false);
            }));
            return promises;
        });
    }
    provideInitialConnector() {
        let self = this;
        return (offer) => __awaiter(this, void 0, void 0, function* () {
            let doc = yield PrivateKey_1.VerDoc.reconstruct(offer);
            let target = Arctable_1.Arctable.dereference(doc.data.target, doc.key.hashed());
            return self.relayOffer(offer, target, 1);
        });
    }
}
exports.RouterDamned = RouterDamned;


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
     * @returns {OnMessage}
     */
    createFrequency(onmessage) {
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
    constructor(center) {
        super(center);
        this.purgatory = []; // stores pending addresses;
        this.deepStored = 0;
        this.maxSize = Chordioid_1.Chordoid.lookupTable.length - 1;
    }
    add(location, object) {
        let idx = this.ltoi(location);
        let extracted = this.array[idx];
        if (extracted && extracted.key == location)
            return object;
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
        if (this.purgatory.findIndex(e => e.key == location) + 1)
            return object;
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
        if (this.deepStored < 6) {
            return [{
                    location: (this.locus + 0.5) % 1,
                    exponent: 0,
                    efficiency: 0.4999
                }, ...super.getSuggestions()];
        }
        return super.getSuggestions();
    }
}
exports.Arctable = Arctable;


/***/ }),

/***/ "./modules/router/arctable/ArctableObservable.ts":
/*!*******************************************************!*\
  !*** ./modules/router/arctable/ArctableObservable.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Arctable_1 = __webpack_require__(/*! ./Arctable */ "./modules/router/arctable/Arctable.ts");
const Observable_1 = __webpack_require__(/*! ../../tools/Observable */ "./modules/tools/Observable.ts");
class ArctableObservable extends Arctable_1.Arctable {
    constructor() {
        super(...arguments);
        this.health = new Observable_1.Observable(0);
    }
    add(location, object) {
        let ext = super.add(location, object);
        this.health.set(this.health.get() + 1);
        return ext;
    }
    remove(location) {
        let ext = super.remove(location);
        this.health.set(this.health.get() - 1);
        return ext;
    }
}
exports.ArctableObservable = ArctableObservable;


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

/***/ "./modules/router/config.ts":
/*!**********************************!*\
  !*** ./modules/router/config.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.routerc = {
    verbose: true,
    tableDepthBeforeSuggestions: 3
};


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

/***/ "./modules/tools/Observable.ts":
/*!*************************************!*\
  !*** ./modules/tools/Observable.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Observable {
    constructor(initial) {
        this.value = initial;
        this.listeners = [];
    }
    observe(callback) {
        this.listeners.push(callback);
    }
    set(value) {
        if (value !== this.value) {
            this.value = value;
            this.listeners.forEach(e => e(value));
        }
    }
    get() {
        return this.value;
    }
    //remove all subscribers "no more relevant changes happening"
    flush() {
        delete this.listeners;
        this.listeners = [];
    }
}
exports.Observable = Observable;


/***/ }),

/***/ "./modules/tools/sleep.ts":
/*!********************************!*\
  !*** ./modules/tools/sleep.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * use with await
 * @param {number} millis
 * @returns {Promise<void>}
 */
function sleep(millis) {
    return new Promise(r => setTimeout(r(), millis));
}
exports.sleep = sleep;


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
const RouterCableFactory_1 = __webpack_require__(/*! ./modules/router/RouterCableFactory */ "./modules/router/RouterCableFactory.ts");
const RouterDamned_1 = __webpack_require__(/*! ./modules/router/RouterDamned */ "./modules/router/RouterDamned.ts");
const sleep_1 = __webpack_require__(/*! ./modules/tools/sleep */ "./modules/tools/sleep.ts");
const Router_1 = __webpack_require__(/*! ./modules/router/Router */ "./modules/router/Router.ts");
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
        let a = new RouterCableFactory_1.RouterCableFactory(ak);
        let as1 = a.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "a1 reflects: " + msg; }));
        let as2 = a.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "a2 reflects: " + msg; }));
        let asb = a.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "ab reflects: " + msg; }));
        let b = new RouterCableFactory_1.RouterCableFactory(bk);
        let bs1 = b.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "b1 reflects: " + msg; }));
        let bs2 = b.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "b2 reflects: " + msg; }));
        let bsb = b.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "bb reflects: " + msg; }));
        let c = new RouterCableFactory_1.RouterCableFactory(ck);
        let cs1 = c.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "c1 reflects: " + msg; }));
        let cs2 = c.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return "c2 reflects: " + msg; }));
        let csb = c.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return "cb reflects: " + msg; }));
        a.generateSocket(b.provideConnector());
        yield a.ready;
        cr.assert("channel test 1", yield as1("as1", 0.5, 1), "b1 reflects: as1");
        yield c.generateSocket(a.provideConnector());
        yield b.ready;
        cr.assert("channel test 2", yield bs1("bs1", 0.5, 1), "a1 reflects: bs1");
        cr.assert("channel test 3", yield bs2("bs2", 0.5, 1), "a2 reflects: bs2");
        yield c.ready;
        cr.assert("channel test 3", JSON.stringify((yield Promise.all(asb("asb", 0.5, 1)))
            .sort((a, b) => a.localeCompare(b))), JSON.stringify(['bb reflects: asb', 'cb reflects: asb']));
        return cr.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Router Daemon");
        class RouterTest extends RouterDamned_1.RouterDamned {
            constructor(name) {
                super(new PrivateKey_1.PrivateKey());
                this.c1 = this.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return name + "c1 reflects: " + msg; }));
                this.c2 = this.createPort((msg) => __awaiter(this, void 0, void 0, function* () { return name + "c2 reflects: " + msg; }));
                this.b1 = this.createFrequency((msg) => __awaiter(this, void 0, void 0, function* () { return name + "b1 reflects: " + msg; }));
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
        yield a.ready;
        yield b.ready;
        yield c.ready;
        yield d.ready;
        yield e.ready;
        yield sleep_1.sleep(5000);
        cr.assert("daemon test 1", JSON.stringify((yield Promise.all(a.b1("asb")))
            .sort((a, b) => a.localeCompare(b))), JSON.stringify(['bb reflects: asb', 'cb reflects: asb']));
        // (window as any).a = a;
        // (window as any ).b = b;
        // (window as any ).c = c;
        return cr.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Router");
        class RouterTest extends Router_1.Router {
            constructor(name) {
                super(new PrivateKey_1.PrivateKey());
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
        yield a.ready;
        yield b.ready;
        yield c.ready;
        yield d.ready;
        yield e.ready;
        yield sleep_1.sleep(5000);
        window.a = a;
        window.b = b;
        window.c = c;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vRmFzdGhhc2gudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2RhdGFsaW5rL0RhdGFMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbW9kdWxlcy1vbGQvZGF0YWxpbmsvY29uZmlnLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL0NhYmxlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL1JvdXRlci50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9Sb3V0ZXJDYWJsZUZhY3RvcnkudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9yb3V0ZXIvUm91dGVyRGFtbmVkLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL1JvdXRlckludGVybmFsLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL1JvdXRlclBvcnRzLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL2FyY3RhYmxlL0FyY3RhYmxlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvcm91dGVyL2FyY3RhYmxlL0FyY3RhYmxlT2JzZXJ2YWJsZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3JvdXRlci9hcmN0YWJsZS9DaG9yZGlvaWQudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9yb3V0ZXIvY29uZmlnLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdGVzdC9UZXN0LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvRnV0dXJlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvT2JzZXJ2YWJsZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL3NsZWVwLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvdXRmOGJ1ZmZlci50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3RyYW5zbWlzc2lvbmNvbnRyb2wvY29uZmlnLnRzIiwid2VicGFjazovLy8uL3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ25FQSxxR0FBZ0Q7QUFFaEQ7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWM7UUFDeEIsT0FBTyx3QkFBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQztZQUN0RCxPQUFPLEVBQUU7WUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7Q0FDSjtBQVBELDRC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QUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFFdkMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRWQsTUFBTSxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakIsTUFBYyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsTUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsTUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFHdkIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQyxFQUFDLEVBQUU7Q0FHUCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0lBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRTtJQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNsQixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vdGVzdC50c1wiKTtcbiIsImltcG9ydCB7dXRmOEVuY29kZXJ9IGZyb20gXCIuLi90b29scy91dGY4YnVmZmVyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFzdGhhc2gge1xyXG4gICAgc3RhdGljIHN0cmluZyhpbnB1dCA6IHN0cmluZyl7XHJcbiAgICAgICAgcmV0dXJuIHV0ZjhFbmNvZGVyLmVuY29kZShpbnB1dCkucmV2ZXJzZSgpLnNsaWNlKDAsNTApLlxyXG4gICAgICAgIHJldmVyc2UoKS5cclxuICAgICAgICByZWR1Y2UoKGEsZSxpKT0+YStlKk1hdGgucG93KDI1NixpKSwgMCkgL1xyXG4gICAgICAgIE1hdGgucG93KDI1NiwgNTApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHt1dGY4RGVjb2RlciwgdXRmOEVuY29kZXJ9IGZyb20gXCIuLi90b29scy91dGY4YnVmZmVyXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFByaXZhdGVLZXkge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWFkeSA6IFByb21pc2VMaWtlPGFueT47XHJcbiAgICBwcml2YXRlIHByaXZhdGVLZXkgOiBDcnlwdG9LZXk7XHJcbiAgICBwcml2YXRlIHB1YmxpY0tleSA6IFB1YmxpY0tleTtcclxuICAgIHJlYWRvbmx5IHZlcnNpb24gPSAyO1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSB3aW5kb3cuY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgW1wic2lnblwiLCBcInZlcmlmeVwiXVxyXG4gICAgICAgICAgICApLnRoZW4oa2V5cyA9PiB7IC8va2V5czoge3ByaXZhdGVLZXk6IENyeXB0b0tleSwgcHVibGljS2V5OiBDcnlwdG9LZXl9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBrZXlzLnByaXZhdGVLZXk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVibGljS2V5XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KS50aGVuKGp3ayA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG5ldyBQdWJsaWNLZXkoandrKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbjxUPihvYmogOiBUKSA6IFByb21pc2U8VmVyRG9jPFQ+PiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaik7XHJcbiAgICAgICAgbGV0IHB1ayA9IHRoaXMucHVibGljS2V5LnRvSlNPTigpO1xyXG4gICAgICAgIGxldCBoZWFkZXIgPSBTdHJpbmcuZnJvbUNvZGVQb2ludCh0aGlzLnZlcnNpb24sIHB1ay5sZW5ndGgsIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICBsZXQgc2lnbmFibGUgPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IHNpZ2J1ZmZlciA9IGF3YWl0IHdpbmRvdy5jcnlwdG8uc3VidGxlLnNpZ24oXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSxcclxuICAgICAgICAgICAgc2lnbmFibGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICBsZXQgdWZ0ID0gIG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcik7XHJcbiAgICAgICAgbGV0IGNoZWMyID0gbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG5cclxuICAgICAgICBsZXQgdmQgPSBuZXcgVmVyRG9jPFQ+KCBoZWFkZXIrcHVrK2RhdGErU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4ubmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKSkpO1xyXG5cclxuICAgICAgICB2ZC5rZXkgPSB0aGlzLnB1YmxpY0tleTtcclxuICAgICAgICB2ZC5kYXRhID0gb2JqO1xyXG4gICAgICAgIHZkLnNpZ25hdHVyZSA9IEpTT04uc3RyaW5naWZ5KG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcikpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICB9XHJcbiAgICBhc3luYyBnZXRQdWJsaWNIYXNoKCkgOiBQcm9taXNlPG51bWJlcj57XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNLZXkuaGFzaGVkKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJEb2MgREFPXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmF3RG9jPFQ+IGV4dGVuZHMgU3RyaW5ne1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZlckRvYzxUPiBleHRlbmRzIFJhd0RvYzxUPntcclxuICAgIGRhdGE6IFQ7XHJcbiAgICBrZXk6IFB1YmxpY0tleTtcclxuICAgIHNpZ25hdHVyZTogc3RyaW5nO1xyXG4gICAgc3RhdGljIGFzeW5jIHJlY29uc3RydWN0PFQ+KHJhd0RvYyA6IFJhd0RvYzxUPikgOiBQcm9taXNlPFZlckRvYzxUPj57XHJcbiAgICAgICAgbGV0IHZlcnNpb24gPSByYXdEb2MuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodmVyc2lvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IHJhd0RvYy5zdWJzdHJpbmcoMCwzKTtcclxuICAgICAgICAgICAgICAgIGxldCBwdWsgPSByYXdEb2Muc3Vic3RyKDMsIHJhd0RvYy5jb2RlUG9pbnRBdCgxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHJhd0RvYy5zdWJzdHIoMyArIHJhd0RvYy5jb2RlUG9pbnRBdCgxKSwgcmF3RG9jLmNvZGVQb2ludEF0KDIpKTtcclxuICAgICAgICAgICAgICAgIGxldCBzaWcgPSByYXdEb2Muc3Vic3RyKDMgKyByYXdEb2MuY29kZVBvaW50QXQoMSkgKyByYXdEb2MuY29kZVBvaW50QXQoMikpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBrZXkgPSBhd2FpdCBuZXcgUHVibGljS2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1a1xyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICkucmVhZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrc20gPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdWZ0ID0gIHV0ZjhFbmNvZGVyLmVuY29kZShzaWcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWMyID0gdXRmOEVuY29kZXIuZW5jb2RlKHNpZykucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKFxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGtleS52ZXJpZnkodXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSksIG5ldyBVaW50OEFycmF5KHNpZy5zcGxpdCgnJykubWFwKGMgPT4gYy5jb2RlUG9pbnRBdCgwKSkpKVxyXG4gICAgICAgICAgICAgICAgKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmQgPSBuZXcgVmVyRG9jPFQ+KHJhd0RvYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQuc2lnbmF0dXJlID0gc2lnO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmtleSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiYmFkIGRvY3VtZW50XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBQcm9taXNlLnJlamVjdChcInZlcnNpb24gdW5zdXBwb3J0ZWQ6IFwiK3ZlcnNpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gaGFzaCBQLTM4NCBTUEtJIGludG8gKDAsMSkgZmxvYXRcclxuZnVuY3Rpb24gU1BLSXRvTnVtZXJpYyhzcGtpOiBBcnJheUJ1ZmZlcikgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNwa2kpLlxyXG4gICAgICAgIHNsaWNlKC05NikuXHJcbiAgICAgICAgcmV2ZXJzZSgpLlxyXG4gICAgICAgIHJlZHVjZSgoYSxlLGkpPT5hK2UqTWF0aC5wb3coMjU2LGkpLCAwKSAvXHJcbiAgICAgICAgTWF0aC5wb3coMjU2LCA5Nik7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQdWJsaWNLZXkge1xyXG4gICAgcHJpdmF0ZSBwdWJsaWNDcnlwdG9LZXk6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgZmxvYXRpbmc6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgandrOiBKc29uV2ViS2V5O1xyXG4gICAgcmVhZHk7XHJcbiAgICBjb25zdHJ1Y3Rvcihqd2s6IEpzb25XZWJLZXkpe1xyXG4gICAgICAgIGxldCBwcm90b0pXSyA9IHtcImNydlwiOlwiUC0zODRcIiwgXCJleHRcIjp0cnVlLCBcImtleV9vcHNcIjpbXCJ2ZXJpZnlcIl0sIFwia3R5XCI6XCJFQ1wiLCBcInhcIjpqd2tbXCJ4XCJdLCBcInlcIjpqd2tbXCJ5XCJdfTtcclxuICAgICAgICB0aGlzLmZsb2F0aW5nID0gTmFOO1xyXG4gICAgICAgIHRoaXMuandrID0gcHJvdG9KV0s7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmltcG9ydEtleShcclxuICAgICAgICAgICAgXCJqd2tcIixcclxuICAgICAgICAgICAgdGhpcy5qd2ssXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIG5hbWVkQ3VydmU6IFwiUC0zODRcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgW1widmVyaWZ5XCJdXHJcbiAgICAgICAgKS50aGVuKHB1YmxpY0NyeXB0b0tleSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5ID0gcHVibGljQ3J5cHRvS2V5O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgIFwic3BraVwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXlcclxuICAgICAgICAgICAgKS50aGVuKHNwa2kgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mbG9hdGluZyA9IFNQS0l0b051bWVyaWMoc3BraSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkudGhlbigoKT0+dGhpcyk7XHJcbiAgICB9XHJcbiAgICBoYXNoZWQoKXtcclxuICAgICAgICBpZihpc05hTih0aGlzLmZsb2F0aW5nKSkgdGhyb3cgRXJyb3IoXCJOb3QgUmVhZHkuXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZsb2F0aW5nO1xyXG4gICAgfVxyXG4gICAgdG9KU09OKCl7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcInhcIjogdGhpcy5qd2tbXCJ4XCJdLCBcInlcIjogdGhpcy5qd2tbXCJ5XCJdfSk7XHJcbiAgICB9XHJcbiAgICB2ZXJpZnkoZGF0YTogVWludDhBcnJheSwgc2lnbmF0dXJlOiBBcnJheUJ1ZmZlcik6IFByb21pc2VMaWtlPGJvb2xlYW4+e1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuY3J5cHRvLnN1YnRsZS52ZXJpZnkoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5LFxyXG4gICAgICAgICAgICBzaWduYXR1cmUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGZyb21TdHJpbmcoandrc3RyaW5nOiBzdHJpbmcpOiBQdWJsaWNLZXl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQdWJsaWNLZXkoSlNPTi5wYXJzZShqd2tzdHJpbmcpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7ZGF0YWxpbmtjfSBmcm9tIFwiLi4vbW9kdWxlcy1vbGQvZGF0YWxpbmsvY29uZmlnXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRGF0YUxpbmsgZXh0ZW5kcyBSVENQZWVyQ29ubmVjdGlvbntcclxuICAgIHByb3RlY3RlZCBkYXRhY2hhbm5lbCA6IFJUQ0RhdGFDaGFubmVsO1xyXG4gICAgcmVhZG9ubHkgcmVhZHkgOiBQcm9taXNlPHRoaXM+O1xyXG4gICAgcmVhZG9ubHkgY2xvc2VkIDogUHJvbWlzZTx0aGlzPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihvbm1lc3NhZ2UgOiAobXNnIDogTWVzc2FnZUV2ZW50KT0+IHZvaWQgKXtcclxuICAgICAgICBzdXBlcihkYXRhbGlua2MpO1xyXG4gICAgICAgIHRoaXMuZGF0YWNoYW5uZWwgPSAodGhpcyBhcyBhbnkpXHJcbiAgICAgICAgICAgIC5jcmVhdGVEYXRhQ2hhbm5lbChcImRhdGFcIiwge25lZ290aWF0ZWQ6IHRydWUsIGlkOiAwLCBvcmRlcmVkOiBmYWxzZX0pO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IG5ldyBQcm9taXNlPHRoaXM+KCByZXNvbHZlID0+IHRoaXMuZGF0YWNoYW5uZWwub25vcGVuID0gKCk9PiByZXNvbHZlKHNlbGYpKTtcclxuICAgICAgICB0aGlzLmNsb3NlZCA9IG5ldyBQcm9taXNlPHRoaXM+KCByZXNvbHZlID0+IHRoaXMuZGF0YWNoYW5uZWwub25jbG9zZSA9ICgpPT4gcmVzb2x2ZShzZWxmKSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YWNoYW5uZWwub25tZXNzYWdlID0gb25tZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbmQobXNnIDogc3RyaW5nIHwgQmxvYiB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3KSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGF0YWNoYW5uZWwuc2VuZChtc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG9mZmVyKCkgOiBQcm9taXNlPE9mZmVyPntcclxuICAgICAgICB0aGlzLnNldExvY2FsRGVzY3JpcHRpb24oYXdhaXQgdGhpcy5jcmVhdGVPZmZlcigpKTtcclxuXHJcbiAgICAgICAgLy8gcHJvbWlzZSB0byB3YWl0IGZvciB0aGUgc2RwXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPE9mZmVyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQodGhpcy5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGFuc3dlcihvZmZlciA6IE9mZmVyKSA6IFByb21pc2U8QW5zd2VyPntcclxuICAgICAgICB0aGlzLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9mZmVyXCIsXHJcbiAgICAgICAgICAgIHNkcDogb2ZmZXIgYXMgc3RyaW5nXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMuc2V0TG9jYWxEZXNjcmlwdGlvbihhd2FpdCB0aGlzLmNyZWF0ZUFuc3dlcigpKTtcclxuXHJcbiAgICAgICAgLy8gcHJvbWlzZSB0byB3YWl0IGZvciB0aGUgc2RwXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEFuc3dlcj4oKGFjY2VwdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uaWNlY2FuZGlkYXRlID0gZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgYWNjZXB0KHRoaXMubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBjb21wbGV0ZShhbnN3ZXIgOiBBbnN3ZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgICAgICAgdHlwZTogXCJhbnN3ZXJcIixcclxuICAgICAgICAgICAgc2RwOiBhbnN3ZXIgYXMgc3RyaW5nXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE9mZmVyIGV4dGVuZHMgU3RyaW5ne31cclxuZXhwb3J0IGNsYXNzIEFuc3dlciBleHRlbmRzIFN0cmluZ3t9XHJcblxyXG5pbnRlcmZhY2UgUlRDRGF0YUNoYW5uZWwgZXh0ZW5kcyBFdmVudFRhcmdldHtcclxuICAgIG9uY2xvc2U6IEZ1bmN0aW9uO1xyXG4gICAgb25lcnJvcjogRnVuY3Rpb247XHJcbiAgICBvbm1lc3NhZ2U6IEZ1bmN0aW9uO1xyXG4gICAgb25vcGVuOiBGdW5jdGlvbjtcclxuICAgIGNsb3NlKCk7XHJcbiAgICBzZW5kKG1zZyA6IHN0cmluZyB8IEJsb2IgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldyk7XHJcbn0iLCJleHBvcnQgY29uc3QgZGF0YWxpbmtjID0ge1xyXG4gICAgaWNlU2VydmVyczogW3t1cmxzOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dXHJcbn07IiwiaW1wb3J0IHtUcmFuc21pc3Npb25Db250cm9sfSBmcm9tIFwiLi4vdHJhbnNtaXNzaW9uY29udHJvbC9UcmFuc21pc3Npb25Db250cm9sXCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgUHVibGljS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7QW5zd2VyLCBPZmZlcn0gZnJvbSBcIi4uL2RhdGFsaW5rL0RhdGFMaW5rXCI7XHJcbmltcG9ydCB7QXJjdGFibGV9IGZyb20gXCIuL2FyY3RhYmxlL0FyY3RhYmxlXCI7XHJcbmltcG9ydCB7Um91dGVySW50ZXJuYWx9IGZyb20gXCIuL1JvdXRlckludGVybmFsXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2FibGUgZXh0ZW5kcyBUcmFuc21pc3Npb25Db250cm9se1xyXG4gICAgZGF0ZU9mQ3JlYXRpb24gOiBudW1iZXI7XHJcbiAgICBrZXkgOiBQdWJsaWNLZXk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigoZSk9Pnt0aHJvdyBlfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG9mZmVyKCkgOiBQcm9taXNlPE9mZmVyPntcclxuICAgICAgICB0aGlzLmRhdGVPZkNyZWF0aW9uID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLm9mZmVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgYW5zd2VyKG9mZmVyIDogT2ZmZXIpIDogUHJvbWlzZTxBbnN3ZXI+e1xyXG4gICAgICAgIHRoaXMuZGF0ZU9mQ3JlYXRpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuYW5zd2VyKG9mZmVyKVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSYXdDYWJsZU9mZmVye1xyXG4gICAgdGFyZ2V0OiBudW1iZXIsIC8vZXhwb25lbnRcclxuICAgIHRvbGVyYW5jZSA6IG51bWJlcixcclxuICAgIHNkcCA6IE9mZmVyXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FibGVPZmZlciBleHRlbmRzIFJhd0RvYzxSYXdDYWJsZU9mZmVyPntcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FibGVBbnN3ZXIgZXh0ZW5kcyBSYXdEb2M8QW5zd2VyPntcclxuXHJcbn1cclxuIiwiaW1wb3J0IHtSb3V0ZXJEYW1uZWR9IGZyb20gXCIuL1JvdXRlckRhbW5lZFwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rvcn0gZnJvbSBcIi4vUm91dGVyQ2FibGVGYWN0b3J5XCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgUmF3RG9jLCBWZXJEb2N9IGZyb20gXCIuLi9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5pbXBvcnQge0Zhc3RoYXNofSBmcm9tIFwiLi4vY3J5cHRvL0Zhc3RoYXNoXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUm91dGVyIGV4dGVuZHMgUm91dGVyRGFtbmVke1xyXG4gICAgdGltZWRlbHRhID0gMDtcclxuICAgIHJlYWRvbmx5IHByaXZhdGVLZXkgOiBQcml2YXRlS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGtleSA6IFByaXZhdGVLZXkpe1xyXG4gICAgICAgIHN1cGVyKGtleSk7XHJcbiAgICAgICAgdGhpcy5wcml2YXRlS2V5ID0ga2V5O1xyXG4gICAgfVxyXG5cclxuICAgIGdlbmVyYXRlU29ja2V0KGNvbm5lY3RvciA6IENvbm5lY3Rvcil7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdlbmVyYXRlU29ja2V0KGNvbm5lY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdmlkZUNvbm5lY3Rvcigpe1xyXG4gICAgICAgIHJldHVybiBzdXBlci5wcm92aWRlQ29ubmVjdG9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQnJvYWRjYXN0Q2hhbm5lbChvbm1lc3NhZ2UsIGJ1ZmZlclNpemUgPSAxMDApIDogKG1zZyA6IE9iamVjdCkgPT4gdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBidWZmZXIgOiB7dDogbnVtYmVyLCBoOiBudW1iZXJ9W10gPSBbe3Q6MCwgaDowfV07XHJcblxyXG4gICAgICAgIGxldCBjaGFubmVsID0gdGhpcy5jcmVhdGVGcmVxdWVuY3koYXN5bmMgbXNnID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCB2b2JqID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0KG1zZyBhcyBSYXdEb2M8e3Q6bnVtYmVyLCBtOk9iamVjdH0+KTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZih2b2JqLmRhdGEudCA8IGJ1ZmZlclswXS50KSB0aHJvdyBcIk1lc3NhZ2UgVG9vIE9sZFwiO1xyXG4gICAgICAgICAgICBpZih2b2JqLmRhdGEudCA+IG5ldyBEYXRlKCkuZ2V0VGltZSgpKSB0aHJvdyBcIk1lc3NhZ2UgRnJvbSBGdXR1cmVcIjtcclxuXHJcbiAgICAgICAgICAgIC8vc2VlIGlmIG1lc3NhZ2UgaXMgaW4gYnVmZmVyXHJcbiAgICAgICAgICAgIGxldCBoYXNoID0gRmFzdGhhc2guc3RyaW5nKG1zZyk7XHJcbiAgICAgICAgICAgIGxldCBpZHggPSBidWZmZXIuZmluZEluZGV4KGUgPT4gZS5oID09IGhhc2gpO1xyXG5cclxuICAgICAgICAgICAgaWYoaWR4KzEpIHJldHVybiAnMSc7IC8vIG1lc3NhZ2UgYWxyZWFkeSByZWNlaXZlZFxyXG5cclxuICAgICAgICAgICAgYnVmZmVyLnB1c2goe3Q6IHZvYmouZGF0YS50LCBoOiBoYXNofSk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZShidWZmZXIubGVuZ3RoID4gYnVmZmVyU2l6ZSl7XHJcbiAgICAgICAgICAgICAgICBidWZmZXIuc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgb25tZXNzYWdlKHZvYmopO1xyXG4gICAgICAgICAgICAgICAgY2hhbm5lbChtc2cpO1xyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJNZXNzYWdlIFJlamVjdGVkIGJ5IEFwcGxpY2F0aW9uOiBcIitlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnMCc7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gYXN5bmMgKG1zZyA6IE9iamVjdCk9PntcclxuICAgICAgICAgICAgbGV0IHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIHNlbGYudGltZWRlbHRhO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRtc2cgPSBhd2FpdCBzZWxmLnByaXZhdGVLZXkuc2lnbih7XHJcbiAgICAgICAgICAgICAgICB0OiB0aW1lLFxyXG4gICAgICAgICAgICAgICAgbTogbXNnXHJcbiAgICAgICAgICAgIH0pIGFzIGFueTtcclxuXHJcbiAgICAgICAgICAgIGJ1ZmZlci5wdXNoKHt0OiB0aW1lLCBoOiBGYXN0aGFzaC5zdHJpbmcodG1zZyl9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNoYW5uZWwodG1zZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQge1JvdXRlclBvcnRzfSBmcm9tIFwiLi9Sb3V0ZXJQb3J0c1wiO1xyXG5pbXBvcnQge0NhYmxlLCBDYWJsZUFuc3dlciwgQ2FibGVPZmZlciwgUmF3Q2FibGVPZmZlcn0gZnJvbSBcIi4vQ2FibGVcIjtcclxuaW1wb3J0IHtBcmN0YWJsZX0gZnJvbSBcIi4vYXJjdGFibGUvQXJjdGFibGVcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7QW5zd2VyfSBmcm9tIFwiLi4vZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHtBcmN0YWJsZU9ic2VydmFibGV9IGZyb20gXCIuL2FyY3RhYmxlL0FyY3RhYmxlT2JzZXJ2YWJsZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFJvdXRlckNhYmxlRmFjdG9yeSBleHRlbmRzIFJvdXRlclBvcnRze1xyXG4gICAgcmVhZG9ubHkgYWRkcmVzcyA6IFByb21pc2U8bnVtYmVyPjtcclxuICAgIHJlYWRvbmx5IHNpZ24gOiA8VD4oZG9jIDogVCk9PlByb21pc2U8UmF3RG9jPFQ+PjtcclxuICAgIHByb3RlY3RlZCByZWxheU9mZmVyOiAobXNnOiBzdHJpbmcsIHRhcmdldDogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlcikgPT4gUHJvbWlzZTxTdHJpbmc+O1xyXG4gICAgY29uc3RydWN0b3Ioa2V5IDogUHJpdmF0ZUtleSl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaWduID0gKG8pPT5rZXkuc2lnbihvKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMucmVsYXlPZmZlciA9IHRoaXMuY3JlYXRlUG9ydChhc3luYyAobXNnIDogQ2FibGVPZmZlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgc2VsZi5wcm92aWRlQ29ubmVjdG9yKCkobXNnKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGtleS5nZXRQdWJsaWNIYXNoKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkcmVzcy50aGVuKGhhc2ggPT4gc2VsZi50YWJsZSA9IG5ldyBBcmN0YWJsZU9ic2VydmFibGU8Q2FibGU+KGhhc2gpKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Nvbm5lY3Rvcn0gY29ubmVjdG9yXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW50cm9weSBhbHRlcnMgdGhlIHByaW9yaXR5IG9mIHN1Z2dlc3RlZCBmdXR1cmUgY29ubmVjdGlvbnMuIGtlZXAgdGhpcyBuZWFyIDAsIGFuZCBiZXR3ZWVuIDAgYW5kIDEuXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDYWJsZT59IHdoZW4gcmVhZHkgZm9yIHRyYW5zbWl0XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdlbmVyYXRlU29ja2V0KGNvbm5lY3RvciA6IENvbm5lY3Rvciwgb2Zmc2V0ID0gMCl7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMuYWRkcmVzcztcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgY2FibGUgPSBuZXcgQ2FibGUoKTtcclxuXHJcbiAgICAgICAgbGV0IHN1Z2dlc3Rpb24gPSB0aGlzLnRhYmxlLmdldFN1Z2dlc3Rpb25zKClbXHJcbiAgICAgICAgICAgICAgICBvZmZzZXRcclxuICAgICAgICAgICAgXTtcclxuXHJcblxyXG4gICAgICAgIGxldCBvZmZlciA9IGF3YWl0IHRoaXMuc2lnbih7XHJcbiAgICAgICAgICAgIHRhcmdldDogc3VnZ2VzdGlvbi5leHBvbmVudCxcclxuICAgICAgICAgICAgdG9sZXJhbmNlIDogc3VnZ2VzdGlvbi5lZmZpY2llbmN5LFxyXG4gICAgICAgICAgICBzZHAgOiBhd2FpdCBjYWJsZS5vZmZlcigpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgbGV0IGFuc3dlciA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdDxBbnN3ZXI+KGF3YWl0IGNvbm5lY3RvcihvZmZlcikpO1xyXG4gICAgICAgICAgICBjYWJsZS5rZXkgPSBhbnN3ZXIua2V5O1xyXG4gICAgICAgICAgICBhd2FpdCBjYWJsZS5jb21wbGV0ZShhbnN3ZXIuZGF0YSk7XHJcblxyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgY2FibGUuY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhyb3cgXCJDb25uZWN0aW9uIGZhaWxlZDogXCIgKyBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXdhaXQgY2FibGUucmVhZHk7XHJcbiAgICAgICAgY2FibGUuY2xvc2VkLnRoZW4oKCk9PnNlbGYuZGV0YWNoKGNhYmxlKSk7XHJcbiAgICAgICAgc2VsZi5hdHRhY2goY2FibGUpO1xyXG4gICAgICAgIHJldHVybiBjYWJsZS5yZWFkeTtcclxuICAgIH1cclxuXHJcbiAgICBwcm92aWRlQ29ubmVjdG9yKCkgOiBDb25uZWN0b3J7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBhc3luYyAob2ZmZXIgOiBDYWJsZU9mZmVyKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0PFJhd0NhYmxlT2ZmZXI+KG9mZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBBcmN0YWJsZS5kZXJlZmVyZW5jZShkb2MuZGF0YS50YXJnZXQsIGRvYy5rZXkuaGFzaGVkKCkpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gQXJjdGFibGUuZGlzdGFuY2UodGFyZ2V0LCBhd2FpdCBzZWxmLmFkZHJlc3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID49IGRvYy5kYXRhLnRvbGVyYW5jZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnJlbGF5T2ZmZXIob2ZmZXIgYXMgc3RyaW5nLCB0YXJnZXQsIGRpc3RhbmNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhIHRoaXMudGFibGUuaXNEZXNpcmFibGUoZG9jLmtleS5oYXNoZWQoKSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5yZWxheU9mZmVyKG9mZmVyIGFzIHN0cmluZywgdGFyZ2V0LCBkaXN0YW5jZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2FibGUgPSBuZXcgQ2FibGUoKTtcclxuXHJcbiAgICAgICAgICAgIGNhYmxlLmtleSA9IGRvYy5rZXk7XHJcblxyXG4gICAgICAgICAgICBjYWJsZS5yZWFkeS50aGVuKCgpPT4gc2VsZi5hdHRhY2goY2FibGUpKTtcclxuICAgICAgICAgICAgY2FibGUuY2xvc2VkLnRoZW4oKCk9PnNlbGYuZGV0YWNoKGNhYmxlKSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zaWduKGF3YWl0IGNhYmxlLmFuc3dlcihkb2MuZGF0YS5zZHApKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbm5lY3RvciB7XHJcbiAgICAob2ZmZXIgOiBDYWJsZU9mZmVyKSA6IFByb21pc2U8Q2FibGVBbnN3ZXI+XHJcbn1cclxuXHJcbiIsImltcG9ydCB7Um91dGVySW50ZXJuYWx9IGZyb20gXCIuL1JvdXRlckludGVybmFsXCI7XHJcbmltcG9ydCB7Q2FibGUsIENhYmxlT2ZmZXIsIFJhd0NhYmxlT2ZmZXJ9IGZyb20gXCIuL0NhYmxlXCI7XHJcbmltcG9ydCB7Q29ubmVjdG9yLCBSb3V0ZXJDYWJsZUZhY3Rvcnl9IGZyb20gXCIuL1JvdXRlckNhYmxlRmFjdG9yeVwiO1xyXG5pbXBvcnQge1ByaXZhdGVLZXksIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7cm91dGVyY30gZnJvbSBcIi4vY29uZmlnXCI7XHJcbmltcG9ydCB7QXJjdGFibGV9IGZyb20gXCIuL2FyY3RhYmxlL0FyY3RhYmxlXCI7XHJcblxyXG4vKipcclxuICogZGVtb25pemVkLWlzaFxyXG4gKlxyXG4gKiB0cmllcyB0byBjb25uZWN0LCB1bnRpbCBhbiBlcnJvciBoYXBwZW5zLlxyXG4gKiB0aGVuIGl0IGdvZXMgaWRsZSwgdW50aWwgc29tZXRoaW5nIGluIHRoZSBuZXR3b3JrIGNoYW5nZXMuXHJcbiAqIFJFVklFV1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJvdXRlckRhbW5lZCBleHRlbmRzIFJvdXRlckNhYmxlRmFjdG9yeXtcclxuICAgIHByaXZhdGUgc3RhdGU6IFwiaWRsZVwiIHwgXCJzZWVraW5nXCIgfCBcInN0cmFwcGVkXCIgfCBcInRpbWVvdXRcIiA9IFwiaWRsZVwiO1xyXG4gICAgLy8gcHJpdmF0ZSByZWFkb25seSB0aW1lb3V0cmVzZXQgPSAxMDAwO1xyXG4gICAgLy8gcHJpdmF0ZSB0aW1lb3V0dGltZSA9IHRoaXMudGltZW91dHJlc2V0O1xyXG4gICAgLy8gcHJpdmF0ZSB0aW1lb3V0cmVmZXJlbmNlIDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGtleTogUHJpdmF0ZUtleSl7XHJcbiAgICAgICAgc3VwZXIoa2V5KTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB0aGlzLnJlYWR5LnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBzZWxmLnRhYmxlLmhlYWx0aC5vYnNlcnZlKCgpPT57XHJcbiAgICAgICAgICAgICAgICBzZWxmLnJ1bWJsZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2VsZi5ydW1ibGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgcnVtYmxlKCl7XHJcbiAgICAgICAgc3dpdGNoKHRoaXMuc3RhdGUpe1xyXG4gICAgICAgICAgICBjYXNlIFwiaWRsZVwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInNlZWtpbmdcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbWlzZWQgPSBhd2FpdCB0aGlzLnJ1bWJsZUluaXRpYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihyb3V0ZXJjLnZlcmJvc2UpIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5vZGU6IFwiLCBhd2FpdCB0aGlzLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluaXRpYWwgcnVtYmxlOiBcIiwgcHJvbWlzZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInN0cmFwcGVkXCI7XHJcbiAgICAgICAgICAgICAgICB9IHJldHVybjtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmFwcGVkXCI6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInNlZWtpbmdcIjtcclxuICAgICAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmdlbmVyYXRlU29ja2V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3ZpZGVJbml0aWFsQ29ubmVjdG9yKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAgLy9NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqKjEwICogdGhpcy50YWJsZS5tYXhTaXplKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwic3RyYXBwZWRcIjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bWJsZSgpOyAvL2xldCB0aGlzIHRhaWwgZXhwaXJlXHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihyb3V0ZXJjLnZlcmJvc2UpIGNvbnNvbGUud2FybihcIkRhbW5lZCBJZGxlOlwiLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJzdHJhcHBlZFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IHJldHVybjtcclxuICAgICAgICAgICAgY2FzZSBcInNlZWtpbmdcIjogcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHJ1bWJsZUluaXRpYWwoKXtcclxuICAgICAgICAvLyBIQUNLXHJcbiAgICAgICAgbGV0IGZyaW5nZXMgPSAxMDtcclxuICAgICAgICBsZXQgciA9IFtcclxuICAgICAgICAgICAgLi4uIG5ldyBBcnJheShmcmluZ2VzKS5maWxsKDEpLm1hcCgoZSxpKT0+IGkpLFxyXG4gICAgICAgICAgICAuLi4gbmV3IEFycmF5KGZyaW5nZXMtMSkuZmlsbCgxKS5tYXAoKGUsaSk9PiB0aGlzLnRhYmxlLm1heFNpemUgLWkpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbGV0IHByb21pc2VzID0gci5tYXAoYXN5bmMgZSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZ2VuZXJhdGVTb2NrZXQodGhpcy5wcm92aWRlSW5pdGlhbENvbm5lY3RvcigpLCBlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZT0+dHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IGZhbHNlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByb3ZpZGVJbml0aWFsQ29ubmVjdG9yKCkgOiBDb25uZWN0b3J7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBhc3luYyAob2ZmZXIgOiBDYWJsZU9mZmVyKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0PFJhd0NhYmxlT2ZmZXI+KG9mZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBBcmN0YWJsZS5kZXJlZmVyZW5jZShkb2MuZGF0YS50YXJnZXQsIGRvYy5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYucmVsYXlPZmZlcihvZmZlciBhcyBzdHJpbmcsIHRhcmdldCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxufSIsImltcG9ydCB7Q2FibGV9IGZyb20gXCIuL0NhYmxlXCI7XHJcbmltcG9ydCB7QXJjdGFibGVPYnNlcnZhYmxlfSBmcm9tIFwiLi9hcmN0YWJsZS9BcmN0YWJsZU9ic2VydmFibGVcIjtcclxuaW1wb3J0IHtGdXR1cmV9IGZyb20gXCIuLi90b29scy9GdXR1cmVcIjtcclxuXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUm91dGVySW50ZXJuYWwge1xyXG4gICAgcHJvdGVjdGVkIHRhYmxlIDogQXJjdGFibGVPYnNlcnZhYmxlPENhYmxlPjtcclxuICAgIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZTx0aGlzPjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnJlYWR5ID0gbmV3IEZ1dHVyZTx0aGlzPigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBkaXNwYXRjaChtc2cgOiBzdHJpbmcsIHRhcmdldCA6IG51bWJlciwgdG9sZXJhbmNlIDogbnVtYmVyKSA6IFByb21pc2U8c3RyaW5nPntcclxuICAgICAgICBsZXQgY2xvc2VzdCA9IHRoaXMudGFibGUuZ2V0V2l0aGluKHRhcmdldCwgdG9sZXJhbmNlKTtcclxuICAgICAgICBpZighY2xvc2VzdCkgdGhyb3cgXCJlbXB0eSBuZXR3b3JrXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFibGUuZ2V0V2l0aGluKHRhcmdldCwgdG9sZXJhbmNlKS5zZW5kKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJyb2FkY2FzdChtc2cgOiBzdHJpbmcpIDogUHJvbWlzZTxzdHJpbmc+W117XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFibGUuZ2V0QWxsKCkubWFwKGMgPT4gYy5zZW5kKG1zZykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhdHRhY2goY2FibGUgOiBDYWJsZSl7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGNhYmxlLmNsb3NlZC50aGVuKGMgPT4gc2VsZi5kZXRhY2goYykpO1xyXG4gICAgICAgIGxldCBlamVjdGVkID0gdGhpcy50YWJsZS5hZGQoY2FibGUua2V5Lmhhc2hlZCgpLCBjYWJsZSk7XHJcbiAgICAgICAgZWplY3RlZCAmJiBlamVjdGVkLmNsb3NlKCk7XHJcbiAgICAgICAgKHRoaXMucmVhZHkgYXMgRnV0dXJlPHRoaXM+KS5yZXNvbHZlKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBkZXRhY2goY2FibGUgOiBDYWJsZSl7XHJcbiAgICAgICAgbGV0IGVqZWN0ZWQgPSB0aGlzLnRhYmxlLnJlbW92ZShjYWJsZS5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIGVqZWN0ZWQgJiYgZWplY3RlZC5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJpbXBvcnQge1JvdXRlckludGVybmFsfSBmcm9tIFwiLi9Sb3V0ZXJJbnRlcm5hbFwiO1xyXG5pbXBvcnQge0NhYmxlfSBmcm9tIFwiLi9DYWJsZVwiO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJvdXRlclBvcnRzIGV4dGVuZHMgUm91dGVySW50ZXJuYWx7XHJcbiAgICBwcml2YXRlIGNoYW5uZWxzIDogT25NZXNzYWdlW10gPSBbXTtcclxuXHJcblxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgc29ydGVyKG1zZyA6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPntcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbbXNnLmNvZGVQb2ludEF0KDApXShtc2cuc2xpY2UoMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaChjYWJsZSA6IENhYmxlKXtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgY2FibGUub25tZXNzYWdlID0gKG1zZyk9PntyZXR1cm4gc2VsZi5zb3J0ZXIobXNnKX07XHJcbiAgICAgICAgc3VwZXIuYXR0YWNoKGNhYmxlKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVQb3J0KG9ubWVzc2FnZSA6IE9uTWVzc2FnZSkgOiAobXNnIDogc3RyaW5nLCB0YXJnZXQgOiBudW1iZXIsIHRvbGVyYW5jZSA6IG51bWJlcikgPT4gUHJvbWlzZTxTdHJpbmc+e1xyXG4gICAgICAgIGxldCBwb3J0SUQgPSB0aGlzLmNoYW5uZWxzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmNoYW5uZWxzLnB1c2gob25tZXNzYWdlKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gKG1zZyA6IHN0cmluZywgdGFyZ2V0IDogbnVtYmVyLCB0b2xlcmFuY2UgOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGlzcGF0Y2goU3RyaW5nLmZyb21Db2RlUG9pbnQocG9ydElEKSArIG1zZywgdGFyZ2V0LCB0b2xlcmFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbW11bmljYXRlcyB3aXRoIGFsbCBhZGphY2VudCBub2Rlcy5cclxuICAgICAqIEBwYXJhbSB7T25NZXNzYWdlfSBvbm1lc3NhZ2VcclxuICAgICAqIEByZXR1cm5zIHtPbk1lc3NhZ2V9XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZUZyZXF1ZW5jeShvbm1lc3NhZ2UgOiBPbk1lc3NhZ2UpIDogKG1zZyA6IHN0cmluZykgPT4gUHJvbWlzZTxTdHJpbmc+W117XHJcbiAgICAgICAgbGV0IHBvcnRJRCA9IHRoaXMuY2hhbm5lbHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbHMucHVzaChvbm1lc3NhZ2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiAobXNnIDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmJyb2FkY2FzdChTdHJpbmcuZnJvbUNvZGVQb2ludChwb3J0SUQpICsgbXNnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5pbnRlcmZhY2UgT25NZXNzYWdlIHtcclxuICAgIChtc2cgOiBzdHJpbmcpIDogUHJvbWlzZTxzdHJpbmc+XHJcbn1cclxuXHJcblxyXG4iLCJpbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi9DaG9yZGlvaWRcIjtcclxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tIFwiLi4vLi4vdG9vbHMvT2JzZXJ2YWJsZVwiO1xyXG5pbXBvcnQge3JvdXRlcmN9IGZyb20gXCIuLi9jb25maWdcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBBcmN0YWJsZTxUPiBleHRlbmRzIENob3Jkb2lkPFQ+IHtcclxuICAgIHByaXZhdGUgcHVyZ2F0b3J5OiB7IGtleTogbnVtYmVyLCBvYmo6IFQsIGVmZjogbnVtYmVyLCBpZHg6IG51bWJlciB9W10gPSBbXTsgLy8gc3RvcmVzIHBlbmRpbmcgYWRkcmVzc2VzO1xyXG4gICAgcHJpdmF0ZSBkZWVwU3RvcmVkIDogbnVtYmVyID0gMDtcclxuICAgIHJlYWRvbmx5IG1heFNpemUgOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2VudGVyIDogbnVtYmVyKXtcclxuICAgICAgICBzdXBlcihjZW50ZXIpO1xyXG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IENob3Jkb2lkLmxvb2t1cFRhYmxlLmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGxvY2F0aW9uIDogbnVtYmVyLCBvYmplY3QgOiBUKSA6IFQgfCBudWxse1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGxldCBleHRyYWN0ZWQgPSB0aGlzLmFycmF5W2lkeF07XHJcblxyXG4gICAgICAgIGlmKGV4dHJhY3RlZCAmJiBleHRyYWN0ZWQua2V5ID09IGxvY2F0aW9uKVxyXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG5cclxuICAgICAgICBpZih0aGlzLmlzRGVzaXJhYmxlKGxvY2F0aW9uKSl7XHJcbiAgICAgICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgZXh0cmFjdGVkID0gdGhpcy5hcnJheVtpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmplY3R9O1xyXG5cclxuICAgICAgICAgICAgaWYoIWV4dHJhY3RlZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZXBTdG9yZWQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IGV4dHJhY3RlZC5rZXk7XHJcbiAgICAgICAgICAgIG9iamVjdCA9IGV4dHJhY3RlZC5vYmo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnB1cmdhdG9yeS5maW5kSW5kZXgoZSA9PiBlLmtleSA9PSBsb2NhdGlvbikrMSlcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuXHJcbiAgICAgICAgbGV0IGVmZmljaWVuY3kgPSB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCk7XHJcblxyXG4gICAgICAgIHRoaXMucHVyZ2F0b3J5LnB1c2goe29iajogb2JqZWN0LCBrZXk6IGxvY2F0aW9uLCBlZmY6IGVmZmljaWVuY3ksIGlkeDogaWR4fSk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMucHVyZ2F0b3J5Lmxlbmd0aCA8PSB0aGlzLm1heFNpemUgLSB0aGlzLmRlZXBTdG9yZWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLnB1cmdhdG9yeS5zb3J0KChhLCBiKT0+IGEuZWZmIC0gYi5lZmYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5wdXJnYXRvcnkucG9wKCkub2JqO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUobG9jYXRpb24gOiBudW1iZXIpIDogVHtcclxuICAgICAgICBsZXQgcmVtb3ZlZCA9IHN1cGVyLnJlbW92ZShsb2NhdGlvbik7XHJcbiAgICAgICAgaWYocmVtb3ZlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0b3JlZC0tO1xyXG5cclxuICAgICAgICAgICAgLy9maW5kIGEgcmVwbGFjZW1lbnRcclxuICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBjYW5kaWRhdGVzID0gdGhpcy5wdXJnYXRvcnkuZmlsdGVyKGUgPT4gZS5pZHggPT0gaWR4KTtcclxuICAgICAgICAgICAgaWYoY2FuZGlkYXRlcy5sZW5ndGggPT0gMCkgcmV0dXJuIHJlbW92ZWQ7XHJcblxyXG4gICAgICAgICAgICBjYW5kaWRhdGVzLnNvcnQoKGEsYik9PiBhLmVmZiAtIGIuZWZmKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwaW5kZXggPSB0aGlzLnB1cmdhdG9yeS5maW5kSW5kZXgoZSA9PiBlLmtleSA9PSBsb2NhdGlvbik7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2FuZGlkYXRlID0gdGhpcy5wdXJnYXRvcnkuc3BsaWNlKHBpbmRleCwgMSlbMF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlZXBTdG9yZWQrKztcclxuICAgICAgICAgICAgaWYoc3VwZXIuYWRkKGNhbmRpZGF0ZS5rZXksIGNhbmRpZGF0ZS5vYmopKSB0aHJvdyBcImZhdGFsIGxvZ2ljIGVycm9yIGluIGFyY3RhYmxlXCI7XHJcblxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxldCBwaW5kZXggPSB0aGlzLnB1cmdhdG9yeS5maW5kSW5kZXgoZSA9PiBlLmtleSA9PSBsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGlmKHBpbmRleCA9PSAtMSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnB1cmdhdG9yeS5zcGxpY2UocGluZGV4LCAxKVswXS5vYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbCgpe1xyXG4gICAgICAgIHJldHVybiBbLi4udGhpcy5hcnJheS5maWx0ZXIoZSA9PiBlKSwgLi4udGhpcy5wdXJnYXRvcnldLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbiAgICBhcHByb2FjaChsb2NhdGlvbiA6IG51bWJlcikgOiBUe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFdpdGhpbihsb2NhdGlvbiwgdGhpcy5kaXN0YW5jZShsb2NhdGlvbikpXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3VnZ2VzdGlvbnMoKXtcclxuICAgICAgICBpZih0aGlzLmRlZXBTdG9yZWQgPCA2KXtcclxuICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogKHRoaXMubG9jdXMrMC41KSUxLFxyXG4gICAgICAgICAgICAgICAgZXhwb25lbnQ6IDAsXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAwLjQ5OTlcclxuICAgICAgICAgICAgfSwuLi5zdXBlci5nZXRTdWdnZXN0aW9ucygpXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldFN1Z2dlc3Rpb25zKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtBcmN0YWJsZX0gZnJvbSBcIi4vQXJjdGFibGVcIjtcclxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tIFwiLi4vLi4vdG9vbHMvT2JzZXJ2YWJsZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFyY3RhYmxlT2JzZXJ2YWJsZTxUPiBleHRlbmRzIEFyY3RhYmxlPFQ+e1xyXG4gICAgcmVhZG9ubHkgaGVhbHRoIDogT2JzZXJ2YWJsZTxudW1iZXI+ID0gbmV3IE9ic2VydmFibGU8bnVtYmVyPigwKTtcclxuXHJcbiAgICBhZGQobG9jYXRpb24sIG9iamVjdCl7XHJcbiAgICAgICAgbGV0IGV4dCA9IHN1cGVyLmFkZChsb2NhdGlvbiwgb2JqZWN0KTtcclxuXHJcbiAgICAgICAgdGhpcy5oZWFsdGguc2V0KHRoaXMuaGVhbHRoLmdldCgpICsxICk7XHJcblxyXG4gICAgICAgIHJldHVybiBleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uKXtcclxuICAgICAgICBsZXQgZXh0ID0gc3VwZXIucmVtb3ZlKGxvY2F0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5oZWFsdGguc2V0KHRoaXMuaGVhbHRoLmdldCgpIC0xICk7XHJcblxyXG4gICAgICAgIHJldHVybiBleHQ7XHJcbiAgICB9XHJcblxyXG5cclxufSIsImV4cG9ydCBjbGFzcyBDaG9yZG9pZDxUPntcclxuICAgIHJlYWRvbmx5IGxvY3VzIDogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIGFycmF5IDoge2tleSA6IG51bWJlciwgb2JqIDogVH1bXTtcclxuXHJcbiAgICAvL0ZJWE1FOiBhbXAgdXAgcHJlY2lzaW9uIHRvIDY0IGJpdDtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb29rdXBUYWJsZSA9IFstMC41LCAtMC4yNSwgLTAuMDU1NTU1NTU1NTU1NTU1NTgsIC0wLjAwNzgxMjUsIC0wLjAwMDgwMDAwMDAwMDAwMDAyMjksIC0wLjAwMDA2NDMwMDQxMTUyMjYxMDksXHJcbiAgICAgICAgLTAuMDAwMDA0MjQ5OTI5ODc2MTMyMjYzNSwgLTIuMzg0MTg1NzkxMDE1NjI1ZS03LCAtMS4xNjE1Mjg2NTY1OTAyNDk0ZS04LCAtNC45OTk5OTk4NTg1OTAzNDNlLTEwLFxyXG4gICAgICAgIC0xLjkyNzcxOTA5NTQ2MjUyMTJlLTExLCAtNi43Mjk2MTY4NjM3NjUzODZlLTEzLCAtMi4xNDgyODE1NTI2NDk2NzhlLTE0LCAtNi4xMDYyMjY2MzU0MzgzNjFlLTE2LCAwLFxyXG4gICAgICAgIDYuMTA2MjI2NjM1NDM4MzYxZS0xNiwgMi4xNDgyODE1NTI2NDk2NzhlLTE0LCA2LjcyOTYxNjg2Mzc2NTM4NmUtMTMsIDEuOTI3NzE5MDk1NDYyNTIxMmUtMTEsXHJcbiAgICAgICAgNC45OTk5OTk4NTg1OTAzNDNlLTEwLCAxLjE2MTUyODY1NjU5MDI0OTRlLTgsIDIuMzg0MTg1NzkxMDE1NjI1ZS03LCAwLjAwMDAwNDI0OTkyOTg3NjEzMjI2MzUsXHJcbiAgICAgICAgMC4wMDAwNjQzMDA0MTE1MjI2MTA5LCAwLjAwMDgwMDAwMDAwMDAwMDAyMjksIDAuMDA3ODEyNSwgMC4wNTU1NTU1NTU1NTU1NTU1OCwgMC4yNSwgMC41XTtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb2N1c0lEWCA9IDE0OyAvLyBwb3NpdGlvbiBvZiB0aGUgbG9jdXNcclxuICAgIHN0YXRpYyBhY2NlcHRhYmxlRXJyb3IgPSAxZS0xNjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZW50ZXIgOiBudW1iZXIsIGNpcmN1bWZlcmVuY2UgOiBudW1iZXIgPSAxKXtcclxuICAgICAgICB0aGlzLmxvY3VzID0gY2VudGVyO1xyXG4gICAgICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTEpLmZpbGwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEZXNpcmFibGUobG9jYXRpb246IG51bWJlcil7IC8vdG9kbzogcmVmYWN0b3IgdGhpcyBpbnRvIFwiYWRkXCJcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGQobG9jYXRpb246IG51bWJlciwgb2JqIDogVCkgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICAvL2VmZmljaWVuY3kgaXMgd29yc2UgdGhhbiBpbmNvbWluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XS5vYmo7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vcmVqZWN0IHRoZSBvYmplY3Q7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqfTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0cmlldmUgY2xvc2VzdCBhdmFpbGFibGUgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb25cclxuICAgICAqIEByZXR1cm5zIHtUIHwgbnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0KGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSB8fCBudWxsKSAmJiBpdGVtLm9iajtcclxuICAgIH1cclxuICAgIGdldFdpdGhpbihsb2NhdGlvbjogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlcikgOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSAmJiBDaG9yZG9pZC5kaXN0YW5jZShpdGVtLmtleSAsIGxvY2F0aW9uKSA8IHRvbGVyYW5jZSlcclxuICAgICAgICAgICAgPyBpdGVtLm9ialxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZC5hY2NlcHRhYmxlRXJyb3Ipe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcnJheVtpZHhdID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gb2xkLm9iajtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGRlcmVmZXJlbmNlIChpZHg6IEV4cG9uZW50LCBsb2N1czogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeC52YWx1ZU9mKCldICsgbG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGxvY2F0aW9uPj0wICYmIGxvY2F0aW9uIDw9IDEsIFwibG9jYXRpb246IFwiK2xvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gKCgxICsgbG9jYXRpb24gLSB0aGlzLmxvY3VzICsgMC41KSAlIDEpIC0gMC41O1xyXG4gICAgICAgIC8vZXhwZWN0IGluIHJhbmdlIC0wLjUsIDAuNVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAobG9jYXRpb24gKyB0aGlzLmxvY3VzICsgMSApICUgMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlzdGFuY2UoYSA6IG51bWJlciwgYiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhhIC0gYiksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiICsgMSksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGIgLSBhICsgMSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZGlzdGFuY2UoYTogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UodGhpcy5sb2N1cywgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSwgZGVyZWxhdGl2aXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgbHRvaShsb2NhdGlvbiA6IG51bWJlciwgc2tpcEVtcHR5IDogYm9vbGVhbiA9IGZhbHNlKSA6IG51bWJlcnsgLy9sb2NhdGlvbiB0byBpbmRleFxyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IDE7XHJcbiAgICAgICAgbGV0IHZlcmlkZXggPSBudWxsO1xyXG4gICAgICAgIGlmKGRlcmVsYXRpdml6ZWQgPCAwKXtcclxuICAgICAgICAgICAgLy9zdGFydCB3aXRoIDBcclxuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIG1heFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlciwgZWZmaWNpZW5jeTogbnVtYmVyLCBleHBvbmVudDogRXhwb25lbnR9W119IHNvcnRlZCwgYmlnZ2VzdCB0byBzbWFsbGVzdCBnYXAuXHJcbiAgICAgKi9cclxuICAgIGdldFN1Z2dlc3Rpb25zKCkgOiB7bG9jYXRpb24gOiBudW1iZXIsIGVmZmljaWVuY3kgOiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5Lm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBleHBvbmVudDogbmV3IEV4cG9uZW50KGlkeCksXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAoaXRlbSk/IHRoaXMuZWZmaWNpZW5jeShpdGVtLmtleSwgaWR4KSA6IE1hdGguYWJzKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeF0vMiksXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5yZXJlbGF0aXZpemUoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsbCgpIDogVFtde1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFeHBvbmVudCBleHRlbmRzIE51bWJlcntcclxuICAgIGNvbnN0cnVjdG9yKGV4cG9uZW50IDogbnVtYmVyKXtcclxuICAgICAgICBpZihcclxuICAgICAgICAgICAgTWF0aC5hYnMoZXhwb25lbnQpICE9IGV4cG9uZW50IHx8XHJcbiAgICAgICAgICAgIGV4cG9uZW50IDwgMCAgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPj0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoXHJcbiAgICAgICAgKSB0aHJvdyBcImludmFsaWQgZXhwb25lbnRcIjtcclxuICAgICAgICBzdXBlcihleHBvbmVudCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3Qgcm91dGVyYyA9IHtcclxuICAgIHZlcmJvc2UgOiB0cnVlLFxyXG4gICAgdGFibGVEZXB0aEJlZm9yZVN1Z2dlc3Rpb25zIDogM1xyXG59OyIsImV4cG9ydCBjbGFzcyBUZXN0e1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHRlc3RzIDogKCgpPT5Qcm9taXNlPGJvb2xlYW4+KVtdID0gW107XHJcbiAgICBwcml2YXRlIGl0ZW0gOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGl0ZW1cclxuICAgIHByaXZhdGUgcGFzc2VkIDogbnVtYmVyID0gMDtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUgOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBwYXNzKCkgOiBib29sZWFue1xyXG4gICAgICAgIHRoaXMucGFzc2VkKys7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGZhaWwoc3RyOiBzdHJpbmcsIG9iamVjdHM6IGFueVtdKSA6IGJvb2xlYW57XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJGQUlMRUQgKFwiKygrK3RoaXMuaXRlbSkrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpXCIsXHJcbiAgICAgICAgICAgIHN0ciwgb2JqZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydChuYW1lIDogc3RyaW5nLCBhIDogYW55LCBiIDogYW55LCBjb21wYXJhdG9yIDogKGEsIGIpPT5ib29sZWFuID0gKGEsYik9PmE9PT1iKXtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2goYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgaWYoY29tcGFyYXRvcihhd2FpdCBhLCBhd2FpdCBiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKFwiYXNzZXJ0OiBcIiArIG5hbWUsIFthd2FpdCBhLCBhd2FpdCBiXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIHRoaXMuaXRlbSA9IDA7XHJcbiAgICAgICAgdGhpcy5wYXNzZWQgPSAwO1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRoaXMudGVzdHMubWFwKGUgPT4gZSgpKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coKCh0aGlzLnBhc3NlZCA9PSB0aGlzLnRlc3RzLmxlbmd0aCk/IFwiUGFzc2VkIChcIiA6IFwiRkFJTEVEISAoXCIpK3RoaXMucGFzc2VkK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKS4gaW4gXCIrdGhpcy5uYW1lK1wiLlwiKTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBFc3NlbnRpYWxseSBkZWZlcnJlZCwgYnV0IGl0J3MgYWxzbyBhIHByb21pc2UuXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTW96aWxsYS9KYXZhU2NyaXB0X2NvZGVfbW9kdWxlcy9Qcm9taXNlLmpzbS9EZWZlcnJlZCNiYWNrd2FyZHNfZm9yd2FyZHNfY29tcGF0aWJsZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZ1dHVyZTxUPiBleHRlbmRzIFByb21pc2U8VD57XHJcbiAgICByZWFkb25seSByZXNvbHZlIDogKHZhbHVlIDogUHJvbWlzZUxpa2U8VD4gfCBUKSA9PiB2b2lkO1xyXG4gICAgcmVhZG9ubHkgcmVqZWN0IDogKHJlYXNvbiA/OiBhbnkpID0+IHZvaWQ7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGUgOiAwIHwgMSB8IDI7IC8vcGVuZGluZywgcmVzb2x2ZWQsIHJlamVjdGVkO1xyXG4gICAgcHJpdmF0ZSBzdGF0ZUV4dHJhY3RvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRvciA/OiAoXHJcbiAgICAgICAgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgbGV0IHJlc29sdmVyLCByZWplY3RvcjtcclxuICAgICAgICBsZXQgc3RhdGUgOiAwIHwgMSB8IDIgPSAwO1xyXG4gICAgICAgIHN1cGVyKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZXIgPSAocmVzb2x1dGlvbiA6IFQpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzb2x1dGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJlamVjdG9yID0gKHJlamVjdGlvbiA6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAyO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHJlamVjdGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZUV4dHJhY3RvciA9ICgpID0+IHsgLy8gdGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzZWxmIGNhbm5vdCBiZSBzZXQgaW4gc3VwZXI7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlcjtcclxuICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdG9yO1xyXG5cclxuICAgICAgICBleGVjdXRvciAmJiBuZXcgUHJvbWlzZTxUPihleGVjdXRvcikudGhlbihyZXNvbHZlcikuY2F0Y2gocmVqZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCkgOiBcInBlbmRpbmdcIiB8IFwicmVzb2x2ZWRcIiB8IFwicmVqZWN0ZWRcIiB8IFwiZXJyb3JcIiB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMCk/IFwicGVuZGluZ1wiXHJcbiAgICAgICAgICAgIDogKHRoaXMuc3RhdGVFeHRyYWN0b3IoKSA9PSAxKSA/IFwicmVzb2x2ZWRcIlxyXG4gICAgICAgICAgICA6ICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMikgPyBcInJlamVjdGVkXCJcclxuICAgICAgICAgICAgOiBcImVycm9yXCI7XHJcbiAgICB9XHJcblxyXG59IiwiZXhwb3J0IGNsYXNzIE9ic2VydmFibGU8VD4ge1xyXG4gICAgcHJpdmF0ZSB2YWx1ZTogVDtcclxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiAoKHZhbHVlOiBUKSA9PiB2b2lkKVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGluaXRpYWw6IFQpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gaW5pdGlhbDtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIG9ic2VydmUoY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCh2YWx1ZTogVCkge1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goZSA9PiBlKHZhbHVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0KCkgOiBUIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvL3JlbW92ZSBhbGwgc3Vic2NyaWJlcnMgXCJubyBtb3JlIHJlbGV2YW50IGNoYW5nZXMgaGFwcGVuaW5nXCJcclxuICAgIGZsdXNoKCkgOiB2b2lkIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5saXN0ZW5lcnM7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogdXNlIHdpdGggYXdhaXRcclxuICogQHBhcmFtIHtudW1iZXJ9IG1pbGxpc1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzbGVlcChtaWxsaXMgOiBudW1iZXIpIDogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ociA9PiBzZXRUaW1lb3V0KHIoKSwgbWlsbGlzKSk7XHJcbn0iLCIvL3RvZG86IGluY2x1ZGUgcG9seWZpbGxzIGZvciBFZGdlXHJcbmV4cG9ydCBjb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG5leHBvcnQgY29uc3QgdXRmOERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuXHJcbiIsImltcG9ydCB7dHJhbnNtaXNzaW9uY29udHJvbGN9IGZyb20gXCIuL2NvbmZpZ1wiO1xyXG5pbXBvcnQge0Z1dHVyZX0gZnJvbSBcIi4uL3Rvb2xzL0Z1dHVyZVwiO1xyXG5pbXBvcnQge0RhdGFMaW5rfSBmcm9tIFwiLi4vZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuXHJcbmVudW0gVHJhbnNtaXNzaW9uQ29udHJvbEVycm9ye1xyXG4gICAgQ29ubmVjdGlvbkNsb3NlZCA9IDEwMCxcclxuICAgIFJlbW90ZUVycm9yID0gMjAwLFxyXG4gICAgUHJvdG9jb2xFcnJvciA9IDMwMFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJhbnNtaXNzaW9uQ29udHJvbCBleHRlbmRzIERhdGFMaW5re1xyXG4gICAgcmVsYXlUYWJsZTogRnV0dXJlPHN0cmluZz5bXSA9IG5ldyBBcnJheSh0cmFuc21pc3Npb25jb250cm9sYy5tYXhNZXNzYWdlQnVmZmVyKzEpLmZpbGwobnVsbCk7XHJcbiAgICBvbm1lc3NhZ2UgOiAobXNnIDogc3RyaW5nKT0+IFByb21pc2U8c3RyaW5nPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihvbm1lc3NhZ2UgOiAobXNnIDogc3RyaW5nKT0+UHJvbWlzZTxzdHJpbmc+KXtcclxuICAgICAgICBzdXBlcihudWxsKTtcclxuICAgICAgICB0aGlzLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLmRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IGFzeW5jIChtc2dFKT0+e1xyXG4gICAgICAgICAgICAvLyBzdGVwIDE6IHdoYXQgaXMgaXQ/XHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gbXNnRS5kYXRhLmNvZGVQb2ludEF0KDApO1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlID0gbXNnRS5kYXRhLmNvZGVQb2ludEF0KDEpO1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IG1zZ0UuZGF0YS5zbGljZSgyKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogc2VsZi5vbm1lc3NhZ2UoZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiBzZWxmLmRhdGFjaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoMSwgcmVmZXJlbmNlKSArIHJlc3BvbnNlKSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gc2VsZi5kYXRhY2hhbm5lbC5zZW5kKFN0cmluZy5mcm9tQ29kZVBvaW50KDIsIHJlZmVyZW5jZSkgKyBlcnJvcikpOyByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF5VGFibGVbcmVmZXJlbmNlXS5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF5VGFibGVbcmVmZXJlbmNlXSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfWNhdGNoIChlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImJhZCBhY3RvclwiLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1icmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXlUYWJsZVtyZWZlcmVuY2VdLnJlamVjdChkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWxheVRhYmxlW3JlZmVyZW5jZV0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1jYXRjaCAoZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJiYWQgYWN0b3IgMlwiLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1icmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImJhZCBhY3RvciAyLCB0eXBlOiBcIiwgdHlwZSwgXCJyZWZlcmVuY2U6IFwiLCByZWZlcmVuY2UsIFwiZGF0YTogXCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNlbmQobXNnIDogc3RyaW5nKSA6IFByb21pc2U8c3RyaW5nPntcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5yZWxheVRhYmxlLmZpbmRJbmRleChlID0+ICFlKTtcclxuICAgICAgICBpZihpZHggPT0gLTEpIHRocm93IFwiY2FsbGJhY2sgYnVmZmVyIGZ1bGwhXCI7XHJcbiAgICAgICAgdGhpcy5yZWxheVRhYmxlW2lkeF0gPSBuZXcgRnV0dXJlPHN0cmluZz4oKTtcclxuICAgICAgICBzdXBlci5zZW5kKFN0cmluZy5mcm9tQ29kZVBvaW50KDAsIGlkeCkgKyBtc2cpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlbGF5VGFibGVbaWR4XTtcclxuICAgIH1cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgdGhpcy5yZWxheVRhYmxlLmZvckVhY2goZSA9PiBlICYmIGUucmVqZWN0KFtUcmFuc21pc3Npb25Db250cm9sRXJyb3IuQ29ubmVjdGlvbkNsb3NlZF0pKTtcclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgY29uc3QgdHJhbnNtaXNzaW9uY29udHJvbGMgPSB7XHJcbiAgICBtYXhNZXNzYWdlQnVmZmVyOiAxMDAsXHJcbiAgICB2ZXJzaW9uOiBcIlRDREwtMS4wLjBcIlxyXG59IiwiaW1wb3J0IHtUZXN0fSBmcm9tIFwiLi9tb2R1bGVzL3Rlc3QvVGVzdFwiO1xyXG5pbXBvcnQge1ByaXZhdGVLZXksIFZlckRvY30gZnJvbSBcIi4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5pbXBvcnQge0RhdGFMaW5rfSBmcm9tIFwiLi9tb2R1bGVzL2RhdGFsaW5rL0RhdGFMaW5rXCI7XHJcbmltcG9ydCB7VHJhbnNtaXNzaW9uQ29udHJvbH0gZnJvbSBcIi4vbW9kdWxlcy90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2xcIjtcclxuaW1wb3J0IHtSb3V0ZXJQb3J0c30gZnJvbSBcIi4vbW9kdWxlcy9yb3V0ZXIvUm91dGVyUG9ydHNcIjtcclxuaW1wb3J0IHtDYWJsZX0gZnJvbSBcIi4vbW9kdWxlcy9yb3V0ZXIvQ2FibGVcIjtcclxuaW1wb3J0IHtSb3V0ZXJDYWJsZUZhY3Rvcnl9IGZyb20gXCIuL21vZHVsZXMvcm91dGVyL1JvdXRlckNhYmxlRmFjdG9yeVwiO1xyXG5pbXBvcnQge1JvdXRlckRhbW5lZH0gZnJvbSBcIi4vbW9kdWxlcy9yb3V0ZXIvUm91dGVyRGFtbmVkXCI7XHJcbmltcG9ydCB7c2xlZXB9IGZyb20gXCIuL21vZHVsZXMvdG9vbHMvc2xlZXBcIjtcclxuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gXCIuL21vZHVsZXMvcm91dGVyL1JvdXRlclwiO1xyXG5cclxuXHJcblByb21pc2UuYWxsKFtcclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiQ3J5cHRvXCIpO1xyXG5cclxuICAgICAgICBsZXQgdG8gPSB7YTogMC4xMTEsIGI6IDIzNDUxMn07XHJcblxyXG4gICAgICAgIGxldCBwcmsgPSBuZXcgUHJpdmF0ZUtleSgpO1xyXG4gICAgICAgIGxldCB2ZXJkb2MgPSBhd2FpdCBwcmsuc2lnbih0byk7XHJcbiAgICAgICAgbGV0IHJlY29uc3RydWN0ZWQgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3QodmVyZG9jKTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwidmVyZG9jIGtleSBjb21wYXJpc29uXCIsIHZlcmRvYy5rZXkuaGFzaGVkKCksIHJlY29uc3RydWN0ZWQua2V5Lmhhc2hlZCgpKTtcclxuICAgICAgICBjci5hc3NlcnQoXCJ2ZXJkb2MgZGF0YSBjb21wYXJpc29uXCIsIEpTT04uc3RyaW5naWZ5KHZlcmRvYy5kYXRhKSwgSlNPTi5zdHJpbmdpZnkocmVjb25zdHJ1Y3RlZC5kYXRhKSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIGNyeXB0byB0ZXN0XHJcblxyXG4gICAgKGFzeW5jICgpPT57bGV0IGNyID0gbmV3IFRlc3QoXCJEYXRhTGlua1wiKTtcclxuXHJcbiAgICAgICAgbGV0IHRyYW5zbWl0dGVkID0gYXdhaXQgbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBhID0gbmV3IERhdGFMaW5rKG0gPT4gcmVzb2x2ZShtLmRhdGEpKTtcclxuICAgICAgICAgICAgbGV0IGIgPSBuZXcgRGF0YUxpbmsobSA9PiBiLnNlbmQoXCJiIHJlc3BvbmRzIHRvIFwiK20uZGF0YSkpO1xyXG5cclxuICAgICAgICAgICAgYS5jb21wbGV0ZShhd2FpdCBiLmFuc3dlcihhd2FpdCBhLm9mZmVyKCkpKTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IGIucmVhZHk7XHJcblxyXG4gICAgICAgICAgICBhLnNlbmQoXCJhIHNheXMgYmVlcFwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjci5hc3NlcnQoXCJzaW1wbGUgZGF0YSBib3VuY2VcIiwgdHJhbnNtaXR0ZWQsIFwiYiByZXNwb25kcyB0byBhIHNheXMgYmVlcFwiKTtcclxuXHJcbiAgICAgICAgLy8vLyB0ZXN0IG1lbW9yeSB1c2FnZSAtIGl0J3Mgc3RhdGljLlxyXG4gICAgICAgIC8vIGZvcihsZXQgaSA9IDA7IGk8MTAwMDsgaSsrKXtcclxuICAgICAgICAvLyAgICAgbGV0IGEgPSBuZXcgRGF0YUxpbmsobSA9PiBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgLy8gICAgIGxldCBiID0gbmV3IERhdGFMaW5rKG0gPT4gY29uc29sZS5sb2cpO1xyXG4gICAgICAgIC8vICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG4gICAgICAgIC8vICAgICBhd2FpdCBhLnJlYWR5O1xyXG4gICAgICAgIC8vICAgICBhLmNsb3NlKCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBEYXRhIExpbmtcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIlRyYW5zbWlzc2lvbiBDb250cm9sXCIpO1xyXG5cclxuICAgICAgICBsZXQgYSA9IG5ldyBUcmFuc21pc3Npb25Db250cm9sKGFzeW5jIG0gPT4gXCJhIHJlZmxlY3RzOiBcIittKTtcclxuICAgICAgICBsZXQgYiA9IG5ldyBUcmFuc21pc3Npb25Db250cm9sKGFzeW5jIG0gPT4gXCJiIHJldHVybnM6IFwiICsgYXdhaXQgYi5zZW5kKFwiYiByZWZsZWN0czogXCIrbSkpO1xyXG5cclxuICAgICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICBhd2FpdCBhLnJlYWR5O1xyXG5cclxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhLnNlbmQoXCJhYWFcIik7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcImR1YWwgdGNwIGJvdW5jZVwiLCByZXNwb25zZSwgXCJiIHJldHVybnM6IGEgcmVmbGVjdHM6IGIgcmVmbGVjdHM6IGFhYVwiKTtcclxuICAgICAgICBsZXQgZiA9IG51bGw7XHJcblxyXG4gICAgICAgIGxldCBjID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2wobSA9PiBQcm9taXNlLnJlamVjdChcImZhaWx1cmVcIikpO1xyXG4gICAgICAgIGxldCBkID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBmKCkpO1xyXG5cclxuICAgICAgICBjLmNvbXBsZXRlKGF3YWl0IGQuYW5zd2VyKGF3YWl0IGMub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICBhd2FpdCBkLnJlYWR5O1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJyZW1vdGUgaGFuZGxpbmcgcHJvcGFnYXRpb25cIixcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgZC5zZW5kKFwiYm9vcFwiKS5jYXRjaChlID0+IGUpKSwgJ1wiZmFpbHVyZVwiJyk7XHJcbiAgICAgICAgY3IuYXNzZXJ0KFwicmVtb3RlIGhhbmRsaW5nIHByb3BhZ2F0aW9uXCIsXHJcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGF3YWl0IGMuc2VuZChcImJvb3BcIikuY2F0Y2goZSA9PiBlKSksICdcIlR5cGVFcnJvcjogZiBpcyBub3QgYSBmdW5jdGlvblwiJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIFRyYW5zbWlzc2lvbiBDb250cm9sXHJcblxyXG4gICAgKGFzeW5jICgpPT57bGV0IGNyID0gbmV3IFRlc3QoXCJSb3V0ZXIgUG9ydHNcIik7XHJcblxyXG4gICAgICAgIGxldCBhayA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgbGV0IGJrID0gbmV3IFByaXZhdGVLZXkoKTtcclxuICAgICAgICBsZXQgY2sgPSBuZXcgUHJpdmF0ZUtleSgpO1xyXG5cclxuICAgICAgICBsZXQgYSA9IG5ldyBSb3V0ZXJDYWJsZUZhY3RvcnkoYWspO1xyXG4gICAgICAgIGxldCBhczEgPSAoYSBhcyBhbnkpLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZykgPT5cImExIHJlZmxlY3RzOiBcIittc2cpO1xyXG4gICAgICAgIGxldCBhczIgPSAoYSBhcyBhbnkpLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZykgPT5cImEyIHJlZmxlY3RzOiBcIittc2cpO1xyXG4gICAgICAgIGxldCBhc2IgPSAoYSBhcyBhbnkpLmNyZWF0ZUZyZXF1ZW5jeShhc3luYyAobXNnKSA9PlwiYWIgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGIgPSBuZXcgUm91dGVyQ2FibGVGYWN0b3J5KGJrKTtcclxuICAgICAgICBsZXQgYnMxID0gKGIgYXMgYW55KS5jcmVhdGVQb3J0KGFzeW5jIChtc2cpID0+XCJiMSByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICBsZXQgYnMyID0gKGIgYXMgYW55KS5jcmVhdGVQb3J0KGFzeW5jIChtc2cpID0+XCJiMiByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICBsZXQgYnNiID0gKGIgYXMgYW55KS5jcmVhdGVGcmVxdWVuY3koYXN5bmMgKG1zZykgPT5cImJiIHJlZmxlY3RzOiBcIittc2cpO1xyXG4gICAgICAgIGxldCBjID0gbmV3IFJvdXRlckNhYmxlRmFjdG9yeShjayk7XHJcbiAgICAgICAgbGV0IGNzMSA9IChjIGFzIGFueSkuY3JlYXRlUG9ydChhc3luYyAobXNnKSA9PlwiYzEgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGNzMiA9IChjIGFzIGFueSkuY3JlYXRlUG9ydChhc3luYyAobXNnKSA9PlwiYzIgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgbGV0IGNzYiA9IChjIGFzIGFueSkuY3JlYXRlRnJlcXVlbmN5KGFzeW5jIChtc2cpID0+XCJjYiByZWZsZWN0czogXCIrbXNnKTtcclxuXHJcbiAgICAgICAgYS5nZW5lcmF0ZVNvY2tldChiLnByb3ZpZGVDb25uZWN0b3IoKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcImNoYW5uZWwgdGVzdCAxXCIsIGF3YWl0IGFzMShcImFzMVwiLCAwLjUsIDEpLCBcImIxIHJlZmxlY3RzOiBhczFcIik7XHJcblxyXG4gICAgICAgIGF3YWl0IGMuZ2VuZXJhdGVTb2NrZXQoYS5wcm92aWRlQ29ubmVjdG9yKCkpO1xyXG5cclxuICAgICAgICBhd2FpdCBiLnJlYWR5O1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJjaGFubmVsIHRlc3QgMlwiLCBhd2FpdCBiczEoXCJiczFcIiwgMC41LCAxKSwgXCJhMSByZWZsZWN0czogYnMxXCIpO1xyXG4gICAgICAgIGNyLmFzc2VydChcImNoYW5uZWwgdGVzdCAzXCIsIGF3YWl0IGJzMihcImJzMlwiLCAwLjUsIDEpLCBcImEyIHJlZmxlY3RzOiBiczJcIik7XHJcblxyXG4gICAgICAgIGF3YWl0IGMucmVhZHk7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcImNoYW5uZWwgdGVzdCAzXCIsIEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgICAgICAoYXdhaXQgUHJvbWlzZS5hbGwoYXNiKFwiYXNiXCIsIDAuNSwgMSkpKVxyXG4gICAgICAgICAgICAgICAgLnNvcnQoKGEsYikgPT4gKGEgYXMgc3RyaW5nKS5sb2NhbGVDb21wYXJlKGIgYXMgc3RyaW5nKSkpLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShbICdiYiByZWZsZWN0czogYXNiJywgJ2NiIHJlZmxlY3RzOiBhc2InIF0pXHJcbiAgICAgICAgICAgICk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBSb3V0ZXIgUG9ydHNcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIlJvdXRlciBEYWVtb25cIik7XHJcblxyXG4gICAgICAgIGNsYXNzIFJvdXRlclRlc3QgZXh0ZW5kcyBSb3V0ZXJEYW1uZWR7XHJcbiAgICAgICAgICAgIGIxOiAobXNnOiBzdHJpbmcpID0+IFByb21pc2U8U3RyaW5nPltdO1xyXG4gICAgICAgICAgICBjMTogKG1zZzogc3RyaW5nLCB0YXJnZXQ6IG51bWJlciwgdG9sZXJhbmNlOiBudW1iZXIpID0+IFByb21pc2U8U3RyaW5nPjtcclxuICAgICAgICAgICAgYzI6IChtc2c6IHN0cmluZywgdGFyZ2V0OiBudW1iZXIsIHRvbGVyYW5jZTogbnVtYmVyKSA9PiBQcm9taXNlPFN0cmluZz47XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKG5hbWUgOiBzdHJpbmcpe1xyXG4gICAgICAgICAgICAgICAgc3VwZXIobmV3IFByaXZhdGVLZXkoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jMSA9IHRoaXMuY3JlYXRlUG9ydChhc3luYyAobXNnKSA9Pm5hbWUrXCJjMSByZWZsZWN0czogXCIrbXNnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYzIgPSB0aGlzLmNyZWF0ZVBvcnQoYXN5bmMgKG1zZykgPT5uYW1lK1wiYzIgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmIxID0gdGhpcy5jcmVhdGVGcmVxdWVuY3koYXN5bmMgKG1zZykgPT5uYW1lK1wiYjEgcmVmbGVjdHM6IFwiK21zZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFJvdXRlclRlc3QoXCJhXCIpO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFJvdXRlclRlc3QoXCJiXCIpO1xyXG4gICAgICAgIGxldCBjID0gbmV3IFJvdXRlclRlc3QoXCJjXCIpO1xyXG4gICAgICAgIGxldCBkID0gbmV3IFJvdXRlclRlc3QoXCJkXCIpO1xyXG4gICAgICAgIGxldCBlID0gbmV3IFJvdXRlclRlc3QoXCJlXCIpO1xyXG5cclxuICAgICAgICBhLmdlbmVyYXRlU29ja2V0KGIucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBiLmdlbmVyYXRlU29ja2V0KGMucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBjLmdlbmVyYXRlU29ja2V0KGQucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBkLmdlbmVyYXRlU29ja2V0KGUucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuXHJcbiAgICAgICAgYXdhaXQgYS5yZWFkeTtcclxuICAgICAgICBhd2FpdCBiLnJlYWR5O1xyXG4gICAgICAgIGF3YWl0IGMucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgZC5yZWFkeTtcclxuICAgICAgICBhd2FpdCBlLnJlYWR5O1xyXG5cclxuICAgICAgICBhd2FpdCBzbGVlcCg1MDAwKTtcclxuXHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcImRhZW1vbiB0ZXN0IDFcIiwgSlNPTi5zdHJpbmdpZnkoXHJcbiAgICAgICAgICAgIChhd2FpdCBQcm9taXNlLmFsbChhLmIxKFwiYXNiXCIpKSlcclxuICAgICAgICAgICAgICAgIC5zb3J0KChhLGIpID0+IChhIGFzIHN0cmluZykubG9jYWxlQ29tcGFyZShiIGFzIHN0cmluZykpKSxcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoWyAnYmIgcmVmbGVjdHM6IGFzYicsICdjYiByZWZsZWN0czogYXNiJyBdKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vICh3aW5kb3cgYXMgYW55KS5hID0gYTtcclxuICAgICAgICAvLyAod2luZG93IGFzIGFueSApLmIgPSBiO1xyXG4gICAgICAgIC8vICh3aW5kb3cgYXMgYW55ICkuYyA9IGM7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBSb3V0ZXIgRGFlbW9uXHJcblxyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiUm91dGVyXCIpO1xyXG5cclxuICAgICAgICBjbGFzcyBSb3V0ZXJUZXN0IGV4dGVuZHMgUm91dGVye1xyXG4gICAgICAgICAgICBiMTogKG1zZzogc3RyaW5nKSA9PiB2b2lkO1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihuYW1lIDogc3RyaW5nKXtcclxuICAgICAgICAgICAgICAgIHN1cGVyKG5ldyBQcml2YXRlS2V5KCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iMSA9IHRoaXMuY3JlYXRlQnJvYWRjYXN0Q2hhbm5lbChtc2cgPT4gY29uc29sZS5sb2cobXNnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFJvdXRlclRlc3QoXCJhXCIpO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFJvdXRlclRlc3QoXCJiXCIpO1xyXG4gICAgICAgIGxldCBjID0gbmV3IFJvdXRlclRlc3QoXCJjXCIpO1xyXG4gICAgICAgIGxldCBkID0gbmV3IFJvdXRlclRlc3QoXCJkXCIpO1xyXG4gICAgICAgIGxldCBlID0gbmV3IFJvdXRlclRlc3QoXCJlXCIpO1xyXG5cclxuICAgICAgICBhLmdlbmVyYXRlU29ja2V0KGIucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBiLmdlbmVyYXRlU29ja2V0KGMucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBjLmdlbmVyYXRlU29ja2V0KGQucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuICAgICAgICBkLmdlbmVyYXRlU29ja2V0KGUucHJvdmlkZUNvbm5lY3RvcigpKTtcclxuXHJcbiAgICAgICAgYXdhaXQgYS5yZWFkeTtcclxuICAgICAgICBhd2FpdCBiLnJlYWR5O1xyXG4gICAgICAgIGF3YWl0IGMucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgZC5yZWFkeTtcclxuICAgICAgICBhd2FpdCBlLnJlYWR5O1xyXG5cclxuICAgICAgICBhd2FpdCBzbGVlcCg1MDAwKTtcclxuXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmEgPSBhO1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55ICkuYiA9IGI7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkgKS5jID0gYztcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIFJvdXRlclxyXG5cclxuXHJcbl0pLnRoZW4oYSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIlRlc3RpbmcgY29tcGxldGUuXCIpO1xyXG4gICAgd2luZG93LmNsb3NlKClcclxufSkuY2F0Y2goZT0+e1xyXG4gICAgY29uc29sZS5lcnJvcihcIkNSSVRJQ0FMIEZBSUxVUkUhIFVuY2F1Z2h0IEV4Y2VwdGlvbjogXCIsZSk7XHJcbiAgICB3aW5kb3cuY2xvc2UoKVxyXG59KTtcclxuXHJcblxyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIifQ==