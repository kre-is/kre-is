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
            let vd = new VerDoc();
            vd.original = header + puk + data + String.fromCodePoint(...new Uint8Array(sigbuffer));
            vd.key = this.publicKey;
            vd.data = obj;
            vd.signature = JSON.stringify(new Uint8Array(sigbuffer));
            let ku = utf8buffer_1.utf8Encoder.encode(vd.original);
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
class RawDoc {
}
exports.RawDoc = RawDoc;
class VerDoc extends RawDoc {
    static reconstruct(rawDoc) {
        return __awaiter(this, void 0, void 0, function* () {
            let version = rawDoc.original.codePointAt(0);
            switch (version) {
                case 2: {
                    let header = rawDoc.original.substring(0, 3);
                    let puk = rawDoc.original.substr(3, rawDoc.original.codePointAt(1));
                    let data = rawDoc.original.substr(3 + rawDoc.original.codePointAt(1), rawDoc.original.codePointAt(2));
                    let sig = rawDoc.original.substr(3 + rawDoc.original.codePointAt(1) + rawDoc.original.codePointAt(2));
                    let key = yield new PublicKey(JSON.parse(puk)).ready;
                    let checksm = utf8buffer_1.utf8Encoder.encode(header + puk + data).reduce((a, c, i) => a + c * i, 0);
                    let uft = utf8buffer_1.utf8Encoder.encode(sig);
                    let chec2 = utf8buffer_1.utf8Encoder.encode(sig).reduce((a, c, i) => a + c * i, 0);
                    if (yield key.verify(utf8buffer_1.utf8Encoder.encode(header + puk + data), new Uint8Array(sig.split('').map(c => c.codePointAt(0))))) {
                        let vd = new VerDoc();
                        vd.signature = sig;
                        vd.key = key;
                        vd.data = JSON.parse(data);
                        vd.original = rawDoc.original;
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
const config_1 = __webpack_require__(/*! ./config */ "./modules/datalink/config.ts");
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

/***/ "./modules/datalink/config.ts":
/*!************************************!*\
  !*** ./modules/datalink/config.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.datalinkc = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};


/***/ }),

/***/ "./modules/network/NRequest.ts":
/*!*************************************!*\
  !*** ./modules/network/NRequest.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class NRequest {
    constructor(destination, original, inlink) {
        this.original = original;
        this.target = destination;
        this.inlink = inlink || null;
    }
}
exports.NRequest = NRequest;


/***/ }),

/***/ "./modules/network/NResponse.ts":
/*!**************************************!*\
  !*** ./modules/network/NResponse.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * if inlink is 0, assume you created it.
 */
class NResponse {
    constructor(original, inlink) {
        this.original = original;
        this.inlink = inlink || null;
    }
}
exports.NResponse = NResponse;


/***/ }),

/***/ "./modules/network/NetLink.ts":
/*!************************************!*\
  !*** ./modules/network/NetLink.ts ***!
  \************************************/
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
const NRequest_1 = __webpack_require__(/*! ./NRequest */ "./modules/network/NRequest.ts");
const NetworkAddress_1 = __webpack_require__(/*! ./NetworkAddress */ "./modules/network/NetworkAddress.ts");
const NResponse_1 = __webpack_require__(/*! ./NResponse */ "./modules/network/NResponse.ts");
class NetLink extends TransmissionControl_1.TransmissionControl {
    constructor(network) {
        super((reqstr) => __awaiter(this, void 0, void 0, function* () {
            let splitr = reqstr.indexOf('|');
            let address = parseFloat(reqstr.slice(0, splitr));
            return (yield network.onmessage(new NRequest_1.NRequest(new NetworkAddress_1.NetworkAddress(address), reqstr.slice(splitr + 1), this))).original;
        }));
        this.address = null;
    }
    setAddress(address) {
        this.address = address;
    }
    /**
     * @deprecated
     * @see dispatch
     * @param arg
     * @returns {Promise<void>}
     */
    send(arg) {
        throw "Not available: use dispatch.";
    }
    /**
     * use this instead of send
     * this is not called send, because typescript.
     * @param {NRequest} message
     * @returns {Promise<NResponse>}
     */
    dispatch(message) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            return new NResponse_1.NResponse(yield _super("send").call(this, message.target.numeric.toString() + "|" + message.original), self);
        });
    }
}
exports.NetLink = NetLink;


/***/ }),

/***/ "./modules/network/Network.ts":
/*!************************************!*\
  !*** ./modules/network/Network.ts ***!
  \************************************/
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
const NRequest_1 = __webpack_require__(/*! ./NRequest */ "./modules/network/NRequest.ts");
const NetworkAddress_1 = __webpack_require__(/*! ./NetworkAddress */ "./modules/network/NetworkAddress.ts");
const Arctable_1 = __webpack_require__(/*! ./arctable/Arctable */ "./modules/network/arctable/Arctable.ts");
const NetLink_1 = __webpack_require__(/*! ./NetLink */ "./modules/network/NetLink.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
var NetworkError;
(function (NetworkError) {
    NetworkError[NetworkError["NoParticipantFound"] = 1001] = "NoParticipantFound";
    NetworkError[NetworkError["ProtocolError"] = 1300] = "ProtocolError";
    NetworkError[NetworkError["HandshakeError1"] = 1301] = "HandshakeError1";
    NetworkError[NetworkError["HandshakeError2"] = 1302] = "HandshakeError2";
})(NetworkError || (NetworkError = {}));
class Network {
    constructor(onmessage, key) {
        this.pendingOffers = [];
        this.pendingAnswers = [];
        this.onmessage = onmessage;
        this.key = key || new PrivateKey_1.PrivateKey();
        this.ready = new Future_1.Future(); //fires when at least one connection is ready;
        (() => __awaiter(this, void 0, void 0, function* () {
            //guaranteed-ish to be ready on time because offer/answer awaits this.key
            this.links = new Arctable_1.Arctable(yield this.key.getPublicHash());
        }))();
    }
    connect(link) {
        let self = this;
        link.ready.then(() => self.ready.resolve(self));
        let ejected = this.links.add(link.address.numeric, link);
        if (ejected)
            ejected.close();
        return;
    }
    disconnect(link) {
        this.links.remove(link.address.numeric).close();
    }
    relay(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            let outlink = this.links.approach(request.target.numeric);
            if (!outlink)
                throw [NetworkError.NoParticipantFound];
            return yield outlink.dispatch(request);
        });
    }
    broadcast(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.links)
                throw [NetworkError.NoParticipantFound];
            let all = this.links.getAll();
            if (!all.length)
                throw [NetworkError.NoParticipantFound];
            return yield Promise.all(all.map(ol => ol.dispatch(new NRequest_1.NRequest(ol.address, request))));
        });
    }
    offer() {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let link = new NetLink_1.NetLink(this);
            let time = new Date().getTime();
            self.pendingOffers.push({ link: link, age: time });
            link.ready.then(() => {
                let element = self.pendingOffers.splice(self.pendingOffers.findIndex(e => e.age == time), 1)[0];
                self.connect(link);
            });
            //@todo: check if overfull, and disable further offers
            return this.key.sign({ o: yield link.offer(), t: time });
        });
    }
    answer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            try {
                let verdoc = yield PrivateKey_1.VerDoc.reconstruct(offer);
                let link = new NetLink_1.NetLink(self);
                let answer = yield link.answer(verdoc.data.o);
                let time = new Date().getTime();
                self.pendingAnswers.push({ age: time, link: link });
                link.setAddress(new NetworkAddress_1.NetworkAddress(verdoc.key.hashed()));
                link.ready.then(() => {
                    let element = self.pendingAnswers.splice(self.pendingAnswers.findIndex(e => e.age == time), 1)[0];
                    self.connect(link);
                });
                //@todo: delete oldest answers on overfull
                return this.key.sign({ a: answer, t: verdoc.data.t });
            }
            catch (e) {
                throw [NetworkError.HandshakeError1];
            }
        });
    }
    complete(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            try {
                let verdoc = yield PrivateKey_1.VerDoc.reconstruct(answer);
                let link = this.pendingOffers[this.pendingOffers.findIndex(o => o.age == verdoc.data.t)].link;
                link.complete(verdoc.data.a);
                link.setAddress(new NetworkAddress_1.NetworkAddress(verdoc.key.hashed()));
            }
            catch (e) {
                throw [NetworkError.HandshakeError2];
            }
        });
    }
}
exports.Network = Network;
class NOffer extends PrivateKey_1.RawDoc {
}
class NAnswer extends PrivateKey_1.RawDoc {
}


/***/ }),

/***/ "./modules/network/NetworkAddress.ts":
/*!*******************************************!*\
  !*** ./modules/network/NetworkAddress.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class NetworkAddress {
    constructor(hash) {
        if (hash >= 1 || hash <= 0)
            throw "Invalid address";
        this.numeric = hash;
    }
}
exports.NetworkAddress = NetworkAddress;


/***/ }),

/***/ "./modules/network/arctable/Arctable.ts":
/*!**********************************************!*\
  !*** ./modules/network/arctable/Arctable.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Chordioid_1 = __webpack_require__(/*! ./Chordioid */ "./modules/network/arctable/Chordioid.ts");
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
}
exports.Arctable = Arctable;


/***/ }),

/***/ "./modules/network/arctable/Chordioid.ts":
/*!***********************************************!*\
  !*** ./modules/network/arctable/Chordioid.ts ***!
  \***********************************************/
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
            console.log(((this.passed == this.tests.length) ? "Passed " : "FAILED! (") + this.passed + "/" + this.tests.length + "). in " + this.name + ".");
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
const DataLink_1 = __webpack_require__(/*! ../datalink/DataLink */ "./modules/datalink/DataLink.ts");
const config_1 = __webpack_require__(/*! ./config */ "./modules/transmissioncontrol/config.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
var TransmissionControlError;
(function (TransmissionControlError) {
    TransmissionControlError[TransmissionControlError["ConnectionClosed"] = 100] = "ConnectionClosed";
    TransmissionControlError[TransmissionControlError["RemoteError"] = 200] = "RemoteError";
    TransmissionControlError[TransmissionControlError["ProtocolError"] = 300] = "ProtocolError";
})(TransmissionControlError || (TransmissionControlError = {}));
/**
 * cpt 0
 * forward  cpt=1
 * backward cpr=2
 *
 * cpt 1
 * reference
 * 0
 *
 * cpt 2
 * reference if cpt 1 == 0
 * data...
 *
 * cpt 3...
 * data...
 */
class TransmissionControl extends DataLink_1.DataLink {
    constructor(onmessage) {
        super((msg) => console.log(msg));
        this.relayTable = new Array(config_1.transmissioncontrolc.maxMessageBuffer + 1).fill(null);
        const self = this;
        self.datachannel.onmessage = (msgE) => __awaiter(this, void 0, void 0, function* () {
            try {
                switch (msgE.data.codePointAt(0)) {
                    case 2: {
                        let idx = msgE.data.codePointAt(1);
                        if (!idx) {
                            idx = msgE.data.codePointAt(2);
                            self.relayTable[idx - 1].reject([TransmissionControlError.RemoteError,
                                ...msgE.data.slice(3).split('').map(c => c.codePointAt(0))]);
                        }
                        else {
                            self.relayTable[idx - 1].resolve(msgE.data.slice(2));
                        }
                        return;
                    }
                    case 1: {
                        let idx = msgE.data.codePointAt(1);
                        try {
                            self.reply(String.fromCodePoint(2, idx) + (yield onmessage(msgE.data.slice(2))));
                        }
                        catch (e) {
                            self.reply(String.fromCodePoint(2, 0, idx, ...e));
                        }
                    }
                }
            }
            catch (e) {
                console.log("bad actor");
                self.close();
            }
        });
    }
    reply(msg) {
        super.send(msg);
    }
    offer() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return "TCO:" + (yield _super("offer").call(this));
        });
    }
    answer(offer) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            if (offer.slice(0, 4) !== "TCO:")
                throw [TransmissionControlError.ProtocolError];
            return "TCA:" + (yield _super("answer").call(this, offer.slice(4)));
        });
    }
    complete(answer) {
        if (answer.slice(0, 4) !== "TCA:")
            throw [TransmissionControlError.ProtocolError];
        return super.complete(answer.slice(4));
    }
    send(msg) {
        let idx = this.relayTable.findIndex(e => !e) + 1;
        this.relayTable[idx - 1] = new Future_1.Future();
        super.send(String.fromCodePoint(1, idx) + msg);
        return this.relayTable[idx - 1];
    }
    close() {
        this.relayTable.forEach(e => e && e.reject([TransmissionControlError.ConnectionClosed]));
        super.close();
    }
}
exports.TransmissionControl = TransmissionControl;
class TCOffer extends DataLink_1.Offer {
}
exports.TCOffer = TCOffer;
class TCAnswer extends DataLink_1.Answer {
}
exports.TCAnswer = TCAnswer;


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
const Arctable_1 = __webpack_require__(/*! ./modules/network/arctable/Arctable */ "./modules/network/arctable/Arctable.ts");
const NetworkAddress_1 = __webpack_require__(/*! ./modules/network/NetworkAddress */ "./modules/network/NetworkAddress.ts");
const Network_1 = __webpack_require__(/*! ./modules/network/Network */ "./modules/network/Network.ts");
const NResponse_1 = __webpack_require__(/*! ./modules/network/NResponse */ "./modules/network/NResponse.ts");
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
        let a = new TransmissionControl_1.TransmissionControl(m => "a reflects: " + m);
        let b = new TransmissionControl_1.TransmissionControl((m) => __awaiter(this, void 0, void 0, function* () { return "b returns: " + (yield b.send("b reflects: " + m)); }));
        a.complete(yield b.answer(yield a.offer()));
        yield a.ready;
        let response = yield a.send("aaa");
        cr.assert("dual tcp bounce", response, "b returns: a reflects: b reflects: aaa");
        let c = new TransmissionControl_1.TransmissionControl(m => Promise.reject([40, 50, 60]));
        let d = new TransmissionControl_1.TransmissionControl((m) => __awaiter(this, void 0, void 0, function* () { return "nothing"; }));
        c.complete(yield d.answer(yield c.offer()));
        yield d.ready;
        cr.assert("remote handling propagation", JSON.stringify(yield d.send("boop").catch(e => e)), JSON.stringify([200, 40, 50, 60]));
        return cr.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let ct = new Test_1.Test("Arctable");
        let maxSize = 30;
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
        ct.assert("distance diff<1e-16", Arctable_1.Arctable.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
        let ti = new Arctable_1.Arctable(0.5);
        ct.assert("indicer", ti.ltoi(0), 0);
        ct.assert("indicer", ti.ltoi(1), 0);
        ct.assert("indicer", ti.ltoi(0.49999), 6);
        ct.assert("indicer", ti.ltoi(0.5), 14);
        ct.assert("indicer", ti.ltoi(0.50001), 22);
        let ti2 = new Arctable_1.Arctable(0.75);
        ct.assert("indicer 2", ti2.ltoi(0.25), 0);
        ct.assert("indicer 2", ti2.ltoi(0.74999), 6);
        ct.assert("indicer 2", ti2.ltoi(0.75), 14);
        ct.assert("indicer 2", ti2.ltoi(0.75001), 22);
        let to = { a: 0.111, b: 234512 };
        ct.assert("fetch 0", ti2.get(to.a), null);
        ct.assert("add 1", ti2.add(to.a, to), null);
        ct.assert("fetch 1", ti2.get(to.a), to);
        ct.assert("fetch 1", ti2.get(0.9), to);
        ct.assert("fetch 1", ti2.get(0.74), to);
        let to2 = { a: 0.1109, b: 234512 }; //higher efficiency same index
        ct.assert("add 2 (attempt overwrite)", ti2.add(to2.a, to2), null);
        ct.assert("fetch 2", ti2.get(to.a), to2);
        ct.assert("fetch 2.2", ti2.get(to2.a), to2);
        ct.assert("suggestion order", ti2.getSuggestions()[0].efficiency, ti2.getSuggestions()[1].efficiency, (a, b) => a > b);
        ct.assert("rem 1 arced", ti2.remove(to.a), to);
        ct.assert("rem 1", ti2.remove(to2.a), to2);
        ct.assert("rem 1 empty", ti2.remove(to2.a), null);
        let ti3 = new Arctable_1.Arctable(0.5, maxSize);
        for (let i = 0; i < maxSize; i++) {
            let item = { a: Math.random(), b: Math.random() };
            ct.assert("battery item " + i + ":", !!ti3.add(item.a, item), false);
        }
        let item = { a: Math.random(), b: Math.random() };
        ct.assert("completely full ejected something:", !!ti3.add(item.a, item), true);
        return ct.run();
    }))(),
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Network");
        window.Network = Network_1.Network;
        window.NetworkAddress = NetworkAddress_1.NetworkAddress;
        window.NResponse = NResponse_1.NResponse;
        let a = new Network_1.Network((msg) => new NResponse_1.NResponse("a replies to " + msg.original, null));
        let b = new Network_1.Network((msg) => new NResponse_1.NResponse("b replies to " + msg.original, null));
        let c = new Network_1.Network((msg) => new NResponse_1.NResponse("c replies to " + msg.original, null));
        try {
            cr.assert("network is empty", JSON.stringify(yield a.broadcast("A broadcasts").catch(e => e)), JSON.stringify([1001]));
        }
        catch (e) {
            console.log(e);
        }
        a.complete(yield b.answer(yield a.offer()));
        b.complete(yield c.answer(yield b.offer()));
        c.complete(yield a.answer(yield c.offer()));
        yield new Promise(a => setTimeout(() => a(), 1000));
        yield a.ready;
        yield b.ready;
        yield c.ready;
        cr.assert("network is empty", (yield a.broadcast("A broadcasts")).length, 2);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2RhdGFsaW5rL0RhdGFMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvZGF0YWxpbmsvY29uZmlnLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OUmVxdWVzdC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvTlJlc3BvbnNlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXRMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXR3b3JrLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXR3b3JrQWRkcmVzcy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvYXJjdGFibGUvQXJjdGFibGUudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9uZXR3b3JrL2FyY3RhYmxlL0Nob3JkaW9pZC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rlc3QvVGVzdC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL0Z1dHVyZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL3V0ZjhidWZmZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2wudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90cmFuc21pc3Npb25jb250cm9sL2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7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QUFDLENBQUMsQ0FBQyxFQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUMsRUFBQyxFQUFFO0lBRUosQ0FBQyxHQUFRLEVBQUU7UUFBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFakIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDbEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFFbEcsSUFBSSxFQUFFLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUzQyxJQUFJLEdBQUcsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU5QyxJQUFJLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFeEMsSUFBSSxHQUFHLEdBQUcsRUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDLDhCQUE4QjtRQUNoRSxFQUFFLENBQUMsTUFBTSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU1QyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV2SCxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVsRCxJQUFJLEdBQUcsR0FBRyxJQUFJLG1CQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUM7WUFDMUIsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsQ0FBQztZQUNoRCxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBQyxDQUFDLEdBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDO1NBQ25FO1FBQ0QsSUFBSSxJQUFJLEdBQUcsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsQ0FBQztRQUNoRCxFQUFFLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFHL0UsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQyxFQUFDLEVBQUU7SUFFSixDQUFDLEdBQVEsRUFBRTtRQUFDLElBQUksRUFBRSxHQUFHLElBQUksV0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BDLE1BQWMsQ0FBQyxPQUFPLEdBQUcsaUJBQU8sQ0FBQztRQUNqQyxNQUFjLENBQUMsY0FBYyxHQUFHLCtCQUFjLENBQUM7UUFDL0MsTUFBYyxDQUFDLFNBQVMsR0FBRyxxQkFBUyxDQUFDO1FBRXRDLElBQUksQ0FBQyxHQUFHLElBQUksaUJBQU8sQ0FBQyxDQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsSUFBSSxxQkFBUyxDQUFDLGVBQWUsR0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxDQUFDLENBQUMsR0FBRyxFQUFDLEVBQUUsQ0FBQyxJQUFJLHFCQUFTLENBQUMsZUFBZSxHQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsR0FBRyxJQUFJLGlCQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUMsRUFBRSxDQUFDLElBQUkscUJBQVMsQ0FBQyxlQUFlLEdBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRS9FLElBQUk7WUFFQSxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUUxSDtRQUFBLE9BQU0sQ0FBQyxFQUFDO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQjtRQUNELENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRSxFQUFFLEVBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEQsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBSWQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU3RSxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDLEVBQUMsRUFBRTtDQUdQLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNsQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFFO0lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi90ZXN0LnRzXCIpO1xuIiwiaW1wb3J0IHt1dGY4RGVjb2RlciwgdXRmOEVuY29kZXJ9IGZyb20gXCIuLi90b29scy91dGY4YnVmZmVyXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFByaXZhdGVLZXkge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWFkeSA6IFByb21pc2VMaWtlPGFueT47XHJcbiAgICBwcml2YXRlIHByaXZhdGVLZXkgOiBDcnlwdG9LZXk7XHJcbiAgICBwcml2YXRlIHB1YmxpY0tleSA6IFB1YmxpY0tleTtcclxuICAgIHJlYWRvbmx5IHZlcnNpb24gPSAyO1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSB3aW5kb3cuY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgW1wic2lnblwiLCBcInZlcmlmeVwiXVxyXG4gICAgICAgICAgICApLnRoZW4oa2V5cyA9PiB7IC8va2V5czoge3ByaXZhdGVLZXk6IENyeXB0b0tleSwgcHVibGljS2V5OiBDcnlwdG9LZXl9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBrZXlzLnByaXZhdGVLZXk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVibGljS2V5XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KS50aGVuKGp3ayA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG5ldyBQdWJsaWNLZXkoandrKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbjxUPihvYmogOiBUKSA6IFByb21pc2U8VmVyRG9jPFQ+PiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaik7XHJcbiAgICAgICAgbGV0IHB1ayA9IHRoaXMucHVibGljS2V5LnRvSlNPTigpO1xyXG4gICAgICAgIGxldCBoZWFkZXIgPSBTdHJpbmcuZnJvbUNvZGVQb2ludCh0aGlzLnZlcnNpb24sIHB1ay5sZW5ndGgsIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICBsZXQgc2lnbmFibGUgPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IHNpZ2J1ZmZlciA9IGF3YWl0IHdpbmRvdy5jcnlwdG8uc3VidGxlLnNpZ24oXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSxcclxuICAgICAgICAgICAgc2lnbmFibGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICBsZXQgdWZ0ID0gIG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcik7XHJcbiAgICAgICAgbGV0IGNoZWMyID0gbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG4gICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oKTtcclxuICAgICAgICB2ZC5vcmlnaW5hbCA9IGhlYWRlcitwdWsrZGF0YStTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5uZXcgVWludDhBcnJheShzaWdidWZmZXIpKTtcclxuICAgICAgICB2ZC5rZXkgPSB0aGlzLnB1YmxpY0tleTtcclxuICAgICAgICB2ZC5kYXRhID0gb2JqO1xyXG4gICAgICAgIHZkLnNpZ25hdHVyZSA9IEpTT04uc3RyaW5naWZ5KG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcikpO1xyXG5cclxuICAgICAgICBsZXQga3UgPSB1dGY4RW5jb2Rlci5lbmNvZGUodmQub3JpZ2luYWwpO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHZkO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZ2V0UHVibGljSGFzaCgpIDogUHJvbWlzZTxudW1iZXI+e1xyXG4gICAgICAgIGF3YWl0IHRoaXMucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaWNLZXkucmVhZHk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljS2V5Lmhhc2hlZCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmVyRG9jIERBT1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJhd0RvYzxUPntcclxuICAgIG9yaWdpbmFsIDogc3RyaW5nO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFZlckRvYzxUPiBleHRlbmRzIFJhd0RvYzxUPntcclxuICAgIGRhdGE6IFQ7XHJcbiAgICBrZXk6IFB1YmxpY0tleTtcclxuICAgIHNpZ25hdHVyZTogc3RyaW5nO1xyXG4gICAgc3RhdGljIGFzeW5jIHJlY29uc3RydWN0PFQ+KHJhd0RvYyA6IFJhd0RvYzxUPikgOiBQcm9taXNlPFZlckRvYzxUPj57XHJcbiAgICAgICAgbGV0IHZlcnNpb24gPSByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodmVyc2lvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHJpbmcoMCwzKTtcclxuICAgICAgICAgICAgICAgIGxldCBwdWsgPSByYXdEb2Mub3JpZ2luYWwuc3Vic3RyKDMsIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMyArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSwgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDIpKTtcclxuICAgICAgICAgICAgICAgIGxldCBzaWcgPSByYXdEb2Mub3JpZ2luYWwuc3Vic3RyKDMgKyByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMSkgKyByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMikpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBrZXkgPSBhd2FpdCBuZXcgUHVibGljS2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1a1xyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICkucmVhZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrc20gPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdWZ0ID0gIHV0ZjhFbmNvZGVyLmVuY29kZShzaWcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWMyID0gdXRmOEVuY29kZXIuZW5jb2RlKHNpZykucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKFxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGtleS52ZXJpZnkodXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSksIG5ldyBVaW50OEFycmF5KHNpZy5zcGxpdCgnJykubWFwKGMgPT4gYy5jb2RlUG9pbnRBdCgwKSkpKVxyXG4gICAgICAgICAgICAgICAgKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmQgPSBuZXcgVmVyRG9jPFQ+KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQuc2lnbmF0dXJlID0gc2lnO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmtleSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5vcmlnaW5hbCA9IHJhd0RvYy5vcmlnaW5hbDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiYmFkIGRvY3VtZW50XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBQcm9taXNlLnJlamVjdChcInZlcnNpb24gdW5zdXBwb3J0ZWQ6IFwiK3ZlcnNpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gaGFzaCBQLTM4NCBTUEtJIGludG8gKDAsMSkgZmxvYXRcclxuZnVuY3Rpb24gU1BLSXRvTnVtZXJpYyhzcGtpOiBBcnJheUJ1ZmZlcikgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNwa2kpLlxyXG4gICAgICAgIHNsaWNlKC05NikuXHJcbiAgICAgICAgcmV2ZXJzZSgpLlxyXG4gICAgICAgIHJlZHVjZSgoYSxlLGkpPT5hK2UqTWF0aC5wb3coMjU2LGkpLCAwKSAvXHJcbiAgICAgICAgTWF0aC5wb3coMjU2LCA5Nik7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQdWJsaWNLZXkge1xyXG4gICAgcHJpdmF0ZSBwdWJsaWNDcnlwdG9LZXk6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgZmxvYXRpbmc6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgandrOiBKc29uV2ViS2V5O1xyXG4gICAgcmVhZHk7XHJcbiAgICBjb25zdHJ1Y3Rvcihqd2s6IEpzb25XZWJLZXkpe1xyXG4gICAgICAgIGxldCBwcm90b0pXSyA9IHtcImNydlwiOlwiUC0zODRcIiwgXCJleHRcIjp0cnVlLCBcImtleV9vcHNcIjpbXCJ2ZXJpZnlcIl0sIFwia3R5XCI6XCJFQ1wiLCBcInhcIjpqd2tbXCJ4XCJdLCBcInlcIjpqd2tbXCJ5XCJdfTtcclxuICAgICAgICB0aGlzLmZsb2F0aW5nID0gTmFOO1xyXG4gICAgICAgIHRoaXMuandrID0gcHJvdG9KV0s7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmltcG9ydEtleShcclxuICAgICAgICAgICAgXCJqd2tcIixcclxuICAgICAgICAgICAgdGhpcy5qd2ssXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIG5hbWVkQ3VydmU6IFwiUC0zODRcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgW1widmVyaWZ5XCJdXHJcbiAgICAgICAgKS50aGVuKHB1YmxpY0NyeXB0b0tleSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5ID0gcHVibGljQ3J5cHRvS2V5O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgIFwic3BraVwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXlcclxuICAgICAgICAgICAgKS50aGVuKHNwa2kgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mbG9hdGluZyA9IFNQS0l0b051bWVyaWMoc3BraSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkudGhlbigoKT0+dGhpcyk7XHJcbiAgICB9XHJcbiAgICBoYXNoZWQoKXtcclxuICAgICAgICBpZihpc05hTih0aGlzLmZsb2F0aW5nKSkgdGhyb3cgRXJyb3IoXCJOb3QgUmVhZHkuXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZsb2F0aW5nO1xyXG4gICAgfVxyXG4gICAgdG9KU09OKCl7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcInhcIjogdGhpcy5qd2tbXCJ4XCJdLCBcInlcIjogdGhpcy5qd2tbXCJ5XCJdfSk7XHJcbiAgICB9XHJcbiAgICB2ZXJpZnkoZGF0YTogVWludDhBcnJheSwgc2lnbmF0dXJlOiBBcnJheUJ1ZmZlcik6IFByb21pc2VMaWtlPGJvb2xlYW4+e1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuY3J5cHRvLnN1YnRsZS52ZXJpZnkoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5LFxyXG4gICAgICAgICAgICBzaWduYXR1cmUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGZyb21TdHJpbmcoandrc3RyaW5nOiBzdHJpbmcpOiBQdWJsaWNLZXl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQdWJsaWNLZXkoSlNPTi5wYXJzZShqd2tzdHJpbmcpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7ZGF0YWxpbmtjfSBmcm9tIFwiLi9jb25maWdcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBEYXRhTGluayBleHRlbmRzIFJUQ1BlZXJDb25uZWN0aW9ue1xyXG4gICAgcHJvdGVjdGVkIGRhdGFjaGFubmVsIDogUlRDRGF0YUNoYW5uZWw7XHJcbiAgICByZWFkb25seSByZWFkeSA6IFByb21pc2U8dGhpcz47XHJcbiAgICByZWFkb25seSBjbG9zZWQgOiBQcm9taXNlPHRoaXM+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9ubWVzc2FnZSA6IChtc2cgOiBNZXNzYWdlRXZlbnQpPT4gdm9pZCApe1xyXG4gICAgICAgIHN1cGVyKGRhdGFsaW5rYyk7XHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbCA9ICh0aGlzIGFzIGFueSlcclxuICAgICAgICAgICAgLmNyZWF0ZURhdGFDaGFubmVsKFwiZGF0YVwiLCB7bmVnb3RpYXRlZDogdHJ1ZSwgaWQ6IDAsIG9yZGVyZWQ6IGZhbHNlfSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSBuZXcgUHJvbWlzZTx0aGlzPiggcmVzb2x2ZSA9PiB0aGlzLmRhdGFjaGFubmVsLm9ub3BlbiA9ICgpPT4gcmVzb2x2ZSgpKTtcclxuICAgICAgICB0aGlzLmNsb3NlZCA9IG5ldyBQcm9taXNlPHRoaXM+KCByZXNvbHZlID0+IHRoaXMuZGF0YWNoYW5uZWwub25jbG9zZSA9ICgpPT4gcmVzb2x2ZSgpKTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcgfCBCbG9iIHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kYXRhY2hhbm5lbC5zZW5kKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKSA6IFByb21pc2U8T2ZmZXI+e1xyXG4gICAgICAgIHRoaXMuc2V0TG9jYWxEZXNjcmlwdGlvbihhd2FpdCB0aGlzLmNyZWF0ZU9mZmVyKCkpO1xyXG5cclxuICAgICAgICAvLyBwcm9taXNlIHRvIHdhaXQgZm9yIHRoZSBzZHBcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8T2ZmZXI+KChhY2NlcHQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGFjY2VwdCh0aGlzLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgYW5zd2VyKG9mZmVyIDogT2ZmZXIpIDogUHJvbWlzZTxBbnN3ZXI+e1xyXG4gICAgICAgIHRoaXMuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2ZmZXJcIixcclxuICAgICAgICAgICAgc2RwOiBvZmZlciBhcyBzdHJpbmdcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5zZXRMb2NhbERlc2NyaXB0aW9uKGF3YWl0IHRoaXMuY3JlYXRlQW5zd2VyKCkpO1xyXG5cclxuICAgICAgICAvLyBwcm9taXNlIHRvIHdhaXQgZm9yIHRoZSBzZHBcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QW5zd2VyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQodGhpcy5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGNvbXBsZXRlKGFuc3dlciA6IEFuc3dlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcImFuc3dlclwiLFxyXG4gICAgICAgICAgICBzZHA6IGFuc3dlciBhcyBzdHJpbmdcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT2ZmZXIgZXh0ZW5kcyBTdHJpbmd7fVxyXG5leHBvcnQgY2xhc3MgQW5zd2VyIGV4dGVuZHMgU3RyaW5ne31cclxuXHJcbmludGVyZmFjZSBSVENEYXRhQ2hhbm5lbCBleHRlbmRzIEV2ZW50VGFyZ2V0e1xyXG4gICAgb25jbG9zZTogRnVuY3Rpb247XHJcbiAgICBvbmVycm9yOiBGdW5jdGlvbjtcclxuICAgIG9ubWVzc2FnZTogRnVuY3Rpb247XHJcbiAgICBvbm9wZW46IEZ1bmN0aW9uO1xyXG4gICAgY2xvc2UoKTtcclxuICAgIHNlbmQobXNnIDogc3RyaW5nIHwgQmxvYiB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3KTtcclxufSIsImV4cG9ydCBjb25zdCBkYXRhbGlua2MgPSB7XHJcbiAgICBpY2VTZXJ2ZXJzOiBbe3VybHM6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV1cclxufTsiLCJpbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9OZXR3b3JrQWRkcmVzc1wiO1xyXG5pbXBvcnQge05ldExpbmt9IGZyb20gXCIuL05ldExpbmtcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTlJlcXVlc3Qge1xyXG4gICAgb3JpZ2luYWw6IHN0cmluZztcclxuICAgIHRhcmdldDogTmV0d29ya0FkZHJlc3M7XHJcbiAgICBpbmxpbms6IE5ldExpbms7XHJcbiAgICBjb25zdHJ1Y3RvcihkZXN0aW5hdGlvbiA6IE5ldHdvcmtBZGRyZXNzLCBvcmlnaW5hbCA6IHN0cmluZywgaW5saW5rID86IE5ldExpbmspe1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWwgPSBvcmlnaW5hbDtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IGRlc3RpbmF0aW9uO1xyXG4gICAgICAgIHRoaXMuaW5saW5rID0gaW5saW5rIHx8IG51bGw7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1RyYW5zbWlzc2lvbkNvbnRyb2x9IGZyb20gXCIuLi90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2xcIjtcclxuaW1wb3J0IHtOZXRMaW5rfSBmcm9tIFwiLi9OZXRMaW5rXCI7XHJcblxyXG4vKipcclxuICogaWYgaW5saW5rIGlzIDAsIGFzc3VtZSB5b3UgY3JlYXRlZCBpdC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBOUmVzcG9uc2V7XHJcbiAgICBvcmlnaW5hbCA6IHN0cmluZztcclxuICAgIGlubGluayA6IE5ldExpbms7XHJcbiAgICBjb25zdHJ1Y3RvcihvcmlnaW5hbCA6IHN0cmluZywgaW5saW5rID86IE5ldExpbmspe1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWwgPSBvcmlnaW5hbDtcclxuICAgICAgICB0aGlzLmlubGluayA9IGlubGluayB8fCBudWxsO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtUcmFuc21pc3Npb25Db250cm9sfSBmcm9tIFwiLi4vdHJhbnNtaXNzaW9uY29udHJvbC9UcmFuc21pc3Npb25Db250cm9sXCI7XHJcbmltcG9ydCB7TmV0d29ya30gZnJvbSBcIi4vTmV0d29ya1wiO1xyXG5pbXBvcnQge05SZXF1ZXN0fSBmcm9tIFwiLi9OUmVxdWVzdFwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9OZXR3b3JrQWRkcmVzc1wiO1xyXG5pbXBvcnQge05SZXNwb25zZX0gZnJvbSBcIi4vTlJlc3BvbnNlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0TGluayBleHRlbmRzIFRyYW5zbWlzc2lvbkNvbnRyb2x7XHJcbiAgICBhZGRyZXNzIDogTmV0d29ya0FkZHJlc3MgPSBudWxsO1xyXG4gICAgY29uc3RydWN0b3IobmV0d29yayA6IE5ldHdvcmspIHtcclxuICAgICAgICBzdXBlcihhc3luYyByZXFzdHIgPT4ge1xyXG4gICAgICAgICAgICBsZXQgc3BsaXRyID0gcmVxc3RyLmluZGV4T2YoJ3wnKTtcclxuICAgICAgICAgICAgbGV0IGFkZHJlc3MgPSBwYXJzZUZsb2F0KHJlcXN0ci5zbGljZSgwLCBzcGxpdHIpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgbmV0d29yay5vbm1lc3NhZ2UobmV3IE5SZXF1ZXN0KG5ldyBOZXR3b3JrQWRkcmVzcyhhZGRyZXNzKSwgcmVxc3RyLnNsaWNlKHNwbGl0cisxKSwgdGhpcykpKS5vcmlnaW5hbDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHNldEFkZHJlc3MoYWRkcmVzcyA6IE5ldHdvcmtBZGRyZXNzKXtcclxuICAgICAgICB0aGlzLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGRlcHJlY2F0ZWRcclxuICAgICAqIEBzZWUgZGlzcGF0Y2hcclxuICAgICAqIEBwYXJhbSBhcmdcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gICAgICovXHJcbiAgICBzZW5kKGFyZyA6IGFueSkgOiBQcm9taXNlPGFueT57XHJcbiAgICAgICAgdGhyb3cgXCJOb3QgYXZhaWxhYmxlOiB1c2UgZGlzcGF0Y2guXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgdGhpcyBpbnN0ZWFkIG9mIHNlbmRcclxuICAgICAqIHRoaXMgaXMgbm90IGNhbGxlZCBzZW5kLCBiZWNhdXNlIHR5cGVzY3JpcHQuXHJcbiAgICAgKiBAcGFyYW0ge05SZXF1ZXN0fSBtZXNzYWdlXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxOUmVzcG9uc2U+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBkaXNwYXRjaChtZXNzYWdlIDogTlJlcXVlc3QpIDogUHJvbWlzZTxOUmVzcG9uc2U+e1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IE5SZXNwb25zZShcclxuICAgICAgICAgICAgYXdhaXQgc3VwZXIuc2VuZChtZXNzYWdlLnRhcmdldC5udW1lcmljLnRvU3RyaW5nKCkgKyBcInxcIiArIG1lc3NhZ2Uub3JpZ2luYWwpLFxyXG4gICAgICAgICAgICBzZWxmXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7VENBbnN3ZXIsIFRDT2ZmZXIsIFRyYW5zbWlzc2lvbkNvbnRyb2x9IGZyb20gXCIuLi90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2xcIjtcclxuaW1wb3J0IHtOUmVzcG9uc2V9IGZyb20gXCIuL05SZXNwb25zZVwiO1xyXG5pbXBvcnQge05SZXF1ZXN0fSBmcm9tIFwiLi9OUmVxdWVzdFwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9OZXR3b3JrQWRkcmVzc1wiO1xyXG5pbXBvcnQge0FyY3RhYmxlfSBmcm9tIFwiLi9hcmN0YWJsZS9BcmN0YWJsZVwiO1xyXG5pbXBvcnQge05ldExpbmt9IGZyb20gXCIuL05ldExpbmtcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcblxyXG5lbnVtIE5ldHdvcmtFcnJvcntcclxuICAgIE5vUGFydGljaXBhbnRGb3VuZCA9IDEwMDEsXHJcbiAgICBQcm90b2NvbEVycm9yID0gMTMwMCxcclxuICAgIEhhbmRzaGFrZUVycm9yMSA9IDEzMDEsXHJcbiAgICBIYW5kc2hha2VFcnJvcjIgPSAxMzAyXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOZXR3b3Jre1xyXG4gICAgbGlua3M6IEFyY3RhYmxlPE5ldExpbms+O1xyXG4gICAgcGVuZGluZ09mZmVycyA6IHtsaW5rIDogTmV0TGluaywgYWdlIDogbnVtYmVyfVtdID0gW107XHJcbiAgICBwZW5kaW5nQW5zd2Vyczoge2xpbmsgOiBOZXRMaW5rLCBhZ2UgOiBudW1iZXJ9W10gPSBbXTtcclxuICAgIG9ubWVzc2FnZSA6IChyZXF1ZXN0IDogTlJlcXVlc3QpID0+IE5SZXNwb25zZTtcclxuICAgIHJlYWR5IDogUHJvbWlzZTxOZXR3b3JrPjtcclxuICAgIHByaXZhdGUga2V5IDogUHJpdmF0ZUtleTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihvbm1lc3NhZ2UgOiAocmVxdWVzdCA6IE5SZXF1ZXN0KSA9PiBOUmVzcG9uc2UsIGtleSA/OiBQcml2YXRlS2V5KXtcclxuICAgICAgICB0aGlzLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcclxuICAgICAgICB0aGlzLmtleSA9IGtleSB8fCBuZXcgUHJpdmF0ZUtleSgpO1xyXG4gICAgICAgIHRoaXMucmVhZHkgPSBuZXcgRnV0dXJlPE5ldHdvcms+KCk7IC8vZmlyZXMgd2hlbiBhdCBsZWFzdCBvbmUgY29ubmVjdGlvbiBpcyByZWFkeTtcclxuICAgICAgICAoYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgLy9ndWFyYW50ZWVkLWlzaCB0byBiZSByZWFkeSBvbiB0aW1lIGJlY2F1c2Ugb2ZmZXIvYW5zd2VyIGF3YWl0cyB0aGlzLmtleVxyXG4gICAgICAgICAgICB0aGlzLmxpbmtzID0gbmV3IEFyY3RhYmxlPE5ldExpbms+KGF3YWl0IHRoaXMua2V5LmdldFB1YmxpY0hhc2goKSk7XHJcbiAgICAgICAgfSkoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdChsaW5rIDogTmV0TGluayl7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxpbmsucmVhZHkudGhlbigoKT0+KHNlbGYucmVhZHkgYXMgRnV0dXJlPE5ldHdvcms+KS5yZXNvbHZlKHNlbGYpKTtcclxuICAgICAgICBsZXQgZWplY3RlZCA9IHRoaXMubGlua3MuYWRkKGxpbmsuYWRkcmVzcy5udW1lcmljICxsaW5rKTtcclxuICAgICAgICBpZihlamVjdGVkKSBlamVjdGVkLmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZGlzY29ubmVjdChsaW5rIDogTmV0TGluayl7XHJcbiAgICAgICAgdGhpcy5saW5rcy5yZW1vdmUobGluay5hZGRyZXNzLm51bWVyaWMpLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGFzeW5jIHJlbGF5KHJlcXVlc3QgOiBOUmVxdWVzdCkgOiBQcm9taXNlPE5SZXNwb25zZT57XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgb3V0bGluayA9IHRoaXMubGlua3MuYXBwcm9hY2gocmVxdWVzdC50YXJnZXQubnVtZXJpYyk7XHJcbiAgICAgICAgaWYoIW91dGxpbmspIHRocm93IFtOZXR3b3JrRXJyb3IuTm9QYXJ0aWNpcGFudEZvdW5kXTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgb3V0bGluay5kaXNwYXRjaChyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBicm9hZGNhc3QocmVxdWVzdCA6IHN0cmluZykgOiBQcm9taXNlPE5SZXNwb25zZVtdPntcclxuICAgICAgICBpZighdGhpcy5saW5rcyApIHRocm93IFtOZXR3b3JrRXJyb3IuTm9QYXJ0aWNpcGFudEZvdW5kXTtcclxuICAgICAgICBsZXQgYWxsID0gdGhpcy5saW5rcy5nZXRBbGwoKTtcclxuICAgICAgICBpZighYWxsLmxlbmd0aCkgdGhyb3cgW05ldHdvcmtFcnJvci5Ob1BhcnRpY2lwYW50Rm91bmRdO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChhbGwubWFwKG9sID0+IG9sLmRpc3BhdGNoKG5ldyBOUmVxdWVzdChvbC5hZGRyZXNzLCByZXF1ZXN0KSkpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvZmZlcigpIDogUHJvbWlzZTxOT2ZmZXI+e1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgbGluayA9IG5ldyBOZXRMaW5rKHRoaXMpO1xyXG4gICAgICAgIGxldCB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgICAgIHNlbGYucGVuZGluZ09mZmVycy5wdXNoKHtsaW5rOiBsaW5rLCBhZ2U6IHRpbWV9KTtcclxuXHJcbiAgICAgICAgbGluay5yZWFkeS50aGVuKCgpPT57XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gc2VsZi5wZW5kaW5nT2ZmZXJzLnNwbGljZShcclxuICAgICAgICAgICAgICAgIHNlbGYucGVuZGluZ09mZmVycy5maW5kSW5kZXgoZSA9PiBlLmFnZSA9PSB0aW1lKSwxKVswXTtcclxuICAgICAgICAgICAgc2VsZi5jb25uZWN0KGxpbmspO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vQHRvZG86IGNoZWNrIGlmIG92ZXJmdWxsLCBhbmQgZGlzYWJsZSBmdXJ0aGVyIG9mZmVyc1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5rZXkuc2lnbjx7bzogVENPZmZlciwgdDogbnVtYmVyfT4oe286IGF3YWl0IGxpbmsub2ZmZXIoKSwgdDogdGltZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFuc3dlcihvZmZlciA6IE5PZmZlcikgOiBQcm9taXNlPE5BbnN3ZXI+e1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGxldCB2ZXJkb2MgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3Q8e286IFRDT2ZmZXIsIHQ6IG51bWJlcn0+KG9mZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsaW5rID0gbmV3IE5ldExpbmsoc2VsZik7XHJcbiAgICAgICAgICAgIGxldCBhbnN3ZXIgPSBhd2FpdCBsaW5rLmFuc3dlcih2ZXJkb2MuZGF0YS5vKTtcclxuICAgICAgICAgICAgbGV0IHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgc2VsZi5wZW5kaW5nQW5zd2Vycy5wdXNoKHthZ2U6IHRpbWUsIGxpbms6IGxpbmt9KTtcclxuXHJcbiAgICAgICAgICAgIGxpbmsuc2V0QWRkcmVzcyhuZXcgTmV0d29ya0FkZHJlc3ModmVyZG9jLmtleS5oYXNoZWQoKSkpO1xyXG5cclxuICAgICAgICAgICAgbGluay5yZWFkeS50aGVuKCgpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHNlbGYucGVuZGluZ0Fuc3dlcnMuc3BsaWNlKFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucGVuZGluZ0Fuc3dlcnMuZmluZEluZGV4KGUgPT4gZS5hZ2UgPT0gdGltZSksMSlbMF07XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNvbm5lY3QobGluayk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9AdG9kbzogZGVsZXRlIG9sZGVzdCBhbnN3ZXJzIG9uIG92ZXJmdWxsXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5rZXkuc2lnbjx7YSA6IFRDQW5zd2VyLCB0OiBudW1iZXJ9Pih7YSA6IGFuc3dlciwgdDogdmVyZG9jLmRhdGEudH0pO1xyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgdGhyb3cgW05ldHdvcmtFcnJvci5IYW5kc2hha2VFcnJvcjFdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb21wbGV0ZShhbnN3ZXIgOiBOQW5zd2VyKXtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBsZXQgdmVyZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0PHthIDogVENBbnN3ZXIsIHQ6IG51bWJlcn0+KGFuc3dlcik7XHJcblxyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmsgPSB0aGlzLnBlbmRpbmdPZmZlcnNbXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nT2ZmZXJzLmZpbmRJbmRleChvID0+IG8uYWdlID09IHZlcmRvYy5kYXRhLnQpXHJcbiAgICAgICAgICAgICAgICBdLmxpbms7XHJcbiAgICAgICAgICAgIGxpbmsuY29tcGxldGUodmVyZG9jLmRhdGEuYSk7XHJcblxyXG4gICAgICAgICAgICBsaW5rLnNldEFkZHJlc3MobmV3IE5ldHdvcmtBZGRyZXNzKHZlcmRvYy5rZXkuaGFzaGVkKCkpKTtcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIHRocm93IFtOZXR3b3JrRXJyb3IuSGFuZHNoYWtlRXJyb3IyXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5jbGFzcyBOT2ZmZXIgZXh0ZW5kcyBSYXdEb2M8e286IFRDT2ZmZXIsIHQ6IG51bWJlcn0+e31cclxuY2xhc3MgTkFuc3dlciBleHRlbmRzIFJhd0RvYzx7YSA6IFRDQW5zd2VyLCB0OiBudW1iZXJ9Pnt9IiwiaW1wb3J0IHtQdWJsaWNLZXl9IGZyb20gXCIuLi9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ldHdvcmtBZGRyZXNzIHtcclxuICAgIHJlYWRvbmx5IG51bWVyaWMgOiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3RvcihoYXNoOiBudW1iZXIpe1xyXG4gICAgICAgIGlmKGhhc2ggPj0gMSB8fCBoYXNoIDw9IDApIHRocm93IFwiSW52YWxpZCBhZGRyZXNzXCI7XHJcbiAgICAgICAgdGhpcy5udW1lcmljID0gaGFzaDtcclxuICAgIH1cclxufSIsImltcG9ydCB7Q2hvcmRvaWR9IGZyb20gXCIuL0Nob3JkaW9pZFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFyY3RhYmxlPFQ+IGV4dGVuZHMgQ2hvcmRvaWQ8VD4ge1xyXG4gICAgcHJpdmF0ZSBwdXJnYXRvcnk6IHsga2V5OiBudW1iZXIsIG9iajogVCwgZWZmOiBudW1iZXIsIGlkeDogbnVtYmVyIH1bXSA9IFtdOyAvLyBzdG9yZXMgcGVuZGluZyBhZGRyZXNzZXM7XHJcbiAgICBwcml2YXRlIGRlZXBTdG9yZWQgOiBudW1iZXIgPSAwO1xyXG4gICAgcmVhZG9ubHkgbWF4U2l6ZSA6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZW50ZXIgOiBudW1iZXIsIG1heFNpemUgPSBDaG9yZG9pZC5sb29rdXBUYWJsZS5sZW5ndGggLSAxKXtcclxuICAgICAgICBzdXBlcihjZW50ZXIpO1xyXG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IG1heFNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGxvY2F0aW9uIDogbnVtYmVyLCBvYmplY3QgOiBUKSA6IFQgfCBudWxse1xyXG4gICAgICAgIGlmKHRoaXMuaXNEZXNpcmFibGUobG9jYXRpb24pKXtcclxuICAgICAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBleHRyYWN0ZWQgPSB0aGlzLmFycmF5W2lkeF07XHJcbiAgICAgICAgICAgIHRoaXMuYXJyYXlbaWR4XSA9IHtrZXk6IGxvY2F0aW9uLCBvYmo6IG9iamVjdH07XHJcblxyXG4gICAgICAgICAgICBpZighZXh0cmFjdGVkKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVlcFN0b3JlZCsrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxvY2F0aW9uID0gZXh0cmFjdGVkLmtleTtcclxuICAgICAgICAgICAgb2JqZWN0ID0gZXh0cmFjdGVkLm9iajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGxldCBlZmZpY2llbmN5ID0gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpO1xyXG5cclxuICAgICAgICB0aGlzLnB1cmdhdG9yeS5wdXNoKHtvYmo6IG9iamVjdCwga2V5OiBsb2NhdGlvbiwgZWZmOiBlZmZpY2llbmN5LCBpZHg6IGlkeH0pO1xyXG5cclxuICAgICAgICBpZih0aGlzLnB1cmdhdG9yeS5sZW5ndGggPD0gdGhpcy5tYXhTaXplIC0gdGhpcy5kZWVwU3RvcmVkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5wdXJnYXRvcnkuc29ydCgoYSwgYik9PiBhLmVmZiAtIGIuZWZmKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVyZ2F0b3J5LnBvcCgpLm9iajtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uIDogbnVtYmVyKSA6IFR7XHJcbiAgICAgICAgbGV0IHJlbW92ZWQgPSBzdXBlci5yZW1vdmUobG9jYXRpb24pO1xyXG4gICAgICAgIGlmKHJlbW92ZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmRlZXBTdG9yZWQtLTtcclxuXHJcbiAgICAgICAgICAgIC8vZmluZCBhIHJlcGxhY2VtZW50XHJcbiAgICAgICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgY2FuZGlkYXRlcyA9IHRoaXMucHVyZ2F0b3J5LmZpbHRlcihlID0+IGUuaWR4ID09IGlkeCk7XHJcbiAgICAgICAgICAgIGlmKGNhbmRpZGF0ZXMubGVuZ3RoID09IDApIHJldHVybiByZW1vdmVkO1xyXG5cclxuICAgICAgICAgICAgY2FuZGlkYXRlcy5zb3J0KChhLGIpPT4gYS5lZmYgLSBiLmVmZik7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGluZGV4ID0gdGhpcy5wdXJnYXRvcnkuZmluZEluZGV4KGUgPT4gZS5rZXkgPT0gbG9jYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNhbmRpZGF0ZSA9IHRoaXMucHVyZ2F0b3J5LnNwbGljZShwaW5kZXgsIDEpWzBdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kZWVwU3RvcmVkKys7XHJcbiAgICAgICAgICAgIGlmKHN1cGVyLmFkZChjYW5kaWRhdGUua2V5LCBjYW5kaWRhdGUub2JqKSkgdGhyb3cgXCJmYXRhbCBsb2dpYyBlcnJvciBpbiBhcmN0YWJsZVwiO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVkO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBsZXQgcGluZGV4ID0gdGhpcy5wdXJnYXRvcnkuZmluZEluZGV4KGUgPT4gZS5rZXkgPT0gbG9jYXRpb24pO1xyXG4gICAgICAgICAgICBpZihwaW5kZXggPT0gLTEpIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wdXJnYXRvcnkuc3BsaWNlKHBpbmRleCwgMSlbMF0ub2JqO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRBbGwoKXtcclxuICAgICAgICByZXR1cm4gWy4uLnRoaXMuYXJyYXkuZmlsdGVyKGUgPT4gZSksIC4uLnRoaXMucHVyZ2F0b3J5XS5tYXAoZSA9PiBlLm9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwcm9hY2gobG9jYXRpb24gOiBudW1iZXIpIDogVHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRXaXRoaW4obG9jYXRpb24sIHRoaXMuZGlzdGFuY2UobG9jYXRpb24pKVxyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBDaG9yZG9pZDxUPntcclxuICAgIHByaXZhdGUgbG9jdXMgOiBudW1iZXI7XHJcbiAgICBwcm90ZWN0ZWQgYXJyYXkgOiB7a2V5IDogbnVtYmVyLCBvYmogOiBUfVtdO1xyXG5cclxuICAgIC8vRklYTUU6IGFtcCB1cCBwcmVjaXNpb24gdG8gNjQgYml0O1xyXG4gICAgc3RhdGljIHJlYWRvbmx5IGxvb2t1cFRhYmxlID0gWy0wLjUsIC0wLjI1LCAtMC4wNTU1NTU1NTU1NTU1NTU1OCwgLTAuMDA3ODEyNSwgLTAuMDAwODAwMDAwMDAwMDAwMDIyOSwgLTAuMDAwMDY0MzAwNDExNTIyNjEwOSxcclxuICAgICAgICAtMC4wMDAwMDQyNDk5Mjk4NzYxMzIyNjM1LCAtMi4zODQxODU3OTEwMTU2MjVlLTcsIC0xLjE2MTUyODY1NjU5MDI0OTRlLTgsIC00Ljk5OTk5OTg1ODU5MDM0M2UtMTAsXHJcbiAgICAgICAgLTEuOTI3NzE5MDk1NDYyNTIxMmUtMTEsIC02LjcyOTYxNjg2Mzc2NTM4NmUtMTMsIC0yLjE0ODI4MTU1MjY0OTY3OGUtMTQsIC02LjEwNjIyNjYzNTQzODM2MWUtMTYsIDAsXHJcbiAgICAgICAgNi4xMDYyMjY2MzU0MzgzNjFlLTE2LCAyLjE0ODI4MTU1MjY0OTY3OGUtMTQsIDYuNzI5NjE2ODYzNzY1Mzg2ZS0xMywgMS45Mjc3MTkwOTU0NjI1MjEyZS0xMSxcclxuICAgICAgICA0Ljk5OTk5OTg1ODU5MDM0M2UtMTAsIDEuMTYxNTI4NjU2NTkwMjQ5NGUtOCwgMi4zODQxODU3OTEwMTU2MjVlLTcsIDAuMDAwMDA0MjQ5OTI5ODc2MTMyMjYzNSxcclxuICAgICAgICAwLjAwMDA2NDMwMDQxMTUyMjYxMDksIDAuMDAwODAwMDAwMDAwMDAwMDIyOSwgMC4wMDc4MTI1LCAwLjA1NTU1NTU1NTU1NTU1NTU4LCAwLjI1LCAwLjVdO1xyXG4gICAgc3RhdGljIHJlYWRvbmx5IGxvY3VzSURYID0gMTQ7IC8vIHBvc2l0aW9uIG9mIHRoZSBsb2N1c1xyXG4gICAgc3RhdGljIGFjY2VwdGFibGVFcnJvciA9IDFlLTE2O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbnRlciA6IG51bWJlciwgY2lyY3VtZmVyZW5jZSA6IG51bWJlciA9IDEpe1xyXG4gICAgICAgIHRoaXMubG9jdXMgPSBjZW50ZXI7XHJcbiAgICAgICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheShDaG9yZG9pZC5sb29rdXBUYWJsZS5sZW5ndGgtMSkuZmlsbChudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0Rlc2lyYWJsZShsb2NhdGlvbjogbnVtYmVyKXsgLy90b2RvOiByZWZhY3RvciB0aGlzIGludG8gXCJhZGRcIlxyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGlmKHRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWZmaWNpZW5jeSh0aGlzLmFycmF5W2lkeF0ua2V5LCBpZHgpID4gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZChsb2NhdGlvbjogbnVtYmVyLCBvYmogOiBUKSA6IFQgfCBudWxse1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGlmKHRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWZmaWNpZW5jeSh0aGlzLmFycmF5W2lkeF0ua2V5LCBpZHgpID4gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpKXtcclxuICAgICAgICAgICAgICAgIC8vZWZmaWNpZW5jeSBpcyB3b3JzZSB0aGFuIGluY29taW5nXHJcbiAgICAgICAgICAgICAgICBsZXQgb2xkID0gdGhpcy5hcnJheVtpZHhdLm9iajtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXJyYXlbaWR4XSA9IHtrZXk6IGxvY2F0aW9uLCBvYmo6IG9ian07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9yZWplY3QgdGhlIG9iamVjdDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXRyaWV2ZSBjbG9zZXN0IGF2YWlsYWJsZSBvYmplY3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsb2NhdGlvblxyXG4gICAgICogQHJldHVybnMge1QgfCBudWxsfVxyXG4gICAgICovXHJcbiAgICBnZXQobG9jYXRpb246IG51bWJlcikgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuYXJyYXlbdGhpcy5sdG9pKGxvY2F0aW9uLCB0cnVlKV07XHJcbiAgICAgICAgcmV0dXJuIChpdGVtIHx8IG51bGwpICYmIGl0ZW0ub2JqO1xyXG4gICAgfVxyXG4gICAgZ2V0V2l0aGluKGxvY2F0aW9uOiBudW1iZXIsIHRvbGVyYW5jZTogbnVtYmVyKSA6IFQgfCBudWxsIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuYXJyYXlbdGhpcy5sdG9pKGxvY2F0aW9uLCB0cnVlKV07XHJcbiAgICAgICAgcmV0dXJuIChpdGVtICYmIENob3Jkb2lkLmRpc3RhbmNlKGl0ZW0ua2V5ICwgbG9jYXRpb24pIDwgdG9sZXJhbmNlKVxyXG4gICAgICAgICAgICA/IGl0ZW0ub2JqXHJcbiAgICAgICAgICAgIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUobG9jYXRpb246IG51bWJlcikgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBsZXQgb2xkID0gdGhpcy5hcnJheVtpZHhdO1xyXG4gICAgICAgIGlmKCFvbGQgfHwgTWF0aC5hYnMob2xkLmtleSAtIGxvY2F0aW9uKSA+IENob3Jkb2lkLmFjY2VwdGFibGVFcnJvcil7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSBudWxsO1xyXG4gICAgICAgIHJldHVybiBvbGQub2JqO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzdGF0aWMgZGVyZWZlcmVuY2UgKGlkeDogRXhwb25lbnQsIGxvY3VzOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4LnZhbHVlT2YoKV0gKyBsb2N1cyArIDEgKSAlIDE7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRlcmVsYXRpdml6ZShsb2NhdGlvbiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgY29uc29sZS5hc3NlcnQobG9jYXRpb24+PTAgJiYgbG9jYXRpb24gPD0gMSwgXCJsb2NhdGlvbjogXCIrbG9jYXRpb24pO1xyXG4gICAgICAgIHJldHVybiAoKDEgKyBsb2NhdGlvbiAtIHRoaXMubG9jdXMgKyAwLjUpICUgMSkgLSAwLjU7XHJcbiAgICAgICAgLy9leHBlY3QgaW4gcmFuZ2UgLTAuNSwgMC41XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHJlcmVsYXRpdml6ZShsb2NhdGlvbiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIChsb2NhdGlvbiArIHRoaXMubG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkaXN0YW5jZShhIDogbnVtYmVyLCBiIDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiKSxcclxuICAgICAgICAgICAgTWF0aC5hYnMoYSAtIGIgKyAxKSxcclxuICAgICAgICAgICAgTWF0aC5hYnMoYiAtIGEgKyAxKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBkaXN0YW5jZShhOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiBDaG9yZG9pZC5kaXN0YW5jZSh0aGlzLmxvY3VzLCBhKTtcclxuICAgIH1cclxuXHJcbiAgICBlZmZpY2llbmN5KGxvY2F0aW9uIDogbnVtYmVyLCBpZHggOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG4gICAgICAgIHJldHVybiBDaG9yZG9pZC5kaXN0YW5jZShDaG9yZG9pZC5sb29rdXBUYWJsZVtpZHhdLCBkZXJlbGF0aXZpemVkKTtcclxuICAgIH1cclxuXHJcbiAgICBsdG9pKGxvY2F0aW9uIDogbnVtYmVyLCBza2lwRW1wdHkgOiBib29sZWFuID0gZmFsc2UpIDogbnVtYmVyeyAvL2xvY2F0aW9uIHRvIGluZGV4XHJcbiAgICAgICAgbGV0IGRlcmVsYXRpdml6ZWQgPSB0aGlzLmRlcmVsYXRpdml6ZShsb2NhdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBlZmZpY2llbmN5ID0gMTtcclxuICAgICAgICBsZXQgdmVyaWRleCA9IG51bGw7XHJcbiAgICAgICAgaWYoZGVyZWxhdGl2aXplZCA8IDApe1xyXG4gICAgICAgICAgICAvL3N0YXJ0IHdpdGggMFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gMDtcclxuICAgICAgICAgICAgd2hpbGUoZWZmaWNpZW5jeSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICBpZihza2lwRW1wdHkgJiYgIXRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5ID0gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpO1xyXG4gICAgICAgICAgICAgICAgdmVyaWRleCA9IGlkeCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJpZGV4O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHN0YXJ0IHdpdGggbWF4XHJcbiAgICAgICAgICAgIGxldCBpZHggPSBDaG9yZG9pZC5sb29rdXBUYWJsZS5sZW5ndGgtMTtcclxuICAgICAgICAgICAgd2hpbGUoZWZmaWNpZW5jeSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICBpZihza2lwRW1wdHkgJiYgIXRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4LS07XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5ID0gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpO1xyXG4gICAgICAgICAgICAgICAgdmVyaWRleCA9IGlkeC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJpZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBhIHNvcnRlZCBsaXN0IG9mIHN1Z2dlc3Rpb25zLCBvbiB3aGljaCBhZGRyZXNzZWVzIGFyZSBtb3N0IGRlc2lyYWJsZSwgd2l0aCB3aGljaCB0b2xlcmFuY2VzLlxyXG4gICAgICogQHJldHVybnMge3tsb2NhdGlvbjogbnVtYmVyLCBlZmZpY2llbmN5OiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXX0gc29ydGVkLCBiaWdnZXN0IHRvIHNtYWxsZXN0IGdhcC5cclxuICAgICAqL1xyXG4gICAgZ2V0U3VnZ2VzdGlvbnMoKSA6IHtsb2NhdGlvbiA6IG51bWJlciwgZWZmaWNpZW5jeSA6IG51bWJlciwgZXhwb25lbnQ6IEV4cG9uZW50fVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXkubWFwKChpdGVtLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGV4cG9uZW50OiBuZXcgRXhwb25lbnQoaWR4KSxcclxuICAgICAgICAgICAgICAgIGVmZmljaWVuY3k6IChpdGVtKT8gdGhpcy5lZmZpY2llbmN5KGl0ZW0ua2V5LCBpZHgpIDogTWF0aC5hYnMoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XS8yKSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLnJlcmVsYXRpdml6ZShDaG9yZG9pZC5sb29rdXBUYWJsZVtpZHhdKSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnNvcnQoKGEsYik9PmIuZWZmaWNpZW5jeSAtIGEuZWZmaWNpZW5jeSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWxsKCkgOiBUW117XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXkuZmlsdGVyKGUgPT4gZSkubWFwKGUgPT4gZS5vYmopO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEV4cG9uZW50IGV4dGVuZHMgTnVtYmVye1xyXG4gICAgY29uc3RydWN0b3IoZXhwb25lbnQgOiBudW1iZXIpe1xyXG4gICAgICAgIGlmKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhleHBvbmVudCkgIT0gZXhwb25lbnQgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPCAwICB8fFxyXG4gICAgICAgICAgICBleHBvbmVudCA+PSBDaG9yZG9pZC5sb29rdXBUYWJsZS5sZW5ndGhcclxuICAgICAgICApIHRocm93IFwiaW52YWxpZCBleHBvbmVudFwiO1xyXG4gICAgICAgIHN1cGVyKGV4cG9uZW50KTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjbGFzcyBUZXN0e1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHRlc3RzIDogKCgpPT5Qcm9taXNlPGJvb2xlYW4+KVtdID0gW107XHJcbiAgICBwcml2YXRlIGl0ZW0gOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGl0ZW1cclxuICAgIHByaXZhdGUgcGFzc2VkIDogbnVtYmVyID0gMDtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUgOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBwYXNzKCkgOiBib29sZWFue1xyXG4gICAgICAgIHRoaXMucGFzc2VkKys7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGZhaWwoc3RyOiBzdHJpbmcsIG9iamVjdHM6IGFueVtdKSA6IGJvb2xlYW57XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJGQUlMRUQgKFwiKygrK3RoaXMuaXRlbSkrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpXCIsXHJcbiAgICAgICAgICAgIHN0ciwgb2JqZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydChuYW1lIDogc3RyaW5nLCBhIDogYW55LCBiIDogYW55LCBjb21wYXJhdG9yIDogKGEsIGIpPT5ib29sZWFuID0gKGEsYik9PmE9PT1iKXtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2goYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgaWYoY29tcGFyYXRvcihhd2FpdCBhLCBhd2FpdCBiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKFwiYXNzZXJ0OiBcIiArIG5hbWUsIFthd2FpdCBhLCBhd2FpdCBiXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIHRoaXMuaXRlbSA9IDA7XHJcbiAgICAgICAgdGhpcy5wYXNzZWQgPSAwO1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRoaXMudGVzdHMubWFwKGUgPT4gZSgpKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coKCh0aGlzLnBhc3NlZCA9PSB0aGlzLnRlc3RzLmxlbmd0aCk/IFwiUGFzc2VkIFwiIDogXCJGQUlMRUQhIChcIikrdGhpcy5wYXNzZWQrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpLiBpbiBcIit0aGlzLm5hbWUrXCIuXCIpO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIEVzc2VudGlhbGx5IGRlZmVycmVkLCBidXQgaXQncyBhbHNvIGEgcHJvbWlzZS5cclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0phdmFTY3JpcHRfY29kZV9tb2R1bGVzL1Byb21pc2UuanNtL0RlZmVycmVkI2JhY2t3YXJkc19mb3J3YXJkc19jb21wYXRpYmxlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRnV0dXJlPFQ+IGV4dGVuZHMgUHJvbWlzZTxUPntcclxuICAgIHJlYWRvbmx5IHJlc29sdmUgOiAodmFsdWUgOiBQcm9taXNlTGlrZTxUPiB8IFQpID0+IHZvaWQ7XHJcbiAgICByZWFkb25seSByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZDtcclxuICAgIHByb3RlY3RlZCBzdGF0ZSA6IDAgfCAxIHwgMjsgLy9wZW5kaW5nLCByZXNvbHZlZCwgcmVqZWN0ZWQ7XHJcbiAgICBwcml2YXRlIHN0YXRlRXh0cmFjdG9yO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGV4ZWN1dG9yID86IChcclxuICAgICAgICByZXNvbHZlIDogKHZhbHVlIDogUHJvbWlzZUxpa2U8VD4gfCBUKSA9PiB2b2lkLFxyXG4gICAgICAgIHJlamVjdCA6IChyZWFzb24gPzogYW55KSA9PiB2b2lkKT0+dm9pZFxyXG4gICAgKXtcclxuICAgICAgICBsZXQgcmVzb2x2ZXIsIHJlamVjdG9yO1xyXG4gICAgICAgIGxldCBzdGF0ZSA6IDAgfCAxIHwgMiA9IDA7XHJcbiAgICAgICAgc3VwZXIoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlciA9IChyZXNvbHV0aW9uIDogVCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNvbHV0aW9uKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVqZWN0b3IgPSAocmVqZWN0aW9uIDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IDI7XHJcbiAgICAgICAgICAgICAgICByZWplY3QocmVqZWN0aW9uKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnN0YXRlRXh0cmFjdG9yID0gKCkgPT4geyAvLyB0aGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNlbGYgY2Fubm90IGJlIHNldCBpbiBzdXBlcjtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmVyO1xyXG4gICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0b3I7XHJcblxyXG4gICAgICAgIGV4ZWN1dG9yICYmIG5ldyBQcm9taXNlPFQ+KGV4ZWN1dG9yKS50aGVuKHJlc29sdmVyKS5jYXRjaChyZWplY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3RhdGUoKSA6IFwicGVuZGluZ1wiIHwgXCJyZXNvbHZlZFwiIHwgXCJyZWplY3RlZFwiIHwgXCJlcnJvclwiIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuc3RhdGVFeHRyYWN0b3IoKSA9PSAwKT8gXCJwZW5kaW5nXCJcclxuICAgICAgICAgICAgOiAodGhpcy5zdGF0ZUV4dHJhY3RvcigpID09IDEpID8gXCJyZXNvbHZlZFwiXHJcbiAgICAgICAgICAgIDogKHRoaXMuc3RhdGVFeHRyYWN0b3IoKSA9PSAyKSA/IFwicmVqZWN0ZWRcIlxyXG4gICAgICAgICAgICA6IFwiZXJyb3JcIjtcclxuICAgIH1cclxuXHJcbn0iLCIvL3RvZG86IGluY2x1ZGUgcG9seWZpbGxzIGZvciBFZGdlXHJcbmV4cG9ydCBjb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG5leHBvcnQgY29uc3QgdXRmOERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuXHJcbiIsImltcG9ydCB7QW5zd2VyLCBEYXRhTGluaywgT2ZmZXJ9IGZyb20gXCIuLi9kYXRhbGluay9EYXRhTGlua1wiO1xyXG5pbXBvcnQge3RyYW5zbWlzc2lvbmNvbnRyb2xjfSBmcm9tIFwiLi9jb25maWdcIjtcclxuaW1wb3J0IHtGdXR1cmV9IGZyb20gXCIuLi90b29scy9GdXR1cmVcIjtcclxuaW1wb3J0IHtOZXR3b3JrQWRkcmVzc30gZnJvbSBcIi4uL25ldHdvcmsvTmV0d29ya0FkZHJlc3NcIjtcclxuXHJcbmVudW0gVHJhbnNtaXNzaW9uQ29udHJvbEVycm9ye1xyXG4gICAgQ29ubmVjdGlvbkNsb3NlZCA9IDEwMCxcclxuICAgIFJlbW90ZUVycm9yID0gMjAwLFxyXG4gICAgUHJvdG9jb2xFcnJvciA9IDMwMFxyXG59XHJcblxyXG4vKipcclxuICogY3B0IDBcclxuICogZm9yd2FyZCAgY3B0PTFcclxuICogYmFja3dhcmQgY3ByPTJcclxuICpcclxuICogY3B0IDFcclxuICogcmVmZXJlbmNlXHJcbiAqIDBcclxuICpcclxuICogY3B0IDJcclxuICogcmVmZXJlbmNlIGlmIGNwdCAxID09IDBcclxuICogZGF0YS4uLlxyXG4gKlxyXG4gKiBjcHQgMy4uLlxyXG4gKiBkYXRhLi4uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHJhbnNtaXNzaW9uQ29udHJvbCBleHRlbmRzIERhdGFMaW5re1xyXG4gICAgYWRkcmVzczogTmV0d29ya0FkZHJlc3M7XHJcbiAgICByZWxheVRhYmxlOiBGdXR1cmU8c3RyaW5nPltdID0gbmV3IEFycmF5KHRyYW5zbWlzc2lvbmNvbnRyb2xjLm1heE1lc3NhZ2VCdWZmZXIrMSkuZmlsbChudWxsKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihvbm1lc3NhZ2UgOiAobXNnIDogc3RyaW5nKT0+UHJvbWlzZTxzdHJpbmc+IHwgc3RyaW5nKXtcclxuICAgICAgICBzdXBlcigobXNnKT0+Y29uc29sZS5sb2cobXNnKSk7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5kYXRhY2hhbm5lbC5vbm1lc3NhZ2UgPSBhc3luYyAobXNnRSk9PntcclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChtc2dFLmRhdGEuY29kZVBvaW50QXQoMCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWR4ID0gbXNnRS5kYXRhLmNvZGVQb2ludEF0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZighaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZHggPSBtc2dFLmRhdGEuY29kZVBvaW50QXQoMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF5VGFibGVbaWR4LTFdLnJlamVjdChbVHJhbnNtaXNzaW9uQ29udHJvbEVycm9yLlJlbW90ZUVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLm1zZ0UuZGF0YS5zbGljZSgzKS5zcGxpdCgnJykubWFwKGMgPT4gYy5jb2RlUG9pbnRBdCgwKSldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXlUYWJsZVtpZHgtMV0ucmVzb2x2ZShtc2dFLmRhdGEuc2xpY2UoMikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpZHggPSBtc2dFLmRhdGEuY29kZVBvaW50QXQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVwbHkoU3RyaW5nLmZyb21Db2RlUG9pbnQoMiwgaWR4KSArIGF3YWl0IG9ubWVzc2FnZShtc2dFLmRhdGEuc2xpY2UoMikpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWNhdGNoIChlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVwbHkoU3RyaW5nLmZyb21Db2RlUG9pbnQoMiwwLGlkeCwuLi5lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmFkIGFjdG9yXCIpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVwbHkobXNnIDogc3RyaW5nKXtcclxuICAgICAgICBzdXBlci5zZW5kKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKXtcclxuICAgICAgICByZXR1cm4gXCJUQ086XCIrIGF3YWl0IHN1cGVyLm9mZmVyKCk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBUQ09mZmVyKXtcclxuICAgICAgICBpZiAob2ZmZXIuc2xpY2UoMCw0KSAhPT0gXCJUQ086XCIpIHRocm93IFtUcmFuc21pc3Npb25Db250cm9sRXJyb3IuUHJvdG9jb2xFcnJvcl07XHJcbiAgICAgICAgcmV0dXJuIFwiVENBOlwiKyBhd2FpdCBzdXBlci5hbnN3ZXIob2ZmZXIuc2xpY2UoNCkpO1xyXG4gICAgfVxyXG4gICAgY29tcGxldGUoYW5zd2VyOiBUQ0Fuc3dlcil7XHJcbiAgICAgICAgaWYgKGFuc3dlci5zbGljZSgwLDQpICE9PSBcIlRDQTpcIikgdGhyb3cgW1RyYW5zbWlzc2lvbkNvbnRyb2xFcnJvci5Qcm90b2NvbEVycm9yXTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuY29tcGxldGUoYW5zd2VyLnNsaWNlKDQpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcpIDogUHJvbWlzZTxzdHJpbmc+e1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLnJlbGF5VGFibGUuZmluZEluZGV4KGUgPT4gIWUpKzE7XHJcbiAgICAgICAgdGhpcy5yZWxheVRhYmxlW2lkeC0xXSA9IG5ldyBGdXR1cmU8c3RyaW5nPigpO1xyXG4gICAgICAgIHN1cGVyLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoMSwgaWR4KSArIG1zZyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXlUYWJsZVtpZHgtMV07XHJcbiAgICB9XHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIHRoaXMucmVsYXlUYWJsZS5mb3JFYWNoKGUgPT4gZSAmJiBlLnJlamVjdChbVHJhbnNtaXNzaW9uQ29udHJvbEVycm9yLkNvbm5lY3Rpb25DbG9zZWRdKSk7XHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRDT2ZmZXIgZXh0ZW5kcyBPZmZlcnt9XHJcbmV4cG9ydCBjbGFzcyBUQ0Fuc3dlciBleHRlbmRzIEFuc3dlcnt9XHJcbiIsImV4cG9ydCBjb25zdCB0cmFuc21pc3Npb25jb250cm9sYyA9IHtcclxuICAgIG1heE1lc3NhZ2VCdWZmZXI6IDEwMCxcclxuICAgIHZlcnNpb246IFwiVENETC0xLjAuMFwiXHJcbn0iLCJpbXBvcnQge1Rlc3R9IGZyb20gXCIuL21vZHVsZXMvdGVzdC9UZXN0XCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgVmVyRG9jfSBmcm9tIFwiLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7RGF0YUxpbmt9IGZyb20gXCIuL21vZHVsZXMvZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHtUcmFuc21pc3Npb25Db250cm9sfSBmcm9tIFwiLi9tb2R1bGVzL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbFwiO1xyXG5pbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvYXJjdGFibGUvQ2hvcmRpb2lkXCI7XHJcbmltcG9ydCB7QXJjdGFibGV9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9hcmN0YWJsZS9BcmN0YWJsZVwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya0FkZHJlc3NcIjtcclxuaW1wb3J0IHtOZXR3b3JrfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya1wiO1xyXG5pbXBvcnQge05SZXNwb25zZX0gZnJvbSBcIi4vbW9kdWxlcy9uZXR3b3JrL05SZXNwb25zZVwiO1xyXG5pbXBvcnQge05ldExpbmt9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9OZXRMaW5rXCI7XHJcbmltcG9ydCB7TlJlcXVlc3R9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9OUmVxdWVzdFwiO1xyXG5cclxuUHJvbWlzZS5hbGwoW1xyXG4gICAgKGFzeW5jICgpPT57bGV0IGNyID0gbmV3IFRlc3QoXCJDcnlwdG9cIik7XHJcblxyXG4gICAgICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICAgICAgbGV0IHByayA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgbGV0IHZlcmRvYyA9IGF3YWl0IHByay5zaWduKHRvKTtcclxuICAgICAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2MpO1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJ2ZXJkb2Mga2V5IGNvbXBhcmlzb25cIiwgdmVyZG9jLmtleS5oYXNoZWQoKSwgcmVjb25zdHJ1Y3RlZC5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIGNyLmFzc2VydChcInZlcmRvYyBkYXRhIGNvbXBhcmlzb25cIiwgSlNPTi5zdHJpbmdpZnkodmVyZG9jLmRhdGEpLCBKU09OLnN0cmluZ2lmeShyZWNvbnN0cnVjdGVkLmRhdGEpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gY3J5cHRvIHRlc3RcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIkRhdGFMaW5rXCIpO1xyXG5cclxuICAgICAgICBsZXQgdHJhbnNtaXR0ZWQgPSBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgbGV0IGEgPSBuZXcgRGF0YUxpbmsobSA9PiByZXNvbHZlKG0uZGF0YSkpO1xyXG4gICAgICAgICAgICBsZXQgYiA9IG5ldyBEYXRhTGluayhtID0+IGIuc2VuZChcImIgcmVzcG9uZHMgdG8gXCIrbS5kYXRhKSk7XHJcblxyXG4gICAgICAgICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgIGEuc2VuZChcImEgc2F5cyBiZWVwXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNyLmFzc2VydChcInNpbXBsZSBkYXRhIGJvdW5jZVwiLCB0cmFuc21pdHRlZCwgXCJiIHJlc3BvbmRzIHRvIGEgc2F5cyBiZWVwXCIpO1xyXG5cclxuICAgICAgICAvLy8vIHRlc3QgbWVtb3J5IHVzYWdlIC0gaXQncyBzdGF0aWMuXHJcbiAgICAgICAgLy8gZm9yKGxldCBpID0gMDsgaTwxMDAwOyBpKyspe1xyXG4gICAgICAgIC8vICAgICBsZXQgYSA9IG5ldyBEYXRhTGluayhtID0+IGNvbnNvbGUubG9nKTtcclxuICAgICAgICAvLyAgICAgbGV0IGIgPSBuZXcgRGF0YUxpbmsobSA9PiBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgLy8gICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcbiAgICAgICAgLy8gICAgIGF3YWl0IGEucmVhZHk7XHJcbiAgICAgICAgLy8gICAgIGEuY2xvc2UoKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIERhdGEgTGlua1xyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiVHJhbnNtaXNzaW9uIENvbnRyb2xcIik7XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2wobSA9PiBcImEgcmVmbGVjdHM6IFwiK20pO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcImIgcmV0dXJuczogXCIgKyBhd2FpdCBiLnNlbmQoXCJiIHJlZmxlY3RzOiBcIittKSk7XHJcblxyXG4gICAgICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcblxyXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGEuc2VuZChcImFhYVwiKTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwiZHVhbCB0Y3AgYm91bmNlXCIsIHJlc3BvbnNlLCBcImIgcmV0dXJuczogYSByZWZsZWN0czogYiByZWZsZWN0czogYWFhXCIpO1xyXG5cclxuICAgICAgICBsZXQgYyA9IG5ldyBUcmFuc21pc3Npb25Db250cm9sKG0gPT4gUHJvbWlzZS5yZWplY3QoWzQwLDUwLDYwXSkpO1xyXG4gICAgICAgIGxldCBkID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcIm5vdGhpbmdcIik7XHJcblxyXG4gICAgICAgIGMuY29tcGxldGUoYXdhaXQgZC5hbnN3ZXIoYXdhaXQgYy5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGQucmVhZHk7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcInJlbW90ZSBoYW5kbGluZyBwcm9wYWdhdGlvblwiLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShhd2FpdCBkLnNlbmQoXCJib29wXCIpLmNhdGNoKGUgPT4gZSkpLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShbMjAwLCA0MCwgNTAsIDYwXSkpO1xyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBUcmFuc21pc3Npb24gQ29udHJvbFxyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjdCA9IG5ldyBUZXN0KFwiQXJjdGFibGVcIik7XHJcblxyXG4gICAgICAgIGxldCBtYXhTaXplID0gMzA7XHJcblxyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMC45LCAwLjEpLCAwLjIsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBBcmN0YWJsZS5kaXN0YW5jZSgwLjEsIDAuMSksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIEFyY3RhYmxlLmRpc3RhbmNlKDAuNCwgMC41KSwgMC4xLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMCwgMSksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIEFyY3RhYmxlLmRpc3RhbmNlKDAuMSwgMC45KSwgMC4yLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMSwgMCksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuXHJcbiAgICAgICAgbGV0IHRpID0gbmV3IEFyY3RhYmxlKDAuNSk7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDApLCAwKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMSksIDApO1xyXG4gICAgICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwLjQ5OTk5KSwgNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDAuNSksIDE0KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMC41MDAwMSksIDIyKTtcclxuXHJcbiAgICAgICAgbGV0IHRpMiA9IG5ldyBBcmN0YWJsZSgwLjc1KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyIDJcIiwgdGkyLmx0b2koMC4yNSksIDApO1xyXG4gICAgICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc0OTk5KSwgNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuNzUpLCAxNCk7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuNzUwMDEpLCAyMik7XHJcblxyXG4gICAgICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAwXCIsIHRpMi5nZXQodG8uYSksIG51bGwpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImFkZCAxXCIsIHRpMi5hZGQodG8uYSwgdG8pLCBudWxsKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQodG8uYSksIHRvKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQoMC45KSwgdG8pO1xyXG4gICAgICAgIGN0LmFzc2VydChcImZldGNoIDFcIiwgdGkyLmdldCgwLjc0KSwgdG8pO1xyXG5cclxuICAgICAgICBsZXQgdG8yID0ge2E6IDAuMTEwOSwgYjogMjM0NTEyfTsgLy9oaWdoZXIgZWZmaWNpZW5jeSBzYW1lIGluZGV4XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiYWRkIDIgKGF0dGVtcHQgb3ZlcndyaXRlKVwiLCB0aTIuYWRkKHRvMi5hLCB0bzIpLCBudWxsKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAyXCIsIHRpMi5nZXQodG8uYSksIHRvMik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiZmV0Y2ggMi4yXCIsIHRpMi5nZXQodG8yLmEpLCB0bzIpO1xyXG5cclxuICAgICAgICBjdC5hc3NlcnQoXCJzdWdnZXN0aW9uIG9yZGVyXCIsIHRpMi5nZXRTdWdnZXN0aW9ucygpWzBdLmVmZmljaWVuY3ksIHRpMi5nZXRTdWdnZXN0aW9ucygpWzFdLmVmZmljaWVuY3ksIChhLCBiKSA9PiBhID4gYik7XHJcblxyXG4gICAgICAgIGN0LmFzc2VydChcInJlbSAxIGFyY2VkXCIsIHRpMi5yZW1vdmUodG8uYSksIHRvKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJyZW0gMVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgdG8yKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJyZW0gMSBlbXB0eVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgbnVsbCk7XHJcblxyXG4gICAgICAgIGxldCB0aTMgPSBuZXcgQXJjdGFibGUoMC41LCBtYXhTaXplKTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpPG1heFNpemU7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0ge2E6IE1hdGgucmFuZG9tKCksIGI6IE1hdGgucmFuZG9tKCl9O1xyXG4gICAgICAgICAgICBjdC5hc3NlcnQoXCJiYXR0ZXJ5IGl0ZW0gXCIraStcIjpcIiwgISF0aTMuYWRkKGl0ZW0uYSwgaXRlbSksIGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXRlbSA9IHthOiBNYXRoLnJhbmRvbSgpLCBiOiBNYXRoLnJhbmRvbSgpfTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJjb21wbGV0ZWx5IGZ1bGwgZWplY3RlZCBzb21ldGhpbmc6XCIsICEhdGkzLmFkZChpdGVtLmEsIGl0ZW0pLCB0cnVlKTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBjdC5ydW4oKTtcclxuICAgIH0pKCksIC8vIGNob3JkaW9pZFxyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiTmV0d29ya1wiKTtcclxuICAgICAgICAod2luZG93IGFzIGFueSkuTmV0d29yayA9IE5ldHdvcms7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLk5ldHdvcmtBZGRyZXNzID0gTmV0d29ya0FkZHJlc3M7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLk5SZXNwb25zZSA9IE5SZXNwb25zZTtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBuZXcgTmV0d29yaygobXNnKT0+IG5ldyBOUmVzcG9uc2UoXCJhIHJlcGxpZXMgdG8gXCIrbXNnLm9yaWdpbmFsLCBudWxsKSk7XHJcbiAgICAgICAgbGV0IGIgPSBuZXcgTmV0d29yaygobXNnKT0+IG5ldyBOUmVzcG9uc2UoXCJiIHJlcGxpZXMgdG8gXCIrbXNnLm9yaWdpbmFsLCBudWxsKSk7XHJcbiAgICAgICAgbGV0IGMgPSBuZXcgTmV0d29yaygobXNnKT0+IG5ldyBOUmVzcG9uc2UoXCJjIHJlcGxpZXMgdG8gXCIrbXNnLm9yaWdpbmFsLCBudWxsKSk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICBjci5hc3NlcnQoXCJuZXR3b3JrIGlzIGVtcHR5XCIsIEpTT04uc3RyaW5naWZ5KGF3YWl0IGEuYnJvYWRjYXN0KFwiQSBicm9hZGNhc3RzXCIpLmNhdGNoKGUgPT4gZSkpLCBKU09OLnN0cmluZ2lmeShbMTAwMV0pKTtcclxuXHJcbiAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYS5jb21wbGV0ZShhd2FpdCBiLmFuc3dlcihhd2FpdCBhLm9mZmVyKCkpKTtcclxuICAgICAgICBiLmNvbXBsZXRlKGF3YWl0IGMuYW5zd2VyKGF3YWl0IGIub2ZmZXIoKSkpO1xyXG4gICAgICAgIGMuY29tcGxldGUoYXdhaXQgYS5hbnN3ZXIoYXdhaXQgYy5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGEgPT4gc2V0VGltZW91dCgoKT0+YSgpLCAxMDAwKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuICAgICAgICBhd2FpdCBjLnJlYWR5O1xyXG5cclxuXHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcIm5ldHdvcmsgaXMgZW1wdHlcIiwgKGF3YWl0IGEuYnJvYWRjYXN0KFwiQSBicm9hZGNhc3RzXCIpKS5sZW5ndGgsIDIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBOZXR3b3JrXHJcblxyXG5cclxuXSkudGhlbihhID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiVGVzdGluZyBjb21wbGV0ZS5cIik7XHJcbiAgICB3aW5kb3cuY2xvc2UoKVxyXG59KS5jYXRjaChlPT57XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQ1JJVElDQUwgRkFJTFVSRSEgVW5jYXVnaHQgRXhjZXB0aW9uOiBcIixlKTtcclxuICAgIHdpbmRvdy5jbG9zZSgpXHJcbn0pO1xyXG5cclxuXHJcblxyXG4iXSwic291cmNlUm9vdCI6IiJ9