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
const NetworkInternal_1 = __webpack_require__(/*! ./NetworkInternal */ "./modules/network/NetworkInternal.ts");
const NRequest_1 = __webpack_require__(/*! ./NRequest */ "./modules/network/NRequest.ts");
const NResponse_1 = __webpack_require__(/*! ./NResponse */ "./modules/network/NResponse.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const config_1 = __webpack_require__(/*! ./config */ "./modules/network/config.ts");
const Fasthash_1 = __webpack_require__(/*! ../crypto/Fasthash */ "./modules/crypto/Fasthash.ts");
var NetworkError;
(function (NetworkError) {
    NetworkError[NetworkError["NoSuchChannel"] = 2001] = "NoSuchChannel";
    NetworkError[NetworkError["RemoteApplicationError"] = 2002] = "RemoteApplicationError";
    NetworkError[NetworkError["BroadcastFromFuture"] = 2101] = "BroadcastFromFuture";
})(NetworkError = exports.NetworkError || (exports.NetworkError = {}));
class Network extends NetworkInternal_1.NetworkInternal {
    constructor(key) {
        super(null, key || new PrivateKey_1.PrivateKey());
        this.broadcastBuffer = [];
        this.ports = [];
        this.timeOffset = 0;
        this.onmessage = this.reflect;
    }
    /**
     * @param {(arg: A, req?: NRequest) => Promise<B>} onmessage
     * @returns {(arg: A) => (Promise<B> | Promise<B>[])}
     */
    addport(onmessage) {
        let self = this;
        let port = this.ports.length;
        this.ports.push((msg, req) => __awaiter(this, void 0, void 0, function* () {
            return yield onmessage(msg, req);
        }));
        return (arg, target) => __awaiter(this, void 0, void 0, function* () {
            let payload = port.toString(10) + '|' + JSON.stringify(arg);
            if (target) {
                return self.relay(new NRequest_1.NRequest(target, payload)).then(r => JSON.parse(r.original));
            }
            //no target, will broadcast
            return (yield self.broadcast(payload)).map(p => p.then(e => JSON.parse(e.original)));
        });
    }
    /**
     * @param {(msg: A) => boolean} onmessage operation. boolean response determines whether to rebroadcast the message
     * @param {number} port
     * @returns {(msg: A) => void}
     */
    addBroadcastKernel(onmessage, port) {
        let self = this;
        let channel;
        let responder = (msg) => __awaiter(this, void 0, void 0, function* () {
            let vbcc = yield PrivateKey_1.VerDoc.reconstruct(msg);
            let hash = Fasthash_1.Fasthash.string(vbcc.signature);
            if (vbcc.data.time > new Date().getTime() + self.timeOffset + config_1.networkc.maxBroadcastTolerance) // network sent from the future
                throw [NetworkError.BroadcastFromFuture];
            if (!self.broadcastBuffer[config_1.networkc.maxBroadcastBuffer] || // buffer isn't full yet, or
                (self.broadcastBuffer[config_1.networkc.maxBroadcastBuffer].time < vbcc.data.time //not too old and
                    && self.broadcastBuffer.findIndex(e => e.hash == hash) == -1) //not already in buffer
            ) {
                if (yield onmessage(vbcc.data.data)) {
                    self.broadcastBuffer.unshift({ time: vbcc.data.time, hash: hash });
                    if (self.broadcastBuffer.length > config_1.networkc.maxBroadcastBuffer)
                        self.broadcastBuffer.pop();
                    channel(msg);
                    return true;
                }
            }
            return false;
        });
        channel = this.addport(responder);
        return (msg) => __awaiter(this, void 0, void 0, function* () {
            let frame = {
                data: msg,
                time: new Date().getTime() + self.timeOffset,
            };
            return channel(yield self.key.sign(frame));
        });
    }
    reflect(msg) {
        let splitr = msg.original.indexOf('|');
        let port = parseInt(msg.original.slice(0, splitr));
        let meat = msg.original.slice(splitr + 1);
        if (!this.ports[port])
            throw NetworkError.NoSuchChannel;
        try {
            return new NResponse_1.NResponse(JSON.stringify(this.ports[port](JSON.parse(meat), msg)));
        }
        catch (e) {
            throw [NetworkError.RemoteApplicationError, ...e];
        }
    }
}
exports.Network = Network;


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

/***/ "./modules/network/NetworkInternal.ts":
/*!********************************************!*\
  !*** ./modules/network/NetworkInternal.ts ***!
  \********************************************/
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
var NetworkInternalError;
(function (NetworkInternalError) {
    NetworkInternalError[NetworkInternalError["NoParticipantFound"] = 1001] = "NoParticipantFound";
    NetworkInternalError[NetworkInternalError["ProtocolError"] = 1300] = "ProtocolError";
    NetworkInternalError[NetworkInternalError["HandshakeError1"] = 1301] = "HandshakeError1";
    NetworkInternalError[NetworkInternalError["HandshakeError2"] = 1302] = "HandshakeError2";
})(NetworkInternalError = exports.NetworkInternalError || (exports.NetworkInternalError = {}));
class NetworkInternal {
    constructor(onmessage, key) {
        this.pendingOffers = [];
        this.pendingAnswers = [];
        this.onmessage = onmessage;
        this.key = key;
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
                throw [NetworkInternalError.NoParticipantFound];
            return yield outlink.dispatch(request);
        });
    }
    broadcast(request) {
        if (!this.links)
            return [];
        let all = this.links.getAll();
        if (!all.length)
            return [];
        return all.map(ol => ol.dispatch(new NRequest_1.NRequest(ol.address, request)));
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
                throw [NetworkInternalError.HandshakeError1];
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
                throw [NetworkInternalError.HandshakeError2];
            }
        });
    }
}
exports.NetworkInternal = NetworkInternal;
class NOffer extends PrivateKey_1.RawDoc {
}
class NAnswer extends PrivateKey_1.RawDoc {
}


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

/***/ "./modules/network/config.ts":
/*!***********************************!*\
  !*** ./modules/network/config.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.networkc = {
    maxConnections: 20,
    maxPendingConnections: 20,
    maxBroadcastBuffer: 100,
    maxBroadcastTolerance: 2,
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
                console.log("bad actor:");
                console.error(e);
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
const NetworkInternal_1 = __webpack_require__(/*! ./modules/network/NetworkInternal */ "./modules/network/NetworkInternal.ts");
const NResponse_1 = __webpack_require__(/*! ./modules/network/NResponse */ "./modules/network/NResponse.ts");
const Network_1 = __webpack_require__(/*! ./modules/network/Network */ "./modules/network/Network.ts");
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
        let cr = new Test_1.Test("NetworkInternal");
        window.NetworkInternal = NetworkInternal_1.NetworkInternal;
        window.NetworkAddress = NetworkAddress_1.NetworkAddress;
        window.NResponse = NResponse_1.NResponse;
        let a = new NetworkInternal_1.NetworkInternal((msg) => new NResponse_1.NResponse("a replies to " + msg.original, null), new PrivateKey_1.PrivateKey());
        let b = new NetworkInternal_1.NetworkInternal((msg) => new NResponse_1.NResponse("b replies to " + msg.original, null), new PrivateKey_1.PrivateKey());
        let c = new NetworkInternal_1.NetworkInternal((msg) => new NResponse_1.NResponse("c replies to " + msg.original, null), new PrivateKey_1.PrivateKey());
        cr.assert("network is empty", JSON.stringify(a.broadcast("A broadcasts")), JSON.stringify([]));
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
    (() => __awaiter(this, void 0, void 0, function* () {
        let cr = new Test_1.Test("Network");
        window.Network = Network_1.Network;
        window.NetworkAddress = NetworkAddress_1.NetworkAddress;
        class TestNet extends Network_1.Network {
            constructor() {
                let key = new PrivateKey_1.PrivateKey();
                super(key);
                this.bcc = this.addBroadcastKernel((msg) => __awaiter(this, void 0, void 0, function* () {
                    console.log((yield key.getPublicHash()) + "says I RECEIVED THIS BROADCAST!: " + msg);
                    return true;
                }));
            }
        }
        window.TestNet = TestNet;
        let a = new TestNet();
        let b = new TestNet();
        let c = new TestNet();
        let d = new TestNet();
        a.complete(yield b.answer(yield a.offer()));
        b.complete(yield c.answer(yield b.offer()));
        c.complete(yield a.answer(yield c.offer()));
        d.complete(yield c.answer(yield d.offer()));
        yield new Promise(a => setTimeout(() => a(), 1000));
        yield a.ready;
        yield b.ready;
        yield c.ready;
        yield d.ready;
        cr.assert("successful broadcast sent", (yield d.bcc("D broadcasts")).length, 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vRmFzdGhhc2gudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2RhdGFsaW5rL0RhdGFMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvZGF0YWxpbmsvY29uZmlnLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OUmVxdWVzdC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvTlJlc3BvbnNlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXRMaW5rLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXR3b3JrLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXR3b3JrQWRkcmVzcy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya0ludGVybmFsLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9hcmN0YWJsZS9BcmN0YWJsZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvYXJjdGFibGUvQ2hvcmRpb2lkLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9jb25maWcudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90ZXN0L1Rlc3QudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy9GdXR1cmUudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy91dGY4YnVmZmVyLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdHJhbnNtaXNzaW9uY29udHJvbC9UcmFuc21pc3Npb25Db250cm9sLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdHJhbnNtaXNzaW9uY29udHJvbC9jb25maWcudHMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC50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RSxnREFBQyxnQkFBUyxLQUFDLENBQUM7UUFFdEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVkLEVBQUUsQ0FBQyxNQUFNLENBQUMsNkJBQTZCLEVBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQyxFQUFDLEVBQUU7SUFFSixDQUFDLEdBQVEsRUFBRTtRQUFDLElBQUksRUFBRSxHQUFHLElBQUksV0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN0RyxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN0RyxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN0RyxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNsRyxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN0RyxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUVsRyxJQUFJLEVBQUUsR0FBRyxJQUFJLG1CQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTNDLElBQUksR0FBRyxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTlDLElBQUksRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV4QyxJQUFJLEdBQUcsR0FBRyxFQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUMsOEJBQThCO1FBQ2hFLEVBQUUsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFB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S0FBSyxDQUFDO1FBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRWQsRUFBRSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVoRixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDLEVBQUMsRUFBRTtDQUdQLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNsQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFFO0lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi90ZXN0LnRzXCIpO1xuIiwiaW1wb3J0IHt1dGY4RW5jb2Rlcn0gZnJvbSBcIi4uL3Rvb2xzL3V0ZjhidWZmZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGYXN0aGFzaCB7XHJcbiAgICBzdGF0aWMgc3RyaW5nKGlucHV0IDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gdXRmOEVuY29kZXIuZW5jb2RlKGlucHV0KS5yZXZlcnNlKCkuc2xpY2UoMCw1MCkuXHJcbiAgICAgICAgcmV2ZXJzZSgpLlxyXG4gICAgICAgIHJlZHVjZSgoYSxlLGkpPT5hK2UqTWF0aC5wb3coMjU2LGkpLCAwKSAvXHJcbiAgICAgICAgTWF0aC5wb3coMjU2LCA1MCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge3V0ZjhEZWNvZGVyLCB1dGY4RW5jb2Rlcn0gZnJvbSBcIi4uL3Rvb2xzL3V0ZjhidWZmZXJcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUHJpdmF0ZUtleSB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZUxpa2U8YW55PjtcclxuICAgIHByaXZhdGUgcHJpdmF0ZUtleSA6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgcHVibGljS2V5IDogUHVibGljS2V5O1xyXG4gICAgcmVhZG9ubHkgdmVyc2lvbiA9IDI7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucHVibGljS2V5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgICAgICBuYW1lZEN1cnZlOiBcIlAtMzg0XCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBbXCJzaWduXCIsIFwidmVyaWZ5XCJdXHJcbiAgICAgICAgICAgICkudGhlbihrZXlzID0+IHsgLy9rZXlzOiB7cHJpdmF0ZUtleTogQ3J5cHRvS2V5LCBwdWJsaWNLZXk6IENyeXB0b0tleX1cclxuICAgICAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSA9IGtleXMucHJpdmF0ZUtleTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIFwiandrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdWJsaWNLZXlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oandrID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGljS2V5ID0gbmV3IFB1YmxpY0tleShqd2spO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVibGljS2V5LnJlYWR5O1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcbiAgICBhc3luYyBzaWduPFQ+KG9iaiA6IFQpIDogUHJvbWlzZTxWZXJEb2M8VD4+IHtcclxuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5O1xyXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcclxuICAgICAgICBsZXQgcHVrID0gdGhpcy5wdWJsaWNLZXkudG9KU09OKCk7XHJcbiAgICAgICAgbGV0IGhlYWRlciA9IFN0cmluZy5mcm9tQ29kZVBvaW50KHRoaXMudmVyc2lvbiwgcHVrLmxlbmd0aCwgZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBzaWduYWJsZSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpO1xyXG5cclxuICAgICAgICBsZXQgc2lnYnVmZmVyID0gYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuc2lnbihcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wcml2YXRlS2V5LFxyXG4gICAgICAgICAgICBzaWduYWJsZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxldCBjaGVja3NtID0gdXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSkucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG4gICAgICAgIGxldCB1ZnQgPSAgbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKTtcclxuICAgICAgICBsZXQgY2hlYzIgPSBuZXcgVWludDhBcnJheShzaWdidWZmZXIpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuXHJcbiAgICAgICAgbGV0IHZkID0gbmV3IFZlckRvYzxUPigpO1xyXG4gICAgICAgIHZkLm9yaWdpbmFsID0gaGVhZGVyK3B1aytkYXRhK1N0cmluZy5mcm9tQ29kZVBvaW50KC4uLm5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcikpO1xyXG4gICAgICAgIHZkLmtleSA9IHRoaXMucHVibGljS2V5O1xyXG4gICAgICAgIHZkLmRhdGEgPSBvYmo7XHJcbiAgICAgICAgdmQuc2lnbmF0dXJlID0gSlNPTi5zdHJpbmdpZnkobmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKSk7XHJcblxyXG4gICAgICAgIGxldCBrdSA9IHV0ZjhFbmNvZGVyLmVuY29kZSh2ZC5vcmlnaW5hbCk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICB9XHJcbiAgICBhc3luYyBnZXRQdWJsaWNIYXNoKCkgOiBQcm9taXNlPG51bWJlcj57XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBhd2FpdCB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICByZXR1cm4gdGhpcy5wdWJsaWNLZXkuaGFzaGVkKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJEb2MgREFPXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmF3RG9jPFQ+e1xyXG4gICAgb3JpZ2luYWwgOiBzdHJpbmc7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVmVyRG9jPFQ+IGV4dGVuZHMgUmF3RG9jPFQ+e1xyXG4gICAgZGF0YTogVDtcclxuICAgIGtleTogUHVibGljS2V5O1xyXG4gICAgc2lnbmF0dXJlOiBzdHJpbmc7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmVjb25zdHJ1Y3Q8VD4ocmF3RG9jIDogUmF3RG9jPFQ+KSA6IFByb21pc2U8VmVyRG9jPFQ+PntcclxuICAgICAgICBsZXQgdmVyc2lvbiA9IHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0gcmF3RG9jLm9yaWdpbmFsLnN1YnN0cmluZygwLDMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHB1ayA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMywgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDEpKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gcmF3RG9jLm9yaWdpbmFsLnN1YnN0cigzICsgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDEpLCByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMikpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNpZyA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMyArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IGF3YWl0IG5ldyBQdWJsaWNLZXkoXHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVrXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKS5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICAgICAgICAgIGxldCB1ZnQgPSAgdXRmOEVuY29kZXIuZW5jb2RlKHNpZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlYzIgPSB1dGY4RW5jb2Rlci5lbmNvZGUoc2lnKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQga2V5LnZlcmlmeSh1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKSwgbmV3IFVpbnQ4QXJyYXkoc2lnLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNvZGVQb2ludEF0KDApKSkpXHJcbiAgICAgICAgICAgICAgICApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5zaWduYXR1cmUgPSBzaWc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQua2V5ID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLm9yaWdpbmFsID0gcmF3RG9jLm9yaWdpbmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2ZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJiYWQgZG9jdW1lbnRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFByb21pc2UucmVqZWN0KFwidmVyc2lvbiB1bnN1cHBvcnRlZDogXCIrdmVyc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBoYXNoIFAtMzg0IFNQS0kgaW50byAoMCwxKSBmbG9hdFxyXG5mdW5jdGlvbiBTUEtJdG9OdW1lcmljKHNwa2k6IEFycmF5QnVmZmVyKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc3BraSkuXHJcbiAgICAgICAgc2xpY2UoLTk2KS5cclxuICAgICAgICByZXZlcnNlKCkuXHJcbiAgICAgICAgcmVkdWNlKChhLGUsaSk9PmErZSpNYXRoLnBvdygyNTYsaSksIDApIC9cclxuICAgICAgICBNYXRoLnBvdygyNTYsIDk2KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFB1YmxpY0tleSB7XHJcbiAgICBwcml2YXRlIHB1YmxpY0NyeXB0b0tleTogQ3J5cHRvS2V5O1xyXG4gICAgcHJpdmF0ZSBmbG9hdGluZzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBqd2s6IEpzb25XZWJLZXk7XHJcbiAgICByZWFkeTtcclxuICAgIGNvbnN0cnVjdG9yKGp3azogSnNvbldlYktleSl7XHJcbiAgICAgICAgbGV0IHByb3RvSldLID0ge1wiY3J2XCI6XCJQLTM4NFwiLCBcImV4dFwiOnRydWUsIFwia2V5X29wc1wiOltcInZlcmlmeVwiXSwgXCJrdHlcIjpcIkVDXCIsIFwieFwiOmp3a1tcInhcIl0sIFwieVwiOmp3a1tcInlcIl19O1xyXG4gICAgICAgIHRoaXMuZmxvYXRpbmcgPSBOYU47XHJcbiAgICAgICAgdGhpcy5qd2sgPSBwcm90b0pXSztcclxuICAgICAgICB0aGlzLnJlYWR5ID0gd2luZG93LmNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxyXG4gICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICB0aGlzLmp3ayxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICBbXCJ2ZXJpZnlcIl1cclxuICAgICAgICApLnRoZW4ocHVibGljQ3J5cHRvS2V5ID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXkgPSBwdWJsaWNDcnlwdG9LZXk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgXCJzcGtpXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0NyeXB0b0tleVxyXG4gICAgICAgICAgICApLnRoZW4oc3BraSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsb2F0aW5nID0gU1BLSXRvTnVtZXJpYyhzcGtpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KS50aGVuKCgpPT50aGlzKTtcclxuICAgIH1cclxuICAgIGhhc2hlZCgpe1xyXG4gICAgICAgIGlmKGlzTmFOKHRoaXMuZmxvYXRpbmcpKSB0aHJvdyBFcnJvcihcIk5vdCBSZWFkeS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmc7XHJcbiAgICB9XHJcbiAgICB0b0pTT04oKXtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1wieFwiOiB0aGlzLmp3a1tcInhcIl0sIFwieVwiOiB0aGlzLmp3a1tcInlcIl19KTtcclxuICAgIH1cclxuICAgIHZlcmlmeShkYXRhOiBVaW50OEFycmF5LCBzaWduYXR1cmU6IEFycmF5QnVmZmVyKTogUHJvbWlzZUxpa2U8Ym9vbGVhbj57XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLnZlcmlmeShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXksXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZnJvbVN0cmluZyhqd2tzdHJpbmc6IHN0cmluZyk6IFB1YmxpY0tleXtcclxuICAgICAgICByZXR1cm4gbmV3IFB1YmxpY0tleShKU09OLnBhcnNlKGp3a3N0cmluZykpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtkYXRhbGlua2N9IGZyb20gXCIuL2NvbmZpZ1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIERhdGFMaW5rIGV4dGVuZHMgUlRDUGVlckNvbm5lY3Rpb257XHJcbiAgICBwcm90ZWN0ZWQgZGF0YWNoYW5uZWwgOiBSVENEYXRhQ2hhbm5lbDtcclxuICAgIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZTx0aGlzPjtcclxuICAgIHJlYWRvbmx5IGNsb3NlZCA6IFByb21pc2U8dGhpcz47XHJcblxyXG4gICAgY29uc3RydWN0b3Iob25tZXNzYWdlIDogKG1zZyA6IE1lc3NhZ2VFdmVudCk9PiB2b2lkICl7XHJcbiAgICAgICAgc3VwZXIoZGF0YWxpbmtjKTtcclxuICAgICAgICB0aGlzLmRhdGFjaGFubmVsID0gKHRoaXMgYXMgYW55KVxyXG4gICAgICAgICAgICAuY3JlYXRlRGF0YUNoYW5uZWwoXCJkYXRhXCIsIHtuZWdvdGlhdGVkOiB0cnVlLCBpZDogMCwgb3JkZXJlZDogZmFsc2V9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IG5ldyBQcm9taXNlPHRoaXM+KCByZXNvbHZlID0+IHRoaXMuZGF0YWNoYW5uZWwub25vcGVuID0gKCk9PiByZXNvbHZlKCkpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VkID0gbmV3IFByb21pc2U8dGhpcz4oIHJlc29sdmUgPT4gdGhpcy5kYXRhY2hhbm5lbC5vbmNsb3NlID0gKCk9PiByZXNvbHZlKCkpO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFjaGFubmVsLm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcclxuICAgIH1cclxuXHJcbiAgICBzZW5kKG1zZyA6IHN0cmluZyB8IEJsb2IgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldykgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRhdGFjaGFubmVsLnNlbmQobXNnKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvZmZlcigpIDogUHJvbWlzZTxPZmZlcj57XHJcbiAgICAgICAgdGhpcy5zZXRMb2NhbERlc2NyaXB0aW9uKGF3YWl0IHRoaXMuY3JlYXRlT2ZmZXIoKSk7XHJcblxyXG4gICAgICAgIC8vIHByb21pc2UgdG8gd2FpdCBmb3IgdGhlIHNkcFxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxPZmZlcj4oKGFjY2VwdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uaWNlY2FuZGlkYXRlID0gZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgYWNjZXB0KHRoaXMubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBPZmZlcikgOiBQcm9taXNlPEFuc3dlcj57XHJcbiAgICAgICAgdGhpcy5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgICAgICAgdHlwZTogXCJvZmZlclwiLFxyXG4gICAgICAgICAgICBzZHA6IG9mZmVyIGFzIHN0cmluZ1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICB0aGlzLnNldExvY2FsRGVzY3JpcHRpb24oYXdhaXQgdGhpcy5jcmVhdGVBbnN3ZXIoKSk7XHJcblxyXG4gICAgICAgIC8vIHByb21pc2UgdG8gd2FpdCBmb3IgdGhlIHNkcFxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxBbnN3ZXI+KChhY2NlcHQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGFjY2VwdCh0aGlzLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgY29tcGxldGUoYW5zd2VyIDogQW5zd2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiYW5zd2VyXCIsXHJcbiAgICAgICAgICAgIHNkcDogYW5zd2VyIGFzIHN0cmluZ1xyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPZmZlciBleHRlbmRzIFN0cmluZ3t9XHJcbmV4cG9ydCBjbGFzcyBBbnN3ZXIgZXh0ZW5kcyBTdHJpbmd7fVxyXG5cclxuaW50ZXJmYWNlIFJUQ0RhdGFDaGFubmVsIGV4dGVuZHMgRXZlbnRUYXJnZXR7XHJcbiAgICBvbmNsb3NlOiBGdW5jdGlvbjtcclxuICAgIG9uZXJyb3I6IEZ1bmN0aW9uO1xyXG4gICAgb25tZXNzYWdlOiBGdW5jdGlvbjtcclxuICAgIG9ub3BlbjogRnVuY3Rpb247XHJcbiAgICBjbG9zZSgpO1xyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcgfCBCbG9iIHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcpO1xyXG59IiwiZXhwb3J0IGNvbnN0IGRhdGFsaW5rYyA9IHtcclxuICAgIGljZVNlcnZlcnM6IFt7dXJsczogXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCJ9XVxyXG59OyIsImltcG9ydCB7TmV0d29ya0FkZHJlc3N9IGZyb20gXCIuL05ldHdvcmtBZGRyZXNzXCI7XHJcbmltcG9ydCB7TmV0TGlua30gZnJvbSBcIi4vTmV0TGlua1wiO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBOUmVxdWVzdCB7XHJcbiAgICBvcmlnaW5hbDogc3RyaW5nO1xyXG4gICAgdGFyZ2V0OiBOZXR3b3JrQWRkcmVzcztcclxuICAgIGlubGluazogTmV0TGluaztcclxuICAgIGNvbnN0cnVjdG9yKGRlc3RpbmF0aW9uIDogTmV0d29ya0FkZHJlc3MsIG9yaWdpbmFsIDogc3RyaW5nLCBpbmxpbmsgPzogTmV0TGluayl7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbCA9IG9yaWdpbmFsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gZGVzdGluYXRpb247XHJcbiAgICAgICAgdGhpcy5pbmxpbmsgPSBpbmxpbmsgfHwgbnVsbDtcclxuICAgIH1cclxufSIsImltcG9ydCB7VHJhbnNtaXNzaW9uQ29udHJvbH0gZnJvbSBcIi4uL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbFwiO1xyXG5pbXBvcnQge05ldExpbmt9IGZyb20gXCIuL05ldExpbmtcIjtcclxuXHJcbi8qKlxyXG4gKiBpZiBpbmxpbmsgaXMgMCwgYXNzdW1lIHlvdSBjcmVhdGVkIGl0LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE5SZXNwb25zZXtcclxuICAgIG9yaWdpbmFsIDogc3RyaW5nO1xyXG4gICAgaW5saW5rIDogTmV0TGluaztcclxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbmFsIDogc3RyaW5nLCBpbmxpbmsgPzogTmV0TGluayl7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbCA9IG9yaWdpbmFsO1xyXG4gICAgICAgIHRoaXMuaW5saW5rID0gaW5saW5rIHx8IG51bGw7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge1RyYW5zbWlzc2lvbkNvbnRyb2x9IGZyb20gXCIuLi90cmFuc21pc3Npb25jb250cm9sL1RyYW5zbWlzc2lvbkNvbnRyb2xcIjtcclxuaW1wb3J0IHtOZXR3b3JrSW50ZXJuYWx9IGZyb20gXCIuL05ldHdvcmtJbnRlcm5hbFwiO1xyXG5pbXBvcnQge05SZXF1ZXN0fSBmcm9tIFwiLi9OUmVxdWVzdFwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9OZXR3b3JrQWRkcmVzc1wiO1xyXG5pbXBvcnQge05SZXNwb25zZX0gZnJvbSBcIi4vTlJlc3BvbnNlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0TGluayBleHRlbmRzIFRyYW5zbWlzc2lvbkNvbnRyb2x7XHJcbiAgICBhZGRyZXNzIDogTmV0d29ya0FkZHJlc3MgPSBudWxsO1xyXG4gICAgY29uc3RydWN0b3IobmV0d29yayA6IE5ldHdvcmtJbnRlcm5hbCkge1xyXG4gICAgICAgIHN1cGVyKGFzeW5jIHJlcXN0ciA9PiB7XHJcbiAgICAgICAgICAgIGxldCBzcGxpdHIgPSByZXFzdHIuaW5kZXhPZignfCcpO1xyXG4gICAgICAgICAgICBsZXQgYWRkcmVzcyA9IHBhcnNlRmxvYXQocmVxc3RyLnNsaWNlKDAsIHNwbGl0cikpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBuZXR3b3JrLm9ubWVzc2FnZShuZXcgTlJlcXVlc3QobmV3IE5ldHdvcmtBZGRyZXNzKGFkZHJlc3MpLCByZXFzdHIuc2xpY2Uoc3BsaXRyKzEpLCB0aGlzKSkpLm9yaWdpbmFsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2V0QWRkcmVzcyhhZGRyZXNzIDogTmV0d29ya0FkZHJlc3Mpe1xyXG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZFxyXG4gICAgICogQHNlZSBkaXNwYXRjaFxyXG4gICAgICogQHBhcmFtIGFyZ1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAgICAgKi9cclxuICAgIHNlbmQoYXJnIDogYW55KSA6IFByb21pc2U8YW55PntcclxuICAgICAgICB0aHJvdyBcIk5vdCBhdmFpbGFibGU6IHVzZSBkaXNwYXRjaC5cIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIGluc3RlYWQgb2Ygc2VuZFxyXG4gICAgICogdGhpcyBpcyBub3QgY2FsbGVkIHNlbmQsIGJlY2F1c2UgdHlwZXNjcmlwdC5cclxuICAgICAqIEBwYXJhbSB7TlJlcXVlc3R9IG1lc3NhZ2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPE5SZXNwb25zZT59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGRpc3BhdGNoKG1lc3NhZ2UgOiBOUmVxdWVzdCkgOiBQcm9taXNlPE5SZXNwb25zZT57XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgTlJlc3BvbnNlKFxyXG4gICAgICAgICAgICBhd2FpdCBzdXBlci5zZW5kKG1lc3NhZ2UudGFyZ2V0Lm51bWVyaWMudG9TdHJpbmcoKSArIFwifFwiICsgbWVzc2FnZS5vcmlnaW5hbCksXHJcbiAgICAgICAgICAgIHNlbGZcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtOZXR3b3JrSW50ZXJuYWx9IGZyb20gXCIuL05ldHdvcmtJbnRlcm5hbFwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9OZXR3b3JrQWRkcmVzc1wiO1xyXG5pbXBvcnQge05SZXF1ZXN0fSBmcm9tIFwiLi9OUmVxdWVzdFwiO1xyXG5pbXBvcnQge05SZXNwb25zZX0gZnJvbSBcIi4vTlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgUHVibGljS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7bmV0d29ya2N9IGZyb20gXCIuL2NvbmZpZ1wiO1xyXG5pbXBvcnQge0Zhc3RoYXNofSBmcm9tIFwiLi4vY3J5cHRvL0Zhc3RoYXNoXCI7XHJcblxyXG5leHBvcnQgZW51bSBOZXR3b3JrRXJyb3J7XHJcbiAgICBOb1N1Y2hDaGFubmVsID0gMjAwMSxcclxuICAgIFJlbW90ZUFwcGxpY2F0aW9uRXJyb3IgPSAyMDAyLFxyXG4gICAgQnJvYWRjYXN0RnJvbUZ1dHVyZSA9IDIxMDEsIC8vIHJlamVjdGVkIGJlY2F1c2UgZGVzeW5jaHJvbml6ZWQuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOZXR3b3JrIGV4dGVuZHMgTmV0d29ya0ludGVybmFse1xyXG4gICAgcHJpdmF0ZSBicm9hZGNhc3RCdWZmZXIgOiB7dGltZSA6IG51bWJlciwgaGFzaCA6IG51bWJlcn1bXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwb3J0cyA6IFJlcXVlc3RGdW5jdGlvbjxhbnksIGFueT5bXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSB0aW1lT2Zmc2V0IDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihrZXkgPzogUHJpdmF0ZUtleSl7XHJcbiAgICAgICAgc3VwZXIobnVsbCwga2V5IHx8IG5ldyBQcml2YXRlS2V5KCkpO1xyXG4gICAgICAgIHRoaXMub25tZXNzYWdlID0gdGhpcy5yZWZsZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHsoYXJnOiBBLCByZXE/OiBOUmVxdWVzdCkgPT4gUHJvbWlzZTxCPn0gb25tZXNzYWdlXHJcbiAgICAgKiBAcmV0dXJucyB7KGFyZzogQSkgPT4gKFByb21pc2U8Qj4gfCBQcm9taXNlPEI+W10pfVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYWRkcG9ydDxBLEI+KG9ubWVzc2FnZSA6IChhcmcgOiBBLCByZXEgPzogTlJlcXVlc3QpPT4gUHJvbWlzZTxCPik6IChhcmcgOiBBLCB0YXJnZXQgPzogTmV0d29ya0FkZHJlc3MpID0+IFByb21pc2U8QltdPiB8IFByb21pc2U8Qj57XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBwb3J0IDogbnVtYmVyID0gdGhpcy5wb3J0cy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMucG9ydHMucHVzaChhc3luYyAobXNnIDogQSwgcmVxID86IE5SZXF1ZXN0KT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgb25tZXNzYWdlKG1zZywgcmVxKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFzeW5jIChhcmcgOiBBLCB0YXJnZXQgPzogTmV0d29ya0FkZHJlc3MpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBwYXlsb2FkID0gcG9ydC50b1N0cmluZygxMCkgKyAnfCcgKyBKU09OLnN0cmluZ2lmeShhcmcpO1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0KXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnJlbGF5KG5ldyBOUmVxdWVzdCh0YXJnZXQsIHBheWxvYWQpKS50aGVuKHIgPT4gSlNPTi5wYXJzZShyLm9yaWdpbmFsKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9ubyB0YXJnZXQsIHdpbGwgYnJvYWRjYXN0XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgc2VsZi5icm9hZGNhc3QocGF5bG9hZCkpLm1hcChwID0+IHAudGhlbihlID0+IEpTT04ucGFyc2UoZS5vcmlnaW5hbCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHsobXNnOiBBKSA9PiBib29sZWFufSBvbm1lc3NhZ2Ugb3BlcmF0aW9uLiBib29sZWFuIHJlc3BvbnNlIGRldGVybWluZXMgd2hldGhlciB0byByZWJyb2FkY2FzdCB0aGUgbWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBvcnRcclxuICAgICAqIEByZXR1cm5zIHsobXNnOiBBKSA9PiB2b2lkfVxyXG4gICAgICovXHJcbiAgICBhZGRCcm9hZGNhc3RLZXJuZWw8QT4ob25tZXNzYWdlIDogKG1zZzogQSk9PlByb21pc2U8Ym9vbGVhbj4sIHBvcnQgPzogbnVtYmVyKSA6IChtc2cgOiBBKSA9PiBQcm9taXNlPHZvaWQ+e1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgY2hhbm5lbDtcclxuICAgICAgICBsZXQgcmVzcG9uZGVyID0gYXN5bmMgKG1zZyA6IFJhd0RvYzxCcm9hZGNhc3RGcmFtZTxBPj4pID0+IHtcclxuICAgICAgICAgICAgbGV0IHZiY2MgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3QobXNnKTtcclxuICAgICAgICAgICAgbGV0IGhhc2ggPSBGYXN0aGFzaC5zdHJpbmcodmJjYy5zaWduYXR1cmUpO1xyXG4gICAgICAgICAgICBpZih2YmNjLmRhdGEudGltZSA+IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgc2VsZi50aW1lT2Zmc2V0ICsgbmV0d29ya2MubWF4QnJvYWRjYXN0VG9sZXJhbmNlKSAvLyBuZXR3b3JrIHNlbnQgZnJvbSB0aGUgZnV0dXJlXHJcbiAgICAgICAgICAgICAgICB0aHJvd1tOZXR3b3JrRXJyb3IuQnJvYWRjYXN0RnJvbUZ1dHVyZV07XHJcbiAgICAgICAgICAgIGlmKFxyXG4gICAgICAgICAgICAgICAgIXNlbGYuYnJvYWRjYXN0QnVmZmVyW25ldHdvcmtjLm1heEJyb2FkY2FzdEJ1ZmZlcl0gfHwgLy8gYnVmZmVyIGlzbid0IGZ1bGwgeWV0LCBvclxyXG4gICAgICAgICAgICAgICAgKHNlbGYuYnJvYWRjYXN0QnVmZmVyW25ldHdvcmtjLm1heEJyb2FkY2FzdEJ1ZmZlcl0udGltZSA8IHZiY2MuZGF0YS50aW1lIC8vbm90IHRvbyBvbGQgYW5kXHJcbiAgICAgICAgICAgICAgICAmJiBzZWxmLmJyb2FkY2FzdEJ1ZmZlci5maW5kSW5kZXgoZSA9PiBlLmhhc2ggPT0gaGFzaCkgPT0gLTEgKS8vbm90IGFscmVhZHkgaW4gYnVmZmVyXHJcbiAgICAgICAgICAgICl7XHJcbiAgICAgICAgICAgICAgICBpZihhd2FpdCBvbm1lc3NhZ2UodmJjYy5kYXRhLmRhdGEpKXtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmJyb2FkY2FzdEJ1ZmZlci51bnNoaWZ0KHt0aW1lOiB2YmNjLmRhdGEudGltZSwgaGFzaDogaGFzaH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNlbGYuYnJvYWRjYXN0QnVmZmVyLmxlbmd0aCA+IG5ldHdvcmtjLm1heEJyb2FkY2FzdEJ1ZmZlcikgc2VsZi5icm9hZGNhc3RCdWZmZXIucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbChtc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNoYW5uZWwgPSB0aGlzLmFkZHBvcnQ8UmF3RG9jPEJyb2FkY2FzdEZyYW1lPEE+PiwgYm9vbGVhbj4ocmVzcG9uZGVyKTtcclxuICAgICAgICByZXR1cm4gYXN5bmMgKG1zZyA6IEEpPT57XHJcbiAgICAgICAgICAgIGxldCBmcmFtZSA6IEJyb2FkY2FzdEZyYW1lPEE+PSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhIDogbXNnLFxyXG4gICAgICAgICAgICAgICAgdGltZSA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgc2VsZi50aW1lT2Zmc2V0LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gY2hhbm5lbChhd2FpdCBzZWxmLmtleS5zaWduKGZyYW1lKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIHJlZmxlY3QobXNnOiBOUmVxdWVzdCl7XHJcbiAgICAgICAgbGV0IHNwbGl0ciA9IG1zZy5vcmlnaW5hbC5pbmRleE9mKCd8Jyk7XHJcbiAgICAgICAgbGV0IHBvcnQgPSBwYXJzZUludChtc2cub3JpZ2luYWwuc2xpY2UoMCwgc3BsaXRyKSk7XHJcbiAgICAgICAgbGV0IG1lYXQgPSBtc2cub3JpZ2luYWwuc2xpY2Uoc3BsaXRyKzEpO1xyXG4gICAgICAgIGlmKCF0aGlzLnBvcnRzW3BvcnRdKSB0aHJvdyBOZXR3b3JrRXJyb3IuTm9TdWNoQ2hhbm5lbDtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTlJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucG9ydHNbcG9ydF0oSlNPTi5wYXJzZShtZWF0KSwgbXNnKSkpO1xyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgdGhyb3cgW05ldHdvcmtFcnJvci5SZW1vdGVBcHBsaWNhdGlvbkVycm9yLCAuLi5lXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RnVuY3Rpb248UmVxdWVzdFQsIFJlc3BvbnNlVD57XHJcbiAgICAocmVxdWVzdCA6UmVxdWVzdFQsIHJlcSA/OiBOUmVxdWVzdCkgOiBQcm9taXNlPFJlc3BvbnNlVD5cclxufVxyXG5pbnRlcmZhY2UgQnJvYWRjYXN0RnJhbWU8VD57XHJcbiAgICBkYXRhIDogVDtcclxuICAgIHRpbWUgOiBudW1iZXI7XHJcbn0iLCJpbXBvcnQge1B1YmxpY0tleX0gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0d29ya0FkZHJlc3Mge1xyXG4gICAgcmVhZG9ubHkgbnVtZXJpYyA6IG51bWJlcjtcclxuICAgIGNvbnN0cnVjdG9yKGhhc2g6IG51bWJlcil7XHJcbiAgICAgICAgaWYoaGFzaCA+PSAxIHx8IGhhc2ggPD0gMCkgdGhyb3cgXCJJbnZhbGlkIGFkZHJlc3NcIjtcclxuICAgICAgICB0aGlzLm51bWVyaWMgPSBoYXNoO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtUQ0Fuc3dlciwgVENPZmZlciwgVHJhbnNtaXNzaW9uQ29udHJvbH0gZnJvbSBcIi4uL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbFwiO1xyXG5pbXBvcnQge05SZXNwb25zZX0gZnJvbSBcIi4vTlJlc3BvbnNlXCI7XHJcbmltcG9ydCB7TlJlcXVlc3R9IGZyb20gXCIuL05SZXF1ZXN0XCI7XHJcbmltcG9ydCB7TmV0d29ya0FkZHJlc3N9IGZyb20gXCIuL05ldHdvcmtBZGRyZXNzXCI7XHJcbmltcG9ydCB7QXJjdGFibGV9IGZyb20gXCIuL2FyY3RhYmxlL0FyY3RhYmxlXCI7XHJcbmltcG9ydCB7TmV0TGlua30gZnJvbSBcIi4vTmV0TGlua1wiO1xyXG5pbXBvcnQge1ByaXZhdGVLZXksIFJhd0RvYywgVmVyRG9jfSBmcm9tIFwiLi4vY3J5cHRvL1ByaXZhdGVLZXlcIjtcclxuaW1wb3J0IHtGdXR1cmV9IGZyb20gXCIuLi90b29scy9GdXR1cmVcIjtcclxuXHJcbmV4cG9ydCBlbnVtIE5ldHdvcmtJbnRlcm5hbEVycm9ye1xyXG4gICAgTm9QYXJ0aWNpcGFudEZvdW5kID0gMTAwMSxcclxuICAgIFByb3RvY29sRXJyb3IgPSAxMzAwLFxyXG4gICAgSGFuZHNoYWtlRXJyb3IxID0gMTMwMSxcclxuICAgIEhhbmRzaGFrZUVycm9yMiA9IDEzMDJcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5ldHdvcmtJbnRlcm5hbHtcclxuICAgIHByaXZhdGUgbGlua3M6IEFyY3RhYmxlPE5ldExpbms+O1xyXG4gICAgcHJpdmF0ZSBwZW5kaW5nT2ZmZXJzIDoge2xpbmsgOiBOZXRMaW5rLCBhZ2UgOiBudW1iZXJ9W10gPSBbXTtcclxuICAgIHByaXZhdGUgcGVuZGluZ0Fuc3dlcnM6IHtsaW5rIDogTmV0TGluaywgYWdlIDogbnVtYmVyfVtdID0gW107XHJcbiAgICBvbm1lc3NhZ2UgOiAocmVxdWVzdCA6IE5SZXF1ZXN0KSA9PiBOUmVzcG9uc2U7XHJcbiAgICByZWFkb25seSByZWFkeSA6IFByb21pc2U8TmV0d29ya0ludGVybmFsPjtcclxuICAgIHByb3RlY3RlZCBrZXkgOiBQcml2YXRlS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9ubWVzc2FnZSA6IChyZXF1ZXN0IDogTlJlcXVlc3QpID0+IE5SZXNwb25zZSwga2V5IDogUHJpdmF0ZUtleSl7XHJcbiAgICAgICAgdGhpcy5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XHJcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IG5ldyBGdXR1cmU8TmV0d29ya0ludGVybmFsPigpOyAvL2ZpcmVzIHdoZW4gYXQgbGVhc3Qgb25lIGNvbm5lY3Rpb24gaXMgcmVhZHk7XHJcbiAgICAgICAgKGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgIC8vZ3VhcmFudGVlZC1pc2ggdG8gYmUgcmVhZHkgb24gdGltZSBiZWNhdXNlIG9mZmVyL2Fuc3dlciBhd2FpdHMgdGhpcy5rZXlcclxuICAgICAgICAgICAgdGhpcy5saW5rcyA9IG5ldyBBcmN0YWJsZTxOZXRMaW5rPihhd2FpdCB0aGlzLmtleS5nZXRQdWJsaWNIYXNoKCkpO1xyXG4gICAgICAgIH0pKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QobGluayA6IE5ldExpbmspe1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsaW5rLnJlYWR5LnRoZW4oKCk9PihzZWxmLnJlYWR5IGFzIEZ1dHVyZTxOZXR3b3JrSW50ZXJuYWw+KS5yZXNvbHZlKHNlbGYpKTtcclxuICAgICAgICBsZXQgZWplY3RlZCA9IHRoaXMubGlua3MuYWRkKGxpbmsuYWRkcmVzcy5udW1lcmljICxsaW5rKTtcclxuICAgICAgICBpZihlamVjdGVkKSBlamVjdGVkLmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZGlzY29ubmVjdChsaW5rIDogTmV0TGluayl7XHJcbiAgICAgICAgdGhpcy5saW5rcy5yZW1vdmUobGluay5hZGRyZXNzLm51bWVyaWMpLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGFzeW5jIHJlbGF5KHJlcXVlc3QgOiBOUmVxdWVzdCkgOiBQcm9taXNlPE5SZXNwb25zZT57XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgb3V0bGluayA9IHRoaXMubGlua3MuYXBwcm9hY2gocmVxdWVzdC50YXJnZXQubnVtZXJpYyk7XHJcbiAgICAgICAgaWYoIW91dGxpbmspIHRocm93IFtOZXR3b3JrSW50ZXJuYWxFcnJvci5Ob1BhcnRpY2lwYW50Rm91bmRdO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBvdXRsaW5rLmRpc3BhdGNoKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIGJyb2FkY2FzdChyZXF1ZXN0IDogc3RyaW5nKSA6IFByb21pc2U8TlJlc3BvbnNlPltde1xyXG4gICAgICAgIGlmKCF0aGlzLmxpbmtzICkgcmV0dXJuIFtdO1xyXG4gICAgICAgIGxldCBhbGwgPSB0aGlzLmxpbmtzLmdldEFsbCgpO1xyXG4gICAgICAgIGlmKCFhbGwubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgICAgICAgcmV0dXJuIGFsbC5tYXAob2wgPT4gb2wuZGlzcGF0Y2gobmV3IE5SZXF1ZXN0KG9sLmFkZHJlc3MsIHJlcXVlc3QpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKSA6IFByb21pc2U8Tk9mZmVyPntcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGxpbmsgPSBuZXcgTmV0TGluayh0aGlzKTtcclxuICAgICAgICBsZXQgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICBzZWxmLnBlbmRpbmdPZmZlcnMucHVzaCh7bGluazogbGluaywgYWdlOiB0aW1lfSk7XHJcblxyXG4gICAgICAgIGxpbmsucmVhZHkudGhlbigoKT0+e1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IHNlbGYucGVuZGluZ09mZmVycy5zcGxpY2UoXHJcbiAgICAgICAgICAgICAgICBzZWxmLnBlbmRpbmdPZmZlcnMuZmluZEluZGV4KGUgPT4gZS5hZ2UgPT0gdGltZSksMSlbMF07XHJcbiAgICAgICAgICAgIHNlbGYuY29ubmVjdChsaW5rKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL0B0b2RvOiBjaGVjayBpZiBvdmVyZnVsbCwgYW5kIGRpc2FibGUgZnVydGhlciBvZmZlcnNcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5LnNpZ248e286IFRDT2ZmZXIsIHQ6IG51bWJlcn0+KHtvOiBhd2FpdCBsaW5rLm9mZmVyKCksIHQ6IHRpbWV9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBOT2ZmZXIpIDogUHJvbWlzZTxOQW5zd2VyPntcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBsZXQgdmVyZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0PHtvOiBUQ09mZmVyLCB0OiBudW1iZXJ9PihvZmZlcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgbGluayA9IG5ldyBOZXRMaW5rKHNlbGYpO1xyXG4gICAgICAgICAgICBsZXQgYW5zd2VyID0gYXdhaXQgbGluay5hbnN3ZXIodmVyZG9jLmRhdGEubyk7XHJcbiAgICAgICAgICAgIGxldCB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHNlbGYucGVuZGluZ0Fuc3dlcnMucHVzaCh7YWdlOiB0aW1lLCBsaW5rOiBsaW5rfSk7XHJcblxyXG4gICAgICAgICAgICBsaW5rLnNldEFkZHJlc3MobmV3IE5ldHdvcmtBZGRyZXNzKHZlcmRvYy5rZXkuaGFzaGVkKCkpKTtcclxuXHJcbiAgICAgICAgICAgIGxpbmsucmVhZHkudGhlbigoKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzZWxmLnBlbmRpbmdBbnN3ZXJzLnNwbGljZShcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnBlbmRpbmdBbnN3ZXJzLmZpbmRJbmRleChlID0+IGUuYWdlID09IHRpbWUpLDEpWzBdO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jb25uZWN0KGxpbmspO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vQHRvZG86IGRlbGV0ZSBvbGRlc3QgYW5zd2VycyBvbiBvdmVyZnVsbFxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMua2V5LnNpZ248e2EgOiBUQ0Fuc3dlciwgdDogbnVtYmVyfT4oe2EgOiBhbnN3ZXIsIHQ6IHZlcmRvYy5kYXRhLnR9KTtcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIHRocm93IFtOZXR3b3JrSW50ZXJuYWxFcnJvci5IYW5kc2hha2VFcnJvcjFdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb21wbGV0ZShhbnN3ZXIgOiBOQW5zd2VyKXtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBsZXQgdmVyZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0PHthIDogVENBbnN3ZXIsIHQ6IG51bWJlcn0+KGFuc3dlcik7XHJcblxyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmsgPSB0aGlzLnBlbmRpbmdPZmZlcnNbXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nT2ZmZXJzLmZpbmRJbmRleChvID0+IG8uYWdlID09IHZlcmRvYy5kYXRhLnQpXHJcbiAgICAgICAgICAgICAgICBdLmxpbms7XHJcbiAgICAgICAgICAgIGxpbmsuY29tcGxldGUodmVyZG9jLmRhdGEuYSk7XHJcblxyXG4gICAgICAgICAgICBsaW5rLnNldEFkZHJlc3MobmV3IE5ldHdvcmtBZGRyZXNzKHZlcmRvYy5rZXkuaGFzaGVkKCkpKTtcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIHRocm93IFtOZXR3b3JrSW50ZXJuYWxFcnJvci5IYW5kc2hha2VFcnJvcjJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIE5PZmZlciBleHRlbmRzIFJhd0RvYzx7bzogVENPZmZlciwgdDogbnVtYmVyfT57fVxyXG5jbGFzcyBOQW5zd2VyIGV4dGVuZHMgUmF3RG9jPHthIDogVENBbnN3ZXIsIHQ6IG51bWJlcn0+e30iLCJpbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi9DaG9yZGlvaWRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBBcmN0YWJsZTxUPiBleHRlbmRzIENob3Jkb2lkPFQ+IHtcclxuICAgIHByaXZhdGUgcHVyZ2F0b3J5OiB7IGtleTogbnVtYmVyLCBvYmo6IFQsIGVmZjogbnVtYmVyLCBpZHg6IG51bWJlciB9W10gPSBbXTsgLy8gc3RvcmVzIHBlbmRpbmcgYWRkcmVzc2VzO1xyXG4gICAgcHJpdmF0ZSBkZWVwU3RvcmVkIDogbnVtYmVyID0gMDtcclxuICAgIHJlYWRvbmx5IG1heFNpemUgOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2VudGVyIDogbnVtYmVyLCBtYXhTaXplID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoIC0gMSl7XHJcbiAgICAgICAgc3VwZXIoY2VudGVyKTtcclxuICAgICAgICB0aGlzLm1heFNpemUgPSBtYXhTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZChsb2NhdGlvbiA6IG51bWJlciwgb2JqZWN0IDogVCkgOiBUIHwgbnVsbHtcclxuICAgICAgICBpZih0aGlzLmlzRGVzaXJhYmxlKGxvY2F0aW9uKSl7XHJcbiAgICAgICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgZXh0cmFjdGVkID0gdGhpcy5hcnJheVtpZHhdO1xyXG4gICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmplY3R9O1xyXG5cclxuICAgICAgICAgICAgaWYoIWV4dHJhY3RlZCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZXBTdG9yZWQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IGV4dHJhY3RlZC5rZXk7XHJcbiAgICAgICAgICAgIG9iamVjdCA9IGV4dHJhY3RlZC5vYmo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuXHJcbiAgICAgICAgdGhpcy5wdXJnYXRvcnkucHVzaCh7b2JqOiBvYmplY3QsIGtleTogbG9jYXRpb24sIGVmZjogZWZmaWNpZW5jeSwgaWR4OiBpZHh9KTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5wdXJnYXRvcnkubGVuZ3RoIDw9IHRoaXMubWF4U2l6ZSAtIHRoaXMuZGVlcFN0b3JlZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucHVyZ2F0b3J5LnNvcnQoKGEsIGIpPT4gYS5lZmYgLSBiLmVmZik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnB1cmdhdG9yeS5wb3AoKS5vYmo7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZShsb2NhdGlvbiA6IG51bWJlcikgOiBUe1xyXG4gICAgICAgIGxldCByZW1vdmVkID0gc3VwZXIucmVtb3ZlKGxvY2F0aW9uKTtcclxuICAgICAgICBpZihyZW1vdmVkKXtcclxuICAgICAgICAgICAgdGhpcy5kZWVwU3RvcmVkLS07XHJcblxyXG4gICAgICAgICAgICAvL2ZpbmQgYSByZXBsYWNlbWVudFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICAgICAgbGV0IGNhbmRpZGF0ZXMgPSB0aGlzLnB1cmdhdG9yeS5maWx0ZXIoZSA9PiBlLmlkeCA9PSBpZHgpO1xyXG4gICAgICAgICAgICBpZihjYW5kaWRhdGVzLmxlbmd0aCA9PSAwKSByZXR1cm4gcmVtb3ZlZDtcclxuXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZXMuc29ydCgoYSxiKT0+IGEuZWZmIC0gYi5lZmYpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpbmRleCA9IHRoaXMucHVyZ2F0b3J5LmZpbmRJbmRleChlID0+IGUua2V5ID09IGxvY2F0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLnB1cmdhdG9yeS5zcGxpY2UocGluZGV4LCAxKVswXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0b3JlZCsrO1xyXG4gICAgICAgICAgICBpZihzdXBlci5hZGQoY2FuZGlkYXRlLmtleSwgY2FuZGlkYXRlLm9iaikpIHRocm93IFwiZmF0YWwgbG9naWMgZXJyb3IgaW4gYXJjdGFibGVcIjtcclxuXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlZDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbGV0IHBpbmRleCA9IHRoaXMucHVyZ2F0b3J5LmZpbmRJbmRleChlID0+IGUua2V5ID09IGxvY2F0aW9uKTtcclxuICAgICAgICAgICAgaWYocGluZGV4ID09IC0xKSByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVyZ2F0b3J5LnNwbGljZShwaW5kZXgsIDEpWzBdLm9iajtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWxsKCl7XHJcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLCAuLi50aGlzLnB1cmdhdG9yeV0ubWFwKGUgPT4gZS5vYmopO1xyXG4gICAgfVxyXG5cclxuICAgIGFwcHJvYWNoKGxvY2F0aW9uIDogbnVtYmVyKSA6IFR7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0V2l0aGluKGxvY2F0aW9uLCB0aGlzLmRpc3RhbmNlKGxvY2F0aW9uKSlcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgQ2hvcmRvaWQ8VD57XHJcbiAgICBwcml2YXRlIGxvY3VzIDogbnVtYmVyO1xyXG4gICAgcHJvdGVjdGVkIGFycmF5IDoge2tleSA6IG51bWJlciwgb2JqIDogVH1bXTtcclxuXHJcbiAgICAvL0ZJWE1FOiBhbXAgdXAgcHJlY2lzaW9uIHRvIDY0IGJpdDtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb29rdXBUYWJsZSA9IFstMC41LCAtMC4yNSwgLTAuMDU1NTU1NTU1NTU1NTU1NTgsIC0wLjAwNzgxMjUsIC0wLjAwMDgwMDAwMDAwMDAwMDAyMjksIC0wLjAwMDA2NDMwMDQxMTUyMjYxMDksXHJcbiAgICAgICAgLTAuMDAwMDA0MjQ5OTI5ODc2MTMyMjYzNSwgLTIuMzg0MTg1NzkxMDE1NjI1ZS03LCAtMS4xNjE1Mjg2NTY1OTAyNDk0ZS04LCAtNC45OTk5OTk4NTg1OTAzNDNlLTEwLFxyXG4gICAgICAgIC0xLjkyNzcxOTA5NTQ2MjUyMTJlLTExLCAtNi43Mjk2MTY4NjM3NjUzODZlLTEzLCAtMi4xNDgyODE1NTI2NDk2NzhlLTE0LCAtNi4xMDYyMjY2MzU0MzgzNjFlLTE2LCAwLFxyXG4gICAgICAgIDYuMTA2MjI2NjM1NDM4MzYxZS0xNiwgMi4xNDgyODE1NTI2NDk2NzhlLTE0LCA2LjcyOTYxNjg2Mzc2NTM4NmUtMTMsIDEuOTI3NzE5MDk1NDYyNTIxMmUtMTEsXHJcbiAgICAgICAgNC45OTk5OTk4NTg1OTAzNDNlLTEwLCAxLjE2MTUyODY1NjU5MDI0OTRlLTgsIDIuMzg0MTg1NzkxMDE1NjI1ZS03LCAwLjAwMDAwNDI0OTkyOTg3NjEzMjI2MzUsXHJcbiAgICAgICAgMC4wMDAwNjQzMDA0MTE1MjI2MTA5LCAwLjAwMDgwMDAwMDAwMDAwMDAyMjksIDAuMDA3ODEyNSwgMC4wNTU1NTU1NTU1NTU1NTU1OCwgMC4yNSwgMC41XTtcclxuICAgIHN0YXRpYyByZWFkb25seSBsb2N1c0lEWCA9IDE0OyAvLyBwb3NpdGlvbiBvZiB0aGUgbG9jdXNcclxuICAgIHN0YXRpYyBhY2NlcHRhYmxlRXJyb3IgPSAxZS0xNjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZW50ZXIgOiBudW1iZXIsIGNpcmN1bWZlcmVuY2UgOiBudW1iZXIgPSAxKXtcclxuICAgICAgICB0aGlzLmxvY3VzID0gY2VudGVyO1xyXG4gICAgICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTEpLmZpbGwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEZXNpcmFibGUobG9jYXRpb246IG51bWJlcil7IC8vdG9kbzogcmVmYWN0b3IgdGhpcyBpbnRvIFwiYWRkXCJcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGQobG9jYXRpb246IG51bWJlciwgb2JqIDogVCkgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICAvL2VmZmljaWVuY3kgaXMgd29yc2UgdGhhbiBpbmNvbWluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XS5vYmo7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vcmVqZWN0IHRoZSBvYmplY3Q7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqfTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0cmlldmUgY2xvc2VzdCBhdmFpbGFibGUgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb25cclxuICAgICAqIEByZXR1cm5zIHtUIHwgbnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0KGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSB8fCBudWxsKSAmJiBpdGVtLm9iajtcclxuICAgIH1cclxuICAgIGdldFdpdGhpbihsb2NhdGlvbjogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlcikgOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSAmJiBDaG9yZG9pZC5kaXN0YW5jZShpdGVtLmtleSAsIGxvY2F0aW9uKSA8IHRvbGVyYW5jZSlcclxuICAgICAgICAgICAgPyBpdGVtLm9ialxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZC5hY2NlcHRhYmxlRXJyb3Ipe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcnJheVtpZHhdID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gb2xkLm9iajtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGRlcmVmZXJlbmNlIChpZHg6IEV4cG9uZW50LCBsb2N1czogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeC52YWx1ZU9mKCldICsgbG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGxvY2F0aW9uPj0wICYmIGxvY2F0aW9uIDw9IDEsIFwibG9jYXRpb246IFwiK2xvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gKCgxICsgbG9jYXRpb24gLSB0aGlzLmxvY3VzICsgMC41KSAlIDEpIC0gMC41O1xyXG4gICAgICAgIC8vZXhwZWN0IGluIHJhbmdlIC0wLjUsIDAuNVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAobG9jYXRpb24gKyB0aGlzLmxvY3VzICsgMSApICUgMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlzdGFuY2UoYSA6IG51bWJlciwgYiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhhIC0gYiksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiICsgMSksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGIgLSBhICsgMSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZGlzdGFuY2UoYTogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UodGhpcy5sb2N1cywgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSwgZGVyZWxhdGl2aXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgbHRvaShsb2NhdGlvbiA6IG51bWJlciwgc2tpcEVtcHR5IDogYm9vbGVhbiA9IGZhbHNlKSA6IG51bWJlcnsgLy9sb2NhdGlvbiB0byBpbmRleFxyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IDE7XHJcbiAgICAgICAgbGV0IHZlcmlkZXggPSBudWxsO1xyXG4gICAgICAgIGlmKGRlcmVsYXRpdml6ZWQgPCAwKXtcclxuICAgICAgICAgICAgLy9zdGFydCB3aXRoIDBcclxuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIG1heFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlciwgZWZmaWNpZW5jeTogbnVtYmVyLCBleHBvbmVudDogRXhwb25lbnR9W119IHNvcnRlZCwgYmlnZ2VzdCB0byBzbWFsbGVzdCBnYXAuXHJcbiAgICAgKi9cclxuICAgIGdldFN1Z2dlc3Rpb25zKCkgOiB7bG9jYXRpb24gOiBudW1iZXIsIGVmZmljaWVuY3kgOiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5Lm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBleHBvbmVudDogbmV3IEV4cG9uZW50KGlkeCksXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAoaXRlbSk/IHRoaXMuZWZmaWNpZW5jeShpdGVtLmtleSwgaWR4KSA6IE1hdGguYWJzKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeF0vMiksXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5yZXJlbGF0aXZpemUoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsbCgpIDogVFtde1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFeHBvbmVudCBleHRlbmRzIE51bWJlcntcclxuICAgIGNvbnN0cnVjdG9yKGV4cG9uZW50IDogbnVtYmVyKXtcclxuICAgICAgICBpZihcclxuICAgICAgICAgICAgTWF0aC5hYnMoZXhwb25lbnQpICE9IGV4cG9uZW50IHx8XHJcbiAgICAgICAgICAgIGV4cG9uZW50IDwgMCAgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPj0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoXHJcbiAgICAgICAgKSB0aHJvdyBcImludmFsaWQgZXhwb25lbnRcIjtcclxuICAgICAgICBzdXBlcihleHBvbmVudCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgbmV0d29ya2MgPSB7XHJcbiAgICBtYXhDb25uZWN0aW9uczogMjAsXHJcbiAgICBtYXhQZW5kaW5nQ29ubmVjdGlvbnM6IDIwLFxyXG5cclxuICAgIG1heEJyb2FkY2FzdEJ1ZmZlcjogMTAwLFxyXG4gICAgbWF4QnJvYWRjYXN0VG9sZXJhbmNlOiAyLCAvL21pbGxpc2Vjb25kc1xyXG59OyIsImV4cG9ydCBjbGFzcyBUZXN0e1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHRlc3RzIDogKCgpPT5Qcm9taXNlPGJvb2xlYW4+KVtdID0gW107XHJcbiAgICBwcml2YXRlIGl0ZW0gOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGl0ZW1cclxuICAgIHByaXZhdGUgcGFzc2VkIDogbnVtYmVyID0gMDtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUgOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBwYXNzKCkgOiBib29sZWFue1xyXG4gICAgICAgIHRoaXMucGFzc2VkKys7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGZhaWwoc3RyOiBzdHJpbmcsIG9iamVjdHM6IGFueVtdKSA6IGJvb2xlYW57XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJGQUlMRUQgKFwiKygrK3RoaXMuaXRlbSkrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpXCIsXHJcbiAgICAgICAgICAgIHN0ciwgb2JqZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydChuYW1lIDogc3RyaW5nLCBhIDogYW55LCBiIDogYW55LCBjb21wYXJhdG9yIDogKGEsIGIpPT5ib29sZWFuID0gKGEsYik9PmE9PT1iKXtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2goYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgaWYoY29tcGFyYXRvcihhd2FpdCBhLCBhd2FpdCBiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXNzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKFwiYXNzZXJ0OiBcIiArIG5hbWUsIFthd2FpdCBhLCBhd2FpdCBiXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIHRoaXMuaXRlbSA9IDA7XHJcbiAgICAgICAgdGhpcy5wYXNzZWQgPSAwO1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRoaXMudGVzdHMubWFwKGUgPT4gZSgpKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coKCh0aGlzLnBhc3NlZCA9PSB0aGlzLnRlc3RzLmxlbmd0aCk/IFwiUGFzc2VkIChcIiA6IFwiRkFJTEVEISAoXCIpK3RoaXMucGFzc2VkK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKS4gaW4gXCIrdGhpcy5uYW1lK1wiLlwiKTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBFc3NlbnRpYWxseSBkZWZlcnJlZCwgYnV0IGl0J3MgYWxzbyBhIHByb21pc2UuXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTW96aWxsYS9KYXZhU2NyaXB0X2NvZGVfbW9kdWxlcy9Qcm9taXNlLmpzbS9EZWZlcnJlZCNiYWNrd2FyZHNfZm9yd2FyZHNfY29tcGF0aWJsZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZ1dHVyZTxUPiBleHRlbmRzIFByb21pc2U8VD57XHJcbiAgICByZWFkb25seSByZXNvbHZlIDogKHZhbHVlIDogUHJvbWlzZUxpa2U8VD4gfCBUKSA9PiB2b2lkO1xyXG4gICAgcmVhZG9ubHkgcmVqZWN0IDogKHJlYXNvbiA/OiBhbnkpID0+IHZvaWQ7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGUgOiAwIHwgMSB8IDI7IC8vcGVuZGluZywgcmVzb2x2ZWQsIHJlamVjdGVkO1xyXG4gICAgcHJpdmF0ZSBzdGF0ZUV4dHJhY3RvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRvciA/OiAoXHJcbiAgICAgICAgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgbGV0IHJlc29sdmVyLCByZWplY3RvcjtcclxuICAgICAgICBsZXQgc3RhdGUgOiAwIHwgMSB8IDIgPSAwO1xyXG4gICAgICAgIHN1cGVyKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZXIgPSAocmVzb2x1dGlvbiA6IFQpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzb2x1dGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJlamVjdG9yID0gKHJlamVjdGlvbiA6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAyO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHJlamVjdGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZUV4dHJhY3RvciA9ICgpID0+IHsgLy8gdGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzZWxmIGNhbm5vdCBiZSBzZXQgaW4gc3VwZXI7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlcjtcclxuICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdG9yO1xyXG5cclxuICAgICAgICBleGVjdXRvciAmJiBuZXcgUHJvbWlzZTxUPihleGVjdXRvcikudGhlbihyZXNvbHZlcikuY2F0Y2gocmVqZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCkgOiBcInBlbmRpbmdcIiB8IFwicmVzb2x2ZWRcIiB8IFwicmVqZWN0ZWRcIiB8IFwiZXJyb3JcIiB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMCk/IFwicGVuZGluZ1wiXHJcbiAgICAgICAgICAgIDogKHRoaXMuc3RhdGVFeHRyYWN0b3IoKSA9PSAxKSA/IFwicmVzb2x2ZWRcIlxyXG4gICAgICAgICAgICA6ICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMikgPyBcInJlamVjdGVkXCJcclxuICAgICAgICAgICAgOiBcImVycm9yXCI7XHJcbiAgICB9XHJcblxyXG59IiwiLy90b2RvOiBpbmNsdWRlIHBvbHlmaWxscyBmb3IgRWRnZVxyXG5leHBvcnQgY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuZXhwb3J0IGNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XHJcblxyXG4iLCJpbXBvcnQge0Fuc3dlciwgRGF0YUxpbmssIE9mZmVyfSBmcm9tIFwiLi4vZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHt0cmFuc21pc3Npb25jb250cm9sY30gZnJvbSBcIi4vY29uZmlnXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7TmV0d29ya0FkZHJlc3N9IGZyb20gXCIuLi9uZXR3b3JrL05ldHdvcmtBZGRyZXNzXCI7XHJcblxyXG5lbnVtIFRyYW5zbWlzc2lvbkNvbnRyb2xFcnJvcntcclxuICAgIENvbm5lY3Rpb25DbG9zZWQgPSAxMDAsXHJcbiAgICBSZW1vdGVFcnJvciA9IDIwMCxcclxuICAgIFByb3RvY29sRXJyb3IgPSAzMDBcclxufVxyXG5cclxuLyoqXHJcbiAqIGNwdCAwXHJcbiAqIGZvcndhcmQgIGNwdD0xXHJcbiAqIGJhY2t3YXJkIGNwcj0yXHJcbiAqXHJcbiAqIGNwdCAxXHJcbiAqIHJlZmVyZW5jZVxyXG4gKiAwXHJcbiAqXHJcbiAqIGNwdCAyXHJcbiAqIHJlZmVyZW5jZSBpZiBjcHQgMSA9PSAwXHJcbiAqIGRhdGEuLi5cclxuICpcclxuICogY3B0IDMuLi5cclxuICogZGF0YS4uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zbWlzc2lvbkNvbnRyb2wgZXh0ZW5kcyBEYXRhTGlua3tcclxuICAgIGFkZHJlc3M6IE5ldHdvcmtBZGRyZXNzO1xyXG4gICAgcmVsYXlUYWJsZTogRnV0dXJlPHN0cmluZz5bXSA9IG5ldyBBcnJheSh0cmFuc21pc3Npb25jb250cm9sYy5tYXhNZXNzYWdlQnVmZmVyKzEpLmZpbGwobnVsbCk7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob25tZXNzYWdlIDogKG1zZyA6IHN0cmluZyk9PlByb21pc2U8c3RyaW5nPiB8IHN0cmluZyl7XHJcbiAgICAgICAgc3VwZXIoKG1zZyk9PmNvbnNvbGUubG9nKG1zZykpO1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuZGF0YWNoYW5uZWwub25tZXNzYWdlID0gYXN5bmMgKG1zZ0UpPT57XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAobXNnRS5kYXRhLmNvZGVQb2ludEF0KDApKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkeCA9IG1zZ0UuZGF0YS5jb2RlUG9pbnRBdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWlkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gbXNnRS5kYXRhLmNvZGVQb2ludEF0KDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWxheVRhYmxlW2lkeC0xXS5yZWplY3QoW1RyYW5zbWlzc2lvbkNvbnRyb2xFcnJvci5SZW1vdGVFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5tc2dFLmRhdGEuc2xpY2UoMykuc3BsaXQoJycpLm1hcChjID0+IGMuY29kZVBvaW50QXQoMCkpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF5VGFibGVbaWR4LTFdLnJlc29sdmUobXNnRS5kYXRhLnNsaWNlKDIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWR4ID0gbXNnRS5kYXRhLmNvZGVQb2ludEF0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlcGx5KFN0cmluZy5mcm9tQ29kZVBvaW50KDIsIGlkeCkgKyBhd2FpdCBvbm1lc3NhZ2UobXNnRS5kYXRhLnNsaWNlKDIpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1jYXRjaCAoZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlcGx5KFN0cmluZy5mcm9tQ29kZVBvaW50KDIsMCxpZHgsLi4uZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJhZCBhY3RvcjpcIik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVwbHkobXNnIDogc3RyaW5nKXtcclxuICAgICAgICBzdXBlci5zZW5kKG1zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXIoKXtcclxuICAgICAgICByZXR1cm4gXCJUQ086XCIrIGF3YWl0IHN1cGVyLm9mZmVyKCk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBUQ09mZmVyKXtcclxuICAgICAgICBpZiAob2ZmZXIuc2xpY2UoMCw0KSAhPT0gXCJUQ086XCIpIHRocm93IFtUcmFuc21pc3Npb25Db250cm9sRXJyb3IuUHJvdG9jb2xFcnJvcl07XHJcbiAgICAgICAgcmV0dXJuIFwiVENBOlwiKyBhd2FpdCBzdXBlci5hbnN3ZXIob2ZmZXIuc2xpY2UoNCkpO1xyXG4gICAgfVxyXG4gICAgY29tcGxldGUoYW5zd2VyOiBUQ0Fuc3dlcil7XHJcbiAgICAgICAgaWYgKGFuc3dlci5zbGljZSgwLDQpICE9PSBcIlRDQTpcIikgdGhyb3cgW1RyYW5zbWlzc2lvbkNvbnRyb2xFcnJvci5Qcm90b2NvbEVycm9yXTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuY29tcGxldGUoYW5zd2VyLnNsaWNlKDQpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2VuZChtc2cgOiBzdHJpbmcpIDogUHJvbWlzZTxzdHJpbmc+e1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLnJlbGF5VGFibGUuZmluZEluZGV4KGUgPT4gIWUpKzE7XHJcbiAgICAgICAgdGhpcy5yZWxheVRhYmxlW2lkeC0xXSA9IG5ldyBGdXR1cmU8c3RyaW5nPigpO1xyXG4gICAgICAgIHN1cGVyLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoMSwgaWR4KSArIG1zZyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXlUYWJsZVtpZHgtMV07XHJcbiAgICB9XHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIHRoaXMucmVsYXlUYWJsZS5mb3JFYWNoKGUgPT4gZSAmJiBlLnJlamVjdChbVHJhbnNtaXNzaW9uQ29udHJvbEVycm9yLkNvbm5lY3Rpb25DbG9zZWRdKSk7XHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRDT2ZmZXIgZXh0ZW5kcyBPZmZlcnt9XHJcbmV4cG9ydCBjbGFzcyBUQ0Fuc3dlciBleHRlbmRzIEFuc3dlcnt9XHJcbiIsImV4cG9ydCBjb25zdCB0cmFuc21pc3Npb25jb250cm9sYyA9IHtcclxuICAgIG1heE1lc3NhZ2VCdWZmZXI6IDEwMCxcclxuICAgIHZlcnNpb246IFwiVENETC0xLjAuMFwiXHJcbn0iLCJpbXBvcnQge1Rlc3R9IGZyb20gXCIuL21vZHVsZXMvdGVzdC9UZXN0XCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgVmVyRG9jfSBmcm9tIFwiLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7RGF0YUxpbmt9IGZyb20gXCIuL21vZHVsZXMvZGF0YWxpbmsvRGF0YUxpbmtcIjtcclxuaW1wb3J0IHtUcmFuc21pc3Npb25Db250cm9sfSBmcm9tIFwiLi9tb2R1bGVzL3RyYW5zbWlzc2lvbmNvbnRyb2wvVHJhbnNtaXNzaW9uQ29udHJvbFwiO1xyXG5pbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvYXJjdGFibGUvQ2hvcmRpb2lkXCI7XHJcbmltcG9ydCB7QXJjdGFibGV9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9hcmN0YWJsZS9BcmN0YWJsZVwiO1xyXG5pbXBvcnQge05ldHdvcmtBZGRyZXNzfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya0FkZHJlc3NcIjtcclxuaW1wb3J0IHtOZXR3b3JrSW50ZXJuYWx9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9OZXR3b3JrSW50ZXJuYWxcIjtcclxuaW1wb3J0IHtOUmVzcG9uc2V9IGZyb20gXCIuL21vZHVsZXMvbmV0d29yay9OUmVzcG9uc2VcIjtcclxuaW1wb3J0IHtOZXRMaW5rfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0TGlua1wiO1xyXG5pbXBvcnQge05SZXF1ZXN0fSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTlJlcXVlc3RcIjtcclxuaW1wb3J0IHtOZXR3b3JrfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya1wiO1xyXG5pbXBvcnQge1N5bmNocm9uaWNpdHl9IGZyb20gXCIuL21vZHVsZXMvdG9vbHMvU3luY2hyb25pY2l0eVwiO1xyXG5cclxuUHJvbWlzZS5hbGwoW1xyXG4gICAgKGFzeW5jICgpPT57bGV0IGNyID0gbmV3IFRlc3QoXCJDcnlwdG9cIik7XHJcblxyXG4gICAgICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICAgICAgbGV0IHByayA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgbGV0IHZlcmRvYyA9IGF3YWl0IHByay5zaWduKHRvKTtcclxuICAgICAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2MpO1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJ2ZXJkb2Mga2V5IGNvbXBhcmlzb25cIiwgdmVyZG9jLmtleS5oYXNoZWQoKSwgcmVjb25zdHJ1Y3RlZC5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIGNyLmFzc2VydChcInZlcmRvYyBkYXRhIGNvbXBhcmlzb25cIiwgSlNPTi5zdHJpbmdpZnkodmVyZG9jLmRhdGEpLCBKU09OLnN0cmluZ2lmeShyZWNvbnN0cnVjdGVkLmRhdGEpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gY3J5cHRvIHRlc3RcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIkRhdGFMaW5rXCIpO1xyXG5cclxuICAgICAgICBsZXQgdHJhbnNtaXR0ZWQgPSBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgbGV0IGEgPSBuZXcgRGF0YUxpbmsobSA9PiByZXNvbHZlKG0uZGF0YSkpO1xyXG4gICAgICAgICAgICBsZXQgYiA9IG5ldyBEYXRhTGluayhtID0+IGIuc2VuZChcImIgcmVzcG9uZHMgdG8gXCIrbS5kYXRhKSk7XHJcblxyXG4gICAgICAgICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgIGEuc2VuZChcImEgc2F5cyBiZWVwXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNyLmFzc2VydChcInNpbXBsZSBkYXRhIGJvdW5jZVwiLCB0cmFuc21pdHRlZCwgXCJiIHJlc3BvbmRzIHRvIGEgc2F5cyBiZWVwXCIpO1xyXG5cclxuICAgICAgICAvLy8vIHRlc3QgbWVtb3J5IHVzYWdlIC0gaXQncyBzdGF0aWMuXHJcbiAgICAgICAgLy8gZm9yKGxldCBpID0gMDsgaTwxMDAwOyBpKyspe1xyXG4gICAgICAgIC8vICAgICBsZXQgYSA9IG5ldyBEYXRhTGluayhtID0+IGNvbnNvbGUubG9nKTtcclxuICAgICAgICAvLyAgICAgbGV0IGIgPSBuZXcgRGF0YUxpbmsobSA9PiBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgLy8gICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcbiAgICAgICAgLy8gICAgIGF3YWl0IGEucmVhZHk7XHJcbiAgICAgICAgLy8gICAgIGEuY2xvc2UoKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBjci5ydW4oKTtcclxuICAgIH0pKCksIC8vIERhdGEgTGlua1xyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiVHJhbnNtaXNzaW9uIENvbnRyb2xcIik7XHJcblxyXG4gICAgICAgIGxldCBhID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2wobSA9PiBcImEgcmVmbGVjdHM6IFwiK20pO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcImIgcmV0dXJuczogXCIgKyBhd2FpdCBiLnNlbmQoXCJiIHJlZmxlY3RzOiBcIittKSk7XHJcblxyXG4gICAgICAgIGEuY29tcGxldGUoYXdhaXQgYi5hbnN3ZXIoYXdhaXQgYS5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcblxyXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGEuc2VuZChcImFhYVwiKTtcclxuXHJcbiAgICAgICAgY3IuYXNzZXJ0KFwiZHVhbCB0Y3AgYm91bmNlXCIsIHJlc3BvbnNlLCBcImIgcmV0dXJuczogYSByZWZsZWN0czogYiByZWZsZWN0czogYWFhXCIpO1xyXG5cclxuICAgICAgICBsZXQgYyA9IG5ldyBUcmFuc21pc3Npb25Db250cm9sKG0gPT4gUHJvbWlzZS5yZWplY3QoWzQwLDUwLDYwXSkpO1xyXG4gICAgICAgIGxldCBkID0gbmV3IFRyYW5zbWlzc2lvbkNvbnRyb2woYXN5bmMgbSA9PiBcIm5vdGhpbmdcIik7XHJcblxyXG4gICAgICAgIGMuY29tcGxldGUoYXdhaXQgZC5hbnN3ZXIoYXdhaXQgYy5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGQucmVhZHk7XHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcInJlbW90ZSBoYW5kbGluZyBwcm9wYWdhdGlvblwiLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShhd2FpdCBkLnNlbmQoXCJib29wXCIpLmNhdGNoKGUgPT4gZSkpLFxyXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShbMjAwLCA0MCwgNTAsIDYwXSkpO1xyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBUcmFuc21pc3Npb24gQ29udHJvbFxyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjdCA9IG5ldyBUZXN0KFwiQXJjdGFibGVcIik7XHJcblxyXG4gICAgICAgIGxldCBtYXhTaXplID0gMzA7XHJcblxyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMC45LCAwLjEpLCAwLjIsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBBcmN0YWJsZS5kaXN0YW5jZSgwLjEsIDAuMSksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIEFyY3RhYmxlLmRpc3RhbmNlKDAuNCwgMC41KSwgMC4xLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMCwgMSksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIEFyY3RhYmxlLmRpc3RhbmNlKDAuMSwgMC45KSwgMC4yLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQXJjdGFibGUuZGlzdGFuY2UoMSwgMCksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuXHJcbiAgICAgICAgbGV0IHRpID0gbmV3IEFyY3RhYmxlKDAuNSk7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDApLCAwKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMSksIDApO1xyXG4gICAgICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwLjQ5OTk5KSwgNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDAuNSksIDE0KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMC41MDAwMSksIDIyKTtcclxuXHJcbiAgICAgICAgbGV0IHRpMiA9IG5ldyBBcmN0YWJsZSgwLjc1KTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJpbmRpY2VyIDJcIiwgdGkyLmx0b2koMC4yNSksIDApO1xyXG4gICAgICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc0OTk5KSwgNik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuNzUpLCAxNCk7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuNzUwMDEpLCAyMik7XHJcblxyXG4gICAgICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAwXCIsIHRpMi5nZXQodG8uYSksIG51bGwpO1xyXG4gICAgICAgIGN0LmFzc2VydChcImFkZCAxXCIsIHRpMi5hZGQodG8uYSwgdG8pLCBudWxsKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQodG8uYSksIHRvKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQoMC45KSwgdG8pO1xyXG4gICAgICAgIGN0LmFzc2VydChcImZldGNoIDFcIiwgdGkyLmdldCgwLjc0KSwgdG8pO1xyXG5cclxuICAgICAgICBsZXQgdG8yID0ge2E6IDAuMTEwOSwgYjogMjM0NTEyfTsgLy9oaWdoZXIgZWZmaWNpZW5jeSBzYW1lIGluZGV4XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiYWRkIDIgKGF0dGVtcHQgb3ZlcndyaXRlKVwiLCB0aTIuYWRkKHRvMi5hLCB0bzIpLCBudWxsKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJmZXRjaCAyXCIsIHRpMi5nZXQodG8uYSksIHRvMik7XHJcbiAgICAgICAgY3QuYXNzZXJ0KFwiZmV0Y2ggMi4yXCIsIHRpMi5nZXQodG8yLmEpLCB0bzIpO1xyXG5cclxuICAgICAgICBjdC5hc3NlcnQoXCJzdWdnZXN0aW9uIG9yZGVyXCIsIHRpMi5nZXRTdWdnZXN0aW9ucygpWzBdLmVmZmljaWVuY3ksIHRpMi5nZXRTdWdnZXN0aW9ucygpWzFdLmVmZmljaWVuY3ksIChhLCBiKSA9PiBhID4gYik7XHJcblxyXG4gICAgICAgIGN0LmFzc2VydChcInJlbSAxIGFyY2VkXCIsIHRpMi5yZW1vdmUodG8uYSksIHRvKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJyZW0gMVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgdG8yKTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJyZW0gMSBlbXB0eVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgbnVsbCk7XHJcblxyXG4gICAgICAgIGxldCB0aTMgPSBuZXcgQXJjdGFibGUoMC41LCBtYXhTaXplKTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpPG1heFNpemU7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0ge2E6IE1hdGgucmFuZG9tKCksIGI6IE1hdGgucmFuZG9tKCl9O1xyXG4gICAgICAgICAgICBjdC5hc3NlcnQoXCJiYXR0ZXJ5IGl0ZW0gXCIraStcIjpcIiwgISF0aTMuYWRkKGl0ZW0uYSwgaXRlbSksIGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXRlbSA9IHthOiBNYXRoLnJhbmRvbSgpLCBiOiBNYXRoLnJhbmRvbSgpfTtcclxuICAgICAgICBjdC5hc3NlcnQoXCJjb21wbGV0ZWx5IGZ1bGwgZWplY3RlZCBzb21ldGhpbmc6XCIsICEhdGkzLmFkZChpdGVtLmEsIGl0ZW0pLCB0cnVlKTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBjdC5ydW4oKTtcclxuICAgIH0pKCksIC8vIGNob3JkaW9pZFxyXG5cclxuICAgIChhc3luYyAoKT0+e2xldCBjciA9IG5ldyBUZXN0KFwiTmV0d29ya0ludGVybmFsXCIpO1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5OZXR3b3JrSW50ZXJuYWwgPSBOZXR3b3JrSW50ZXJuYWw7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLk5ldHdvcmtBZGRyZXNzID0gTmV0d29ya0FkZHJlc3M7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLk5SZXNwb25zZSA9IE5SZXNwb25zZTtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBuZXcgTmV0d29ya0ludGVybmFsKChtc2cpPT4gbmV3IE5SZXNwb25zZShcImEgcmVwbGllcyB0byBcIittc2cub3JpZ2luYWwsIG51bGwpLCBuZXcgUHJpdmF0ZUtleSgpKTtcclxuICAgICAgICBsZXQgYiA9IG5ldyBOZXR3b3JrSW50ZXJuYWwoKG1zZyk9PiBuZXcgTlJlc3BvbnNlKFwiYiByZXBsaWVzIHRvIFwiK21zZy5vcmlnaW5hbCwgbnVsbCksIG5ldyBQcml2YXRlS2V5KCkpO1xyXG4gICAgICAgIGxldCBjID0gbmV3IE5ldHdvcmtJbnRlcm5hbCgobXNnKT0+IG5ldyBOUmVzcG9uc2UoXCJjIHJlcGxpZXMgdG8gXCIrbXNnLm9yaWdpbmFsLCBudWxsKSwgbmV3IFByaXZhdGVLZXkoKSk7XHJcblxyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJuZXR3b3JrIGlzIGVtcHR5XCIsIEpTT04uc3RyaW5naWZ5KGEuYnJvYWRjYXN0KFwiQSBicm9hZGNhc3RzXCIpKSwgSlNPTi5zdHJpbmdpZnkoW10pKTtcclxuXHJcbiAgICAgICAgYS5jb21wbGV0ZShhd2FpdCBiLmFuc3dlcihhd2FpdCBhLm9mZmVyKCkpKTtcclxuICAgICAgICBiLmNvbXBsZXRlKGF3YWl0IGMuYW5zd2VyKGF3YWl0IGIub2ZmZXIoKSkpO1xyXG4gICAgICAgIGMuY29tcGxldGUoYXdhaXQgYS5hbnN3ZXIoYXdhaXQgYy5vZmZlcigpKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGEgPT4gc2V0VGltZW91dCgoKT0+YSgpLCAxMDAwKSk7XHJcblxyXG4gICAgICAgIGF3YWl0IGEucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgYi5yZWFkeTtcclxuICAgICAgICBhd2FpdCBjLnJlYWR5O1xyXG5cclxuXHJcblxyXG4gICAgICAgIGNyLmFzc2VydChcIm5ldHdvcmsgaXMgZW1wdHlcIiwgKGF3YWl0IGEuYnJvYWRjYXN0KFwiQSBicm9hZGNhc3RzXCIpKS5sZW5ndGgsIDIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY3IucnVuKCk7XHJcbiAgICB9KSgpLCAvLyBOZXR3b3JrSW50ZXJuYWxcclxuXHJcbiAgICAoYXN5bmMgKCk9PntsZXQgY3IgPSBuZXcgVGVzdChcIk5ldHdvcmtcIik7XHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLk5ldHdvcmsgPSBOZXR3b3JrO1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5OZXR3b3JrQWRkcmVzcyA9IE5ldHdvcmtBZGRyZXNzO1xyXG5cclxuICAgICAgICBjbGFzcyBUZXN0TmV0IGV4dGVuZHMgTmV0d29ya3tcclxuICAgICAgICAgICAgYmNjO1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgICAgICAgICBzdXBlcihrZXkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iY2MgPSB0aGlzLmFkZEJyb2FkY2FzdEtlcm5lbDxzdHJpbmc+KGFzeW5jIChtc2cpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXdhaXQga2V5LmdldFB1YmxpY0hhc2goKStcInNheXMgSSBSRUNFSVZFRCBUSElTIEJST0FEQ0FTVCE6IFwiK21zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5UZXN0TmV0ID0gVGVzdE5ldDtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBuZXcgVGVzdE5ldCgpO1xyXG4gICAgICAgIGxldCBiID0gbmV3IFRlc3ROZXQoKTtcclxuICAgICAgICBsZXQgYyA9IG5ldyBUZXN0TmV0KCk7XHJcbiAgICAgICAgbGV0IGQgPSBuZXcgVGVzdE5ldCgpO1xyXG5cclxuICAgICAgICBhLmNvbXBsZXRlKGF3YWl0IGIuYW5zd2VyKGF3YWl0IGEub2ZmZXIoKSkpO1xyXG4gICAgICAgIGIuY29tcGxldGUoYXdhaXQgYy5hbnN3ZXIoYXdhaXQgYi5vZmZlcigpKSk7XHJcbiAgICAgICAgYy5jb21wbGV0ZShhd2FpdCBhLmFuc3dlcihhd2FpdCBjLm9mZmVyKCkpKTtcclxuICAgICAgICBkLmNvbXBsZXRlKGF3YWl0IGMuYW5zd2VyKGF3YWl0IGQub2ZmZXIoKSkpO1xyXG5cclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShhID0+IHNldFRpbWVvdXQoKCk9PmEoKSwgMTAwMCkpO1xyXG5cclxuICAgICAgICBhd2FpdCBhLnJlYWR5O1xyXG4gICAgICAgIGF3YWl0IGIucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgYy5yZWFkeTtcclxuICAgICAgICBhd2FpdCBkLnJlYWR5O1xyXG5cclxuICAgICAgICBjci5hc3NlcnQoXCJzdWNjZXNzZnVsIGJyb2FkY2FzdCBzZW50XCIsIChhd2FpdCBkLmJjYyhcIkQgYnJvYWRjYXN0c1wiKSkubGVuZ3RoLCAxKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyLnJ1bigpO1xyXG4gICAgfSkoKSwgLy8gTmV0d29ya0ludGVybmFsXHJcblxyXG5cclxuXSkudGhlbihhID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiVGVzdGluZyBjb21wbGV0ZS5cIik7XHJcbiAgICB3aW5kb3cuY2xvc2UoKVxyXG59KS5jYXRjaChlPT57XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQ1JJVElDQUwgRkFJTFVSRSEgVW5jYXVnaHQgRXhjZXB0aW9uOiBcIixlKTtcclxuICAgIHdpbmRvdy5jbG9zZSgpXHJcbn0pO1xyXG5cclxuXHJcblxyXG4iXSwic291cmNlUm9vdCI6IiJ9