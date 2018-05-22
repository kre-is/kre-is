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

/***/ "./modules/chordoid/Chordoid.ts":
/*!**************************************!*\
  !*** ./modules/chordoid/Chordoid.ts ***!
  \**************************************/
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

/***/ "./modules/connection/Connection.ts":
/*!******************************************!*\
  !*** ./modules/connection/Connection.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const rtcconfig_1 = __webpack_require__(/*! ./rtcconfig */ "./modules/connection/rtcconfig.ts");
const Observable_1 = __webpack_require__(/*! ../tools/Observable */ "./modules/tools/Observable.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
const ConnectionError_1 = __webpack_require__(/*! ./ConnectionError */ "./modules/connection/ConnectionError.ts");
const Synchronicity_1 = __webpack_require__(/*! ../tools/Synchronicity */ "./modules/tools/Synchronicity.ts");
/**
 * Represents a connection to one peer. can contain multiple channels.
 * @property open {Promise<this>} resolves when the channels are ready
 * @property closed [Promise<this>} resolves when the connection terminates normally. Rejects on mangled messages or overflown buffers. consider banning.
 */
class Connection {
    constructor() {
        this.connectiterator = 0;
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig_1.rtcconfig);
        this.readiness = new Observable_1.Observable(false);
        this.allChannelsOpen = new Synchronicity_1.Synchronicity();
        this.open = this.allChannelsOpen.then(() => this);
        this.closed = new Future_1.Future();
    }
    /**
     * All data in string.
     * gives you a function you can send buffer messages into, promises a response.
     * uses strings, because firefox has problems with generic byte arrays. although.. who cares about firefox?
     * @param {(request: string) => Promise<string>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: string) => Promise<string>}
     */
    createChannel(onmessage, maxOpenMessages = 100) {
        if (this.readiness.get()) {
            throw "channels can only be created before starting the connection!";
        }
        let requestChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let responseChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let responseOpen = new Future_1.Future();
        let requestOpen = new Future_1.Future();
        this.allChannelsOpen.add(responseOpen);
        this.allChannelsOpen.add(requestOpen);
        let openMessages = 0;
        let self = this;
        requestChannel.onopen = () => {
            self.readiness.set(true);
            self.readiness.flush();
            requestOpen.resolve(requestChannel);
        };
        responseChannel.onopen = () => {
            responseOpen.resolve(responseChannel);
        };
        requestChannel.onmessage = (message) => {
            openMessages++;
            let data = message.data;
            let reference = data.codePointAt(0);
            if (openMessages > maxOpenMessages) {
                responseChannel.send(String.fromCodePoint(0, reference, 2, maxOpenMessages));
                openMessages--;
                return;
            }
            onmessage(data.slice(1))
                .then(rawResponse => {
                openMessages--;
                try {
                    responseChannel.send(String.fromCodePoint(reference) + rawResponse);
                }
                catch (e) {
                    responseOpen.then(_ => {
                        responseChannel.send(String.fromCodePoint(reference) + rawResponse);
                    });
                    /*.catch(_=>{ //todo: evaluate potential patch for bug #1
                        console.log(_);
                        self.close();
                    });*/
                }
            });
        };
        let callbackBuffer = new Array(maxOpenMessages).fill(null);
        /**
         * bounce all messages in the buffer
         * effectively just returns an error everywhere.
         * another layer should determine what to do with that.
         */
        let bounce = () => {
            this.rtcPeerConnection.close();
            callbackBuffer.filter(e => e).forEach(e => e(String.fromCodePoint(0, 0, 3)));
        };
        requestChannel.onclose = bounce; //todo: determine whether to close connection on bounce.
        responseChannel.onclose = bounce;
        responseChannel.onmessage = (message) => {
            let data = message.data;
            let reference = data.codePointAt(0);
            try {
                try {
                    callbackBuffer[reference](data); // remote handling happens in closure
                }
                catch (e) {
                    callbackBuffer[reference](String.fromCodePoint(0, 0, 4) + data);
                }
                //gg
            }
            catch (e) {
                self.closed.reject(ConnectionError_1.ConnectionError.FATAL_UnexpectedResponse());
                bounce();
                //probably kick and ban peer
            }
            callbackBuffer[reference] = null;
        };
        return (request) => {
            let available = callbackBuffer.map((e, idx) => e ? null : idx).filter(e => e); // naturally excludes 0
            if (!available.length)
                return Promise.reject("outbuffer full");
            let crafted = String.fromCodePoint(available[0]) + request;
            let promise = new Promise((resolve, reject) => {
                callbackBuffer[available[0]] = response => {
                    if (response.codePointAt(0)) {
                        resolve(response.slice(1));
                    }
                    reject(new ConnectionError_1.ConnectionError(response.codePointAt(2), response.slice(3)));
                };
            });
            requestChannel.send(crafted);
            return promise;
        };
    }
    offer() {
        if (this.readiness.get()) {
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.createOffer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        // promise to wait for the sdp
        return new Promise((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate)
                    return;
                accept({ sdp: this.rtcPeerConnection.localDescription.sdp });
            };
        });
    }
    answer(offer) {
        if (this.readiness.get()) {
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: offer.sdp
        }));
        this.rtcPeerConnection.createAnswer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        return new Promise((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate)
                    return;
                accept({ sdp: this.rtcPeerConnection.localDescription.sdp });
            };
        });
    }
    complete(answer) {
        if (this.readiness.get()) {
            throw "this connection is already active!";
        }
        return this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp
        }));
    }
    close() {
        // should propagate into bounce, etc.
        this.rtcPeerConnection.close();
        this.closed.resolve(this);
    }
}
exports.Connection = Connection;


/***/ }),

/***/ "./modules/connection/ConnectionError.ts":
/*!***********************************************!*\
  !*** ./modules/connection/ConnectionError.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @property local {boolean} whether the error originated locally or remotely
 */
class ConnectionError {
    constructor(type, data, reference = 0, local = true) {
        this.type = type;
        this.data = data;
        this.reference = reference;
        this.local = local;
    }
    static RETRANSMIT_LocalBufferExhausted() {
        return new ConnectionError(1);
    }
    static FATAL_RemoteBufferExhausted() {
        return new ConnectionError(2);
    }
    static ERROR_ParticipantUnreachable() {
        return new ConnectionError(3);
    }
    static FATAL_ReceivedGarbage(data) {
        return new ConnectionError(4, data);
    }
    static FATAL_UnexpectedResponse() {
        return new ConnectionError(5);
    }
    static RETRANSMIT_NetworkEmpty() {
        return new ConnectionError(6);
    }
    transmit() {
        return String.fromCodePoint(0, this.reference, this.type) + this.data;
    }
    static parse(data) {
        try {
            //remote source
            return new ConnectionError(data.codePointAt(1), data.slice(3), data.codePointAt(2), false);
        }
        catch (e) {
            return ConnectionError.FATAL_ReceivedGarbage(data);
        }
    }
}
exports.ConnectionError = ConnectionError;


/***/ }),

/***/ "./modules/connection/TypedConnection.ts":
/*!***********************************************!*\
  !*** ./modules/connection/TypedConnection.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Connection_1 = __webpack_require__(/*! ./Connection */ "./modules/connection/Connection.ts");
const ConnectionError_1 = __webpack_require__(/*! ./ConnectionError */ "./modules/connection/ConnectionError.ts");
class TypedConnection extends Connection_1.Connection {
    /**
     * Typed version of createRawChannel
     * Request type RequestT expects response type ResponseT. RequestT and ResponseT should be data transfer structures. All fields must support JSON stringify.
     * @param {(request: RequestT) => Promise<ResponseT>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: RequestT) => Promise<ResponseT>} pipe your messages into this. catch for errors, hinting you may want to retransmit your packages through other routes.
     */
    createChannel(onmessage, maxOpenMessages = 100) {
        let self = this;
        let channel = super.createChannel(request => {
            try {
                return onmessage(JSON.parse(request)).
                    then(response => JSON.stringify(response));
            }
            catch (e) {
                return Promise.reject(ConnectionError_1.ConnectionError.FATAL_ReceivedGarbage(request));
            }
        }, maxOpenMessages);
        return (request) => {
            return channel(JSON.stringify(request)).
                then(response => JSON.parse(response));
        };
    }
}
exports.TypedConnection = TypedConnection;


/***/ }),

/***/ "./modules/connection/rtcconfig.ts":
/*!*****************************************!*\
  !*** ./modules/connection/rtcconfig.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.rtcconfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};


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

/***/ "./modules/kreis/KreisInternal.ts":
/*!****************************************!*\
  !*** ./modules/kreis/KreisInternal.ts ***!
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
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const Chordoid_1 = __webpack_require__(/*! ../chordoid/Chordoid */ "./modules/chordoid/Chordoid.ts");
const TypedConnection_1 = __webpack_require__(/*! ../connection/TypedConnection */ "./modules/connection/TypedConnection.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
const ConnectionError_1 = __webpack_require__(/*! ../connection/ConnectionError */ "./modules/connection/ConnectionError.ts");
const Time_1 = __webpack_require__(/*! ../tools/Time */ "./modules/tools/Time.ts");
/**
 * @property {Promise<KreisInternal>} open - fires when the structure is connected to at least one peer, returns this instance
 */
class KreisInternal {
    constructor() {
        this.privateKey = new PrivateKey_1.PrivateKey();
        this.operative = new Future_1.Future();
        this.privateKey.sign("init")
            .then(verdoc => this.structure = new Chordoid_1.Chordoid(verdoc.key.hashed()))
            .then(() => this.operative.resolve(this));
        //note: this is guaranteed to be initialized upon use, because any acceptance also requires
        //a verification and a signature
        //note: this is not completely true, but whatever.
        this.open = new Promise(resolve => {
            this.opener = () => { resolve(); };
        }).then(() => this);
    }
    handleOffer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            let targetAddress = Chordoid_1.Chordoid.dereference(offer.data.target, offer.key.hashed());
            if (this.structure.distance(targetAddress) < offer.data.tolerance
                && this.structure.isDesirable(targetAddress)) {
                let connection = this.createConnection();
                connection.publicKey = offer.key;
                return this.privateKey.sign({
                    sdp: yield connection.answer(offer.data.sdp)
                });
            }
            else {
                try {
                    return this.structure.get(targetAddress).propagateOffer(offer);
                }
                catch (e) {
                    return Promise.reject(ConnectionError_1.ConnectionError.RETRANSMIT_NetworkEmpty());
                }
            }
        });
    }
    createConnection() {
        let connection = new KreisConnection(this);
        connection.publicKey = null;
        let self = this;
        connection.open.then(connection => {
            let ejected = this.structure.add(connection.publicKey.hashed(), connection);
            ejected && ejected.close();
            this.opener();
        });
        //** core utility
        connection.propagateOffer = connection.createChannel((rawOffer) => __awaiter(this, void 0, void 0, function* () {
            return self.handleOffer(yield PrivateKey_1.VerDoc.reconstruct(rawOffer));
        }));
        return connection;
    }
    offerConstructor(index, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            let desirable;
            if (index < 0) {
                desirable = { exponent: new Chordoid_1.Exponent(0), efficiency: 1 };
            }
            else {
                desirable = this.structure.getSuggestions()[index];
            }
            return this.privateKey.sign({
                sdp: yield connection.offer(),
                target: desirable.exponent,
                tolerance: desirable.efficiency
            });
        });
    }
    /**
     * generates an offer, for the RTC handshake.
     * @param {number} index of the desirability map. negative values make a universal offer. todo: add entropy to idx.
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    offer(index = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.operative.then();
            if (this.pendingConnection)
                throw "there is a pending connection! use reOffer instead to forget this connection";
            this.pendingConnection = this.createConnection();
            return this.offerConstructor(index, this.pendingConnection);
        });
    }
    reOffer(index = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.pendingConnection && this.pendingConnection.close();
            this.pendingConnection = null;
            return this.offer(index);
        });
    }
    /**
     * @friend KDaemon
     * @access protected
     * @see offer
     * @param {number} index
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    daemonOffer(index = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.operative.then();
            if (this.pendingDaemonConnection)
                throw "there is a pending connection! use daemonReOffer instead to forget this connection";
            this.pendingDaemonConnection = this.createConnection();
            return this.offerConstructor(index, this.pendingDaemonConnection);
        });
    }
    /**
     * @friend KDaemon
     * @access protected
     * @see reOffer
     * @param {number} index
     * @returns {Promise<VerDoc<KreisOffer>>}
     */
    daemonReOffer(index = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            this.pendingDaemonConnection && this.pendingDaemonConnection.close();
            this.pendingDaemonConnection = null;
            return this.daemonOffer(index);
        });
    }
    /**
     * @friend KDaemon
     * @access protected
     * @see complete
     * @param {RawDoc<KreisAnswer>} answer
     * @returns {Promise<Promise<void>>}
     */
    daemonComplete(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = this.pendingDaemonConnection;
            this.pendingDaemonConnection = null;
            return this.completeConnection(answer, connection);
        });
    }
    /**
     * answer from here, or from deeper within the network.
     * @param {VerDoc<KreisOffer>} offer
     * @returns {Promise<RawDoc<KreisAnswer>>}
     */
    answer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.operative.then();
            return this.handleOffer(yield PrivateKey_1.VerDoc.reconstruct(offer));
        });
    }
    /**
     * @param {RawDoc<KreisAnswer>} answer
     * @param {KreisConnection} connection
     * @returns {Promise<void>}
     */
    completeConnection(answer, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            let verAnswer = yield PrivateKey_1.VerDoc.reconstruct(answer);
            connection.publicKey = verAnswer.key;
            return connection.complete(verAnswer.data.sdp).catch(() => {
                //bad answer; try again?
                connection.close();
            });
        });
    }
    /**
     * complete a connection built with "offer";
     * @param {RawDoc<KreisAnswer>} answer
     * @returns {Promise<void>}
     */
    complete(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = this.pendingConnection;
            this.pendingConnection = null;
            return this.completeConnection(answer, connection);
        });
    }
    /**
     * @friend KreisConnection
     * @access protected
     * @returns {KreisConnection[]}
     */
    getBroadcastList() {
        return this.structure.all();
    }
    shout(arg) {
        let bcl = this.getBroadcastList();
        bcl.forEach(c => c.chat(arg));
    }
    /**
     * synchronize times with other connections.
     * @returns {Promise<{ping: number; offset: number}[]>}
     */
    sync() {
        let t0 = new Time_1.Time();
        return Promise.all(this.getBroadcastList().map(c => c.NTP(t0).then(t1 => {
            return Time_1.Time.evaluateNTP(t0, t1, t1, new Time_1.Time());
        }).catch(() => null)));
    }
}
exports.KreisInternal = KreisInternal;
class KreisConnection extends TypedConnection_1.TypedConnection {
    constructor(kreis) {
        super();
        let self = this;
        //connection.propagate = connection.createChannel<KreisOffer, KreisAnswer>();
        this.chat = this.createChannel((message) => {
            console.log(message);
            return Promise.resolve("ack: " + message);
        });
        this.NTP = this.createChannel((message) => __awaiter(this, void 0, void 0, function* () {
            return new Time_1.Time();
        }));
    }
}


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
    constructor(name, outputFunction) {
        this.tests = [];
        this.item = 0; // current item
        this.passed = 0;
        this.name = name;
        this.outputFunction = outputFunction;
    }
    pass(str, objects) {
        this.passed++;
        console.log("%c✔", 'color: green;', "(" + (++this.item) + "/" + this.tests.length + ")", str, "items: ", objects);
        return false;
    }
    fail(str, objects) {
        console.log("%c✖", 'color: red;', "(" + (++this.item) + "/" + this.tests.length + ")", str, "items: ", objects);
        return false;
    }
    assert(name, a, b, comparator = (a, b) => a === b) {
        let self = this
        this.tests.push(() => __awaiter(this, void 0, void 0, function* () {
            if (comparator(yield a, yield b)) {
                return self.pass("assert: " + name, [yield a, yield b]);
            }
            else {
                return self.fail("assert: " + name, [yield a, yield b]);
            }
        }));
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.item = 0;
            this.passed = 0;
            console.log("Starting test: " + this.name + " ...");
            yield Promise.all(this.tests.map(e => e()));
            console.log("Passed " + this.passed + "/" + this.tests.length + ". This concludes the test of " + this.name + ".");
            this.outputFunction &&
                this.outputFunction(((this.passed == this.tests.length) ? "Success!" : "Failed.")
                    + " (" + this.passed + "/" + this.tests.length + "): " + this.name + " testing complete.");
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
        super((resolve, reject) => {
            resolver = (resolution) => {
                this.state = 1;
                resolve(resolution);
            };
            rejector = (rejection) => {
                this.state = 2;
                reject(rejection);
            };
        });
        this.state = 0;
        this.resolve = resolver;
        this.reject = rejector;
        executor && new Promise(executor).then(resolver).catch(rejector);
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

/***/ "./modules/tools/Synchronicity.ts":
/*!****************************************!*\
  !*** ./modules/tools/Synchronicity.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Future_1 = __webpack_require__(/*! ./Future */ "./modules/tools/Future.ts");
/**
 * Thenable logical AND convergence of Promises.
 * unlike Promise.all, it is runtime pushable.
 * @see add
 * @see Promise.all
 * @see Future
 */
class Synchronicity extends Future_1.Future {
    /**
     * SuperExecutor acts as an optional logical OR Promise to the Synchronicity.
     * included for newpromisecapability compatibility.
     * @see add
     * @see Future
     * @see https://www.ecma-international.org/ecma-262/7.0/index.html#sec-newpromisecapability
     * @param {(resolve: (value: (PromiseLike<any> | any)) => void, reject: (reason?: any) => void) => void} superExecutor
     */
    constructor(superExecutor) {
        super(superExecutor);
        this.futures = [];
    }
    /**
     * add a promise to the convergence. when all added promises resolve, you can no longer add any.
     * @param {Promise<any>} future
     */
    add(future) {
        let self = this;
        if (!this.state) {
            this.futures.push(future);
            Promise.all(this.futures).then(a => self.responder(a)).catch(e => self.reject(e));
        }
        else {
            throw "Runtime Error: Synchronicity already converged in the past.";
        }
    }
    /**
     * todo: optimize this
     * resolves the Synchronicity only when all events resolved.
     * @param {any[]} resolutions
     */
    responder(resolutions) {
        if (resolutions.length == this.futures.length) {
            this.resolve(resolutions);
        }
    }
}
exports.Synchronicity = Synchronicity;


/***/ }),

/***/ "./modules/tools/Time.ts":
/*!*******************************!*\
  !*** ./modules/tools/Time.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Time {
    constructor(time) {
        this.millis = time && time.millis || Date.now();
    }
    static evaluateNTP(t0, t1, t2, t3) {
        return {
            ping: t3.millis - t0.millis - (t2.millis - t1.millis),
            offset: ((t1.millis - t0.millis) + (t2.millis - t3.millis)) / 2
        };
    }
}
exports.Time = Time;


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
const Chordoid_1 = __webpack_require__(/*! ./modules/chordoid/Chordoid */ "./modules/chordoid/Chordoid.ts");
const PrivateKey_1 = __webpack_require__(/*! ./modules/crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const TypedConnection_1 = __webpack_require__(/*! ./modules/connection/TypedConnection */ "./modules/connection/TypedConnection.ts");
const KreisInternal_1 = __webpack_require__(/*! ./modules/kreis/KreisInternal */ "./modules/kreis/KreisInternal.ts");
let printf = (str) => {
    var h = document.createElement("div");
    var t = document.createTextNode(str);
    h.appendChild(t);
    document.body.appendChild(h);
};
(() => __awaiter(this, void 0, void 0, function* () {
    let ct = new Test_1.Test("Chord", printf);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid_1.Chordoid.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    let ti = new Chordoid_1.Chordoid(0.5, 1);
    ct.assert("indicer", ti.ltoi(0), 0);
    ct.assert("indicer", ti.ltoi(1), 0);
    ct.assert("indicer", ti.ltoi(0.49999), 6);
    ct.assert("indicer", ti.ltoi(0.5), 14);
    ct.assert("indicer", ti.ltoi(0.50001), 22);
    let ti2 = new Chordoid_1.Chordoid(0.75, 1);
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
    let to2 = { a: 0.1109, b: 234512 };
    ct.assert("add 2 (overwrite)", ti2.add(to2.a, to2), to);
    ct.assert("fetch 2", ti2.get(to2.a), to2);
    ct.assert("suggestion order", ti2.getSuggestions()[0].efficiency, ti2.getSuggestions()[1].efficiency, (a, b) => a > b);
    ct.assert("rem 1 fail", ti2.remove(to.a), null);
    ct.assert("rem 1", ti2.remove(to2.a), to2);
    ct.assert("rem 1 empty", ti2.remove(to2.a), null);
    ct.run();
}))(); // data structure (chordioid1) test
(() => __awaiter(this, void 0, void 0, function* () {
    let cr = new Test_1.Test("Crypto", printf);
    let to = { a: 0.111, b: 234512 };
    let prk = new PrivateKey_1.PrivateKey();
    let verdoc = yield prk.sign(to);
    let reconstructed = yield PrivateKey_1.VerDoc.reconstruct(verdoc);
    cr.assert("verdoc key comparison", verdoc.key.hashed(), reconstructed.key.hashed());
    cr.assert("verdoc data comparison", JSON.stringify(verdoc.data), JSON.stringify(reconstructed.data));
    cr.run();
}))(); // crypto test
(() => __awaiter(this, void 0, void 0, function* () {
    let cn = new Test_1.Test("Connection", printf);
    class A {
    }
    class B {
    }
    let response = (m) => { return Promise.resolve({ b: m.a }); };
    let a = new TypedConnection_1.TypedConnection();
    let ac = a.createChannel(response);
    let b = new TypedConnection_1.TypedConnection();
    let bc = b.createChannel(response);
    let offer = yield a.offer();
    let answer = yield b.answer(offer);
    a.complete(answer);
    yield a.open;
    cn.assert("connection ab echo works", yield ac({ a: "hello" }).then(m => m.b), "hello");
    cn.assert("connection ba echo works", yield bc({ a: "hello" }).then(m => m.b), "hello");
    cn.run();
}))(); // connection test
(() => __awaiter(this, void 0, void 0, function* () {
    let cn = new Test_1.Test("KreisInternal", printf);
    let k = new Array(20).fill(null).map(_ => new KreisInternal_1.KreisInternal());
    let kn = new KreisInternal_1.KreisInternal();
    k.reduce((a, e) => { (() => __awaiter(this, void 0, void 0, function* () { return e.complete(yield a.answer(yield e.offer(-1))); }))(); return e; }, kn);
    //k[0].complete(await k[1].answer(await k[0].offer(-1)));
    yield k[0].open;
    k[0].shout("eyy");
    k[0].sync();
    cn.assert("kreis sync works", (yield k[0].sync()).length, 1);
    cn.run();
}))(); // kreis test


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jaG9yZG9pZC9DaG9yZG9pZC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbkVycm9yLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvY29ubmVjdGlvbi9UeXBlZENvbm5lY3Rpb24udHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jb25uZWN0aW9uL3J0Y2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMva3JlaXMvS3JlaXNJbnRlcm5hbC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rlc3QvVGVzdC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL0Z1dHVyZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL09ic2VydmFibGUudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy9TeW5jaHJvbmljaXR5LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvVGltZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL3V0ZjhidWZmZXIudHMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztB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SUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUMsQ0FBQztBQUVGLENBQUMsR0FBUSxFQUFFO0lBQ1AsSUFBSSxFQUFFLEdBQUcsSUFBSSxXQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRW5DLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ2xHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3RHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBRWxHLElBQUksRUFBRSxHQUFHLElBQUksbUJBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNDLElBQUksR0FBRyxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5QyxJQUFJLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQy9CLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcs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QyxDQUFDLEdBQUUsQ0FBQyxJQUFJLDZCQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQUksRUFBRSxHQUFHLElBQUksNkJBQWEsRUFBRSxDQUFDO0lBRTdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEdBQVEsRUFBRSx3REFBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0YseURBQXlEO0lBRXpELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVaLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU3RCxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFYixDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSIsImZpbGUiOiJ0ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vdGVzdC50c1wiKTtcbiIsImV4cG9ydCBjbGFzcyBDaG9yZG9pZDxUPntcclxuICAgIHByaXZhdGUgbG9jdXMgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFycmF5IDoge2tleSA6IG51bWJlciwgb2JqIDogVH1bXTtcclxuXHJcbiAgICAvL0ZJWE1FOiBhbXAgdXAgcHJlY2lzaW9uIHRvIDY0IGJpdDtcclxuXHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgbG9va3VwVGFibGUgPSBbLTAuNSwgLTAuMjUsIC0wLjA1NTU1NTU1NTU1NTU1NTU4LCAtMC4wMDc4MTI1LCAtMC4wMDA4MDAwMDAwMDAwMDAwMjI5LCAtMC4wMDAwNjQzMDA0MTE1MjI2MTA5LFxyXG4gICAgICAgIC0wLjAwMDAwNDI0OTkyOTg3NjEzMjI2MzUsIC0yLjM4NDE4NTc5MTAxNTYyNWUtNywgLTEuMTYxNTI4NjU2NTkwMjQ5NGUtOCwgLTQuOTk5OTk5ODU4NTkwMzQzZS0xMCxcclxuICAgICAgICAtMS45Mjc3MTkwOTU0NjI1MjEyZS0xMSwgLTYuNzI5NjE2ODYzNzY1Mzg2ZS0xMywgLTIuMTQ4MjgxNTUyNjQ5Njc4ZS0xNCwgLTYuMTA2MjI2NjM1NDM4MzYxZS0xNiwgMCxcclxuICAgICAgICA2LjEwNjIyNjYzNTQzODM2MWUtMTYsIDIuMTQ4MjgxNTUyNjQ5Njc4ZS0xNCwgNi43Mjk2MTY4NjM3NjUzODZlLTEzLCAxLjkyNzcxOTA5NTQ2MjUyMTJlLTExLFxyXG4gICAgICAgIDQuOTk5OTk5ODU4NTkwMzQzZS0xMCwgMS4xNjE1Mjg2NTY1OTAyNDk0ZS04LCAyLjM4NDE4NTc5MTAxNTYyNWUtNywgMC4wMDAwMDQyNDk5Mjk4NzYxMzIyNjM1LFxyXG4gICAgICAgIDAuMDAwMDY0MzAwNDExNTIyNjEwOSwgMC4wMDA4MDAwMDAwMDAwMDAwMjI5LCAwLjAwNzgxMjUsIDAuMDU1NTU1NTU1NTU1NTU1NTgsIDAuMjUsIDAuNV07XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgbG9jdXNJRFggPSAxNDsgLy8gcG9zaXRpb24gb2YgdGhlIGxvY3VzXHJcblxyXG4gICAgc3RhdGljIGFjY2VwdGFibGVFcnJvciA9IDFlLTE2O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbnRlciA6IG51bWJlciwgY2lyY3VtZmVyZW5jZSA6IG51bWJlciA9IDEpe1xyXG4gICAgICAgIHRoaXMubG9jdXMgPSBjZW50ZXI7XHJcbiAgICAgICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheShDaG9yZG9pZC5sb29rdXBUYWJsZS5sZW5ndGgtMSkuZmlsbChudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0Rlc2lyYWJsZShsb2NhdGlvbjogbnVtYmVyKXsgLy90b2RvOiByZWZhY3RvciB0aGlzIGludG8gXCJhZGRcIlxyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGlmKHRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWZmaWNpZW5jeSh0aGlzLmFycmF5W2lkeF0ua2V5LCBpZHgpID4gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZChsb2NhdGlvbjogbnVtYmVyLCBvYmogOiBUKSA6IFQgfCBudWxse1xyXG4gICAgICAgIGxldCBpZHggPSB0aGlzLmx0b2kobG9jYXRpb24pO1xyXG4gICAgICAgIGlmKHRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZWZmaWNpZW5jeSh0aGlzLmFycmF5W2lkeF0ua2V5LCBpZHgpID4gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpKXtcclxuICAgICAgICAgICAgICAgIC8vZWZmaWNpZW5jeSBpcyB3b3JzZSB0aGFuIGluY29taW5nXHJcbiAgICAgICAgICAgICAgICBsZXQgb2xkID0gdGhpcy5hcnJheVtpZHhdLm9iajtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXJyYXlbaWR4XSA9IHtrZXk6IGxvY2F0aW9uLCBvYmo6IG9ian07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9yZWplY3QgdGhlIG9iamVjdDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXRyaWV2ZSBjbG9zZXN0IGF2YWlsYWJsZSBvYmplY3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsb2NhdGlvblxyXG4gICAgICogQHJldHVybnMge1QgfCBudWxsfVxyXG4gICAgICovXHJcbiAgICBnZXQobG9jYXRpb246IG51bWJlcikgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuYXJyYXlbdGhpcy5sdG9pKGxvY2F0aW9uLCB0cnVlKV1cclxuICAgICAgICByZXR1cm4gKGl0ZW0gfHwgbnVsbCkgJiYgaXRlbS5vYmo7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZC5hY2NlcHRhYmxlRXJyb3Ipe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcnJheVtpZHhdID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gb2xkLm9iajtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGRlcmVmZXJlbmNlIChpZHg6IEV4cG9uZW50LCBsb2N1czogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeC52YWx1ZU9mKCldICsgbG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGxvY2F0aW9uPj0wICYmIGxvY2F0aW9uIDw9IDEsIFwibG9jYXRpb246IFwiK2xvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gKCgxICsgbG9jYXRpb24gLSB0aGlzLmxvY3VzICsgMC41KSAlIDEpIC0gMC41O1xyXG4gICAgICAgIC8vZXhwZWN0IGluIHJhbmdlIC0wLjUsIDAuNVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAobG9jYXRpb24gKyB0aGlzLmxvY3VzICsgMSApICUgMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlzdGFuY2UoYSA6IG51bWJlciwgYiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhhIC0gYiksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiICsgMSksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGIgLSBhICsgMSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZGlzdGFuY2UoYTogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UodGhpcy5sb2N1cywgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSwgZGVyZWxhdGl2aXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgbHRvaShsb2NhdGlvbiA6IG51bWJlciwgc2tpcEVtcHR5IDogYm9vbGVhbiA9IGZhbHNlKSA6IG51bWJlcnsgLy9sb2NhdGlvbiB0byBpbmRleFxyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IDE7XHJcbiAgICAgICAgbGV0IHZlcmlkZXggPSBudWxsO1xyXG4gICAgICAgIGlmKGRlcmVsYXRpdml6ZWQgPCAwKXtcclxuICAgICAgICAgICAgLy9zdGFydCB3aXRoIDBcclxuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIG1heFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlciwgZWZmaWNpZW5jeTogbnVtYmVyLCBleHBvbmVudDogRXhwb25lbnR9W119IHNvcnRlZCwgYmlnZ2VzdCB0byBzbWFsbGVzdCBnYXAuXHJcbiAgICAgKi9cclxuICAgIGdldFN1Z2dlc3Rpb25zKCkgOiB7bG9jYXRpb24gOiBudW1iZXIsIGVmZmljaWVuY3kgOiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5Lm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBleHBvbmVudDogbmV3IEV4cG9uZW50KGlkeCksXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAoaXRlbSk/IHRoaXMuZWZmaWNpZW5jeShpdGVtLmtleSwgaWR4KSA6IE1hdGguYWJzKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeF0vMiksXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5yZXJlbGF0aXZpemUoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsbCgpIDogVFtde1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFeHBvbmVudCBleHRlbmRzIE51bWJlcntcclxuICAgIGNvbnN0cnVjdG9yKGV4cG9uZW50IDogbnVtYmVyKXtcclxuICAgICAgICBpZihcclxuICAgICAgICAgICAgTWF0aC5hYnMoZXhwb25lbnQpICE9IGV4cG9uZW50IHx8XHJcbiAgICAgICAgICAgIGV4cG9uZW50IDwgMCAgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPj0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoXHJcbiAgICAgICAgKSB0aHJvdyBcImludmFsaWQgZXhwb25lbnRcIjtcclxuICAgICAgICBzdXBlcihleHBvbmVudCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge3J0Y2NvbmZpZ30gZnJvbSBcIi4vcnRjY29uZmlnXCI7XHJcbmltcG9ydCB7dXRmOERlY29kZXIsIHV0ZjhFbmNvZGVyfSBmcm9tIFwiLi4vdG9vbHMvdXRmOGJ1ZmZlclwiO1xyXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gXCIuLi90b29scy9PYnNlcnZhYmxlXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi9Db25uZWN0aW9uRXJyb3JcIjtcclxuaW1wb3J0IHtTeW5jaHJvbmljaXR5fSBmcm9tIFwiLi4vdG9vbHMvU3luY2hyb25pY2l0eVwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSVENEYXRhQ2hhbm5lbCBleHRlbmRzIEV2ZW50VGFyZ2V0e1xyXG4gICAgb25jbG9zZTogRnVuY3Rpb247XHJcbiAgICBvbmVycm9yOiBGdW5jdGlvbjtcclxuICAgIG9ubWVzc2FnZTogRnVuY3Rpb247XHJcbiAgICBvbm9wZW46IEZ1bmN0aW9uO1xyXG4gICAgY2xvc2UoKTtcclxuICAgIHNlbmQobXNnIDogc3RyaW5nIHwgQmxvYiB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3KTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgY29ubmVjdGlvbiB0byBvbmUgcGVlci4gY2FuIGNvbnRhaW4gbXVsdGlwbGUgY2hhbm5lbHMuXHJcbiAqIEBwcm9wZXJ0eSBvcGVuIHtQcm9taXNlPHRoaXM+fSByZXNvbHZlcyB3aGVuIHRoZSBjaGFubmVscyBhcmUgcmVhZHlcclxuICogQHByb3BlcnR5IGNsb3NlZCBbUHJvbWlzZTx0aGlzPn0gcmVzb2x2ZXMgd2hlbiB0aGUgY29ubmVjdGlvbiB0ZXJtaW5hdGVzIG5vcm1hbGx5LiBSZWplY3RzIG9uIG1hbmdsZWQgbWVzc2FnZXMgb3Igb3ZlcmZsb3duIGJ1ZmZlcnMuIGNvbnNpZGVyIGJhbm5pbmcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbntcclxuICAgIHByaXZhdGUgcnRjUGVlckNvbm5lY3Rpb24gOiBSVENQZWVyQ29ubmVjdGlvbjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVhZGluZXNzIDogT2JzZXJ2YWJsZTxib29sZWFuPjtcclxuICAgIHJlYWRvbmx5IG9wZW4gOiBQcm9taXNlPHRoaXM+OyAvLyBleHBvcnQgYXMgcHJvbWlzZSwgYnV0IFN5bmNocm9uaWNpdHkgaW50ZXJuYWxseVxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBhbGxDaGFubmVsc09wZW4gOiBTeW5jaHJvbmljaXR5OyAvLyBuZWNlc3NhcnkgYmVjYXVzZSBSVEMgaXMgbm9uIGRldGVybWluaXN0aWNcclxuICAgIHJlYWRvbmx5IGNsb3NlZCA6IFByb21pc2U8dGhpcz47IC8vYWNjZXB0IG9uIGNsb3NlLCByZWplY3Qgb24gbWlzYmVoYXZpb3JcclxuICAgIHByaXZhdGUgY29ubmVjdGl0ZXJhdG9yID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24ocnRjY29uZmlnKTtcclxuICAgICAgICB0aGlzLnJlYWRpbmVzcyA9IG5ldyBPYnNlcnZhYmxlPGJvb2xlYW4+KGZhbHNlKTtcclxuICAgICAgICB0aGlzLmFsbENoYW5uZWxzT3BlbiA9IG5ldyBTeW5jaHJvbmljaXR5KCk7XHJcbiAgICAgICAgdGhpcy5vcGVuID0gdGhpcy5hbGxDaGFubmVsc09wZW4udGhlbigoKT0+dGhpcyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZWQgPSBuZXcgRnV0dXJlPHRoaXM+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgZGF0YSBpbiBzdHJpbmcuXHJcbiAgICAgKiBnaXZlcyB5b3UgYSBmdW5jdGlvbiB5b3UgY2FuIHNlbmQgYnVmZmVyIG1lc3NhZ2VzIGludG8sIHByb21pc2VzIGEgcmVzcG9uc2UuXHJcbiAgICAgKiB1c2VzIHN0cmluZ3MsIGJlY2F1c2UgZmlyZWZveCBoYXMgcHJvYmxlbXMgd2l0aCBnZW5lcmljIGJ5dGUgYXJyYXlzLiBhbHRob3VnaC4uIHdobyBjYXJlcyBhYm91dCBmaXJlZm94P1xyXG4gICAgICogQHBhcmFtIHsocmVxdWVzdDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz59IG9ubWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heE9wZW5NZXNzYWdlc1xyXG4gICAgICogQHJldHVybnMgeyhyZXF1ZXN0OiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgY3JlYXRlQ2hhbm5lbChcclxuICAgICAgICBvbm1lc3NhZ2UgOiBSZXF1ZXN0RnVuY3Rpb248c3RyaW5nLCBzdHJpbmc+LFxyXG4gICAgICAgIG1heE9wZW5NZXNzYWdlcz0xMDBcclxuICAgIClcclxuICAgICAgICA6IFJlcXVlc3RGdW5jdGlvbjxzdHJpbmcsIHN0cmluZz5cclxuICAgIHtcclxuICAgICAgICBpZih0aGlzLnJlYWRpbmVzcy5nZXQoKSl7XHJcbiAgICAgICAgICAgIHRocm93IFwiY2hhbm5lbHMgY2FuIG9ubHkgYmUgY3JlYXRlZCBiZWZvcmUgc3RhcnRpbmcgdGhlIGNvbm5lY3Rpb24hXCJcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlcXVlc3RDaGFubmVsID0gKHRoaXMucnRjUGVlckNvbm5lY3Rpb24gYXMgYW55KS5jcmVhdGVEYXRhQ2hhbm5lbCh0aGlzLmNvbm5lY3RpdGVyYXRvciwge25lZ290aWF0ZWQ6IHRydWUsIGlkOiB0aGlzLmNvbm5lY3RpdGVyYXRvcisrfSk7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlQ2hhbm5lbCA9ICh0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uIGFzIGFueSkuY3JlYXRlRGF0YUNoYW5uZWwodGhpcy5jb25uZWN0aXRlcmF0b3IsIHtuZWdvdGlhdGVkOiB0cnVlLCBpZDogdGhpcy5jb25uZWN0aXRlcmF0b3IrK30pO1xyXG5cclxuICAgICAgICBsZXQgcmVzcG9uc2VPcGVuID0gbmV3IEZ1dHVyZTxSVENEYXRhQ2hhbm5lbD4oKTtcclxuICAgICAgICBsZXQgcmVxdWVzdE9wZW4gPSBuZXcgRnV0dXJlPFJUQ0RhdGFDaGFubmVsPigpO1xyXG5cclxuICAgICAgICB0aGlzLmFsbENoYW5uZWxzT3Blbi5hZGQocmVzcG9uc2VPcGVuKTtcclxuICAgICAgICB0aGlzLmFsbENoYW5uZWxzT3Blbi5hZGQocmVxdWVzdE9wZW4pO1xyXG5cclxuICAgICAgICBsZXQgb3Blbk1lc3NhZ2VzID0gMDtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJlcXVlc3RDaGFubmVsLm9ub3BlbiA9ICgpPT57XHJcbiAgICAgICAgICAgIHNlbGYucmVhZGluZXNzLnNldCh0cnVlKTtcclxuICAgICAgICAgICAgc2VsZi5yZWFkaW5lc3MuZmx1c2goKTtcclxuICAgICAgICAgICAgcmVxdWVzdE9wZW4ucmVzb2x2ZShyZXF1ZXN0Q2hhbm5lbCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVzcG9uc2VDaGFubmVsLm9ub3BlbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmVzcG9uc2VPcGVuLnJlc29sdmUocmVzcG9uc2VDaGFubmVsKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0Q2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBvcGVuTWVzc2FnZXMrKztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhIDogc3RyaW5nID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlID0gZGF0YS5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgICAgIGlmKG9wZW5NZXNzYWdlcyA+IG1heE9wZW5NZXNzYWdlcyl7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZUNoYW5uZWwuc2VuZChTdHJpbmcuZnJvbUNvZGVQb2ludCgwLHJlZmVyZW5jZSwyLG1heE9wZW5NZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgb3Blbk1lc3NhZ2VzLS07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9ubWVzc2FnZShkYXRhLnNsaWNlKDEpKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ocmF3UmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5NZXNzYWdlcy0tO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQocmVmZXJlbmNlKSArIHJhd1Jlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9Y2F0Y2ggKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZU9wZW4udGhlbihfPT57IC8vdG9kbzogZXZhbHVhdGUgZWZmaWNhY3kgb2YgdGhpcy4gdGhpcyBwYXRjaGVzIGJ1ZyBuciAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQocmVmZXJlbmNlKSArIHJhd1Jlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyouY2F0Y2goXz0+eyAvL3RvZG86IGV2YWx1YXRlIHBvdGVudGlhbCBwYXRjaCBmb3IgYnVnICMxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY2FsbGJhY2tCdWZmZXIgOiAoKHJlc3BvbnNlIDogc3RyaW5nKT0+dm9pZClbXSA9IG5ldyBBcnJheShtYXhPcGVuTWVzc2FnZXMpLmZpbGwobnVsbCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGJvdW5jZSBhbGwgbWVzc2FnZXMgaW4gdGhlIGJ1ZmZlclxyXG4gICAgICAgICAqIGVmZmVjdGl2ZWx5IGp1c3QgcmV0dXJucyBhbiBlcnJvciBldmVyeXdoZXJlLlxyXG4gICAgICAgICAqIGFub3RoZXIgbGF5ZXIgc2hvdWxkIGRldGVybWluZSB3aGF0IHRvIGRvIHdpdGggdGhhdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgYm91bmNlID0gKCkgPT57XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uY2xvc2UoKTtcclxuICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXIuZmlsdGVyKGUgPT4gZSkuZm9yRWFjaChlID0+IGUoU3RyaW5nLmZyb21Db2RlUG9pbnQoMCwwLDMpKSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdENoYW5uZWwub25jbG9zZSA9IGJvdW5jZTsgLy90b2RvOiBkZXRlcm1pbmUgd2hldGhlciB0byBjbG9zZSBjb25uZWN0aW9uIG9uIGJvdW5jZS5cclxuICAgICAgICByZXNwb25zZUNoYW5uZWwub25jbG9zZSA9IGJvdW5jZTtcclxuXHJcbiAgICAgICAgcmVzcG9uc2VDaGFubmVsLm9ubWVzc2FnZSA9IChtZXNzYWdlIDogTWVzc2FnZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhIDogc3RyaW5nID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlID0gZGF0YS5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0J1ZmZlcltyZWZlcmVuY2VdKGRhdGEpOyAvLyByZW1vdGUgaGFuZGxpbmcgaGFwcGVucyBpbiBjbG9zdXJlXHJcbiAgICAgICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbcmVmZXJlbmNlXShTdHJpbmcuZnJvbUNvZGVQb2ludCgwLDAsNCkgKyBkYXRhKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9nZ1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAoc2VsZi5jbG9zZWQgYXMgRnV0dXJlPHRoaXM+KS5yZWplY3QoQ29ubmVjdGlvbkVycm9yLkZBVEFMX1VuZXhwZWN0ZWRSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgIGJvdW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgLy9wcm9iYWJseSBraWNrIGFuZCBiYW4gcGVlclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyW3JlZmVyZW5jZV0gPSBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiAocmVxdWVzdCA6IHN0cmluZyk9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgYXZhaWxhYmxlID0gY2FsbGJhY2tCdWZmZXIubWFwKChlLCBpZHgpID0+IGUgPyBudWxsIDogaWR4KS5maWx0ZXIoZSA9PiBlKTsgLy8gbmF0dXJhbGx5IGV4Y2x1ZGVzIDBcclxuXHJcbiAgICAgICAgICAgIGlmICghYXZhaWxhYmxlLmxlbmd0aCkgcmV0dXJuIFByb21pc2UucmVqZWN0KFwib3V0YnVmZmVyIGZ1bGxcIik7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3JhZnRlZCA6IHN0cmluZyA9IFN0cmluZy5mcm9tQ29kZVBvaW50KGF2YWlsYWJsZVswXSkgKyByZXF1ZXN0O1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpPT57XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja0J1ZmZlclthdmFpbGFibGVbMF1dID0gcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmNvZGVQb2ludEF0KDApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5zbGljZSgxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgQ29ubmVjdGlvbkVycm9yKHJlc3BvbnNlLmNvZGVQb2ludEF0KDIpLCByZXNwb25zZS5zbGljZSgzKSkpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlcXVlc3RDaGFubmVsLnNlbmQoY3JhZnRlZCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgIG9mZmVyKCkgOiBQcm9taXNlPE9mZmVyPntcclxuICAgICAgICBpZih0aGlzLnJlYWRpbmVzcy5nZXQoKSl7XHJcbiAgICAgICAgICAgIHRocm93IFwidGhpcyBjb25uZWN0aW9uIGlzIGFscmVhZHkgYWN0aXZlIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLmNyZWF0ZU9mZmVyKCkudGhlbihkZXNjcmlwdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gcHJvbWlzZSB0byB3YWl0IGZvciB0aGUgc2RwXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPE9mZmVyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24ub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQoe3NkcDogdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uLnNkcH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhbnN3ZXIob2ZmZXIgOiBPZmZlcikgOiBQcm9taXNlPEFuc3dlcj57XHJcbiAgICAgICAgaWYodGhpcy5yZWFkaW5lc3MuZ2V0KCkpe1xyXG4gICAgICAgICAgICB0aHJvdyBcInRoaXMgY29ubmVjdGlvbiBpcyBhbHJlYWR5IGFjdGl2ZSFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgICAgICAgdHlwZTogXCJvZmZlclwiLFxyXG4gICAgICAgICAgICBzZHA6IG9mZmVyLnNkcFxyXG4gICAgICAgIH0pKTtcclxuICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLmNyZWF0ZUFuc3dlcigpLnRoZW4oZGVzY3JpcHRpb24gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLnNldExvY2FsRGVzY3JpcHRpb24oZGVzY3JpcHRpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxBbnN3ZXI+KChhY2NlcHQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5vbmljZWNhbmRpZGF0ZSA9IGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGFjY2VwdCh7c2RwOiB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24uc2RwfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGNvbXBsZXRlKGFuc3dlciA6IEFuc3dlcikgOiBQcm9taXNlPHZvaWQ+e1xyXG4gICAgICAgIGlmKHRoaXMucmVhZGluZXNzLmdldCgpKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJ0aGlzIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBhY3RpdmUhXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcImFuc3dlclwiLFxyXG4gICAgICAgICAgICBzZHA6IGFuc3dlci5zZHBcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICAvLyBzaG91bGQgcHJvcGFnYXRlIGludG8gYm91bmNlLCBldGMuXHJcbiAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgICh0aGlzLmNsb3NlZCBhcyBGdXR1cmU8dGhpcz4pLnJlc29sdmUodGhpcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbmludGVyZmFjZSBTRFB7c2RwOiBzdHJpbmc7fVxyXG5leHBvcnQgaW50ZXJmYWNlIE9mZmVyIGV4dGVuZHMgU0RQe1xyXG5cclxufVxyXG5leHBvcnQgaW50ZXJmYWNlIEFuc3dlciBleHRlbmRzIFNEUHtcclxuXHJcbn1cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RnVuY3Rpb248UmVxdWVzdFQsIFJlc3BvbnNlVD57XHJcbiAgICAocmVxdWVzdCA6UmVxdWVzdFQpIDogUHJvbWlzZTxSZXNwb25zZVQ+XHJcbn0iLCIvKipcclxuICogQHByb3BlcnR5IGxvY2FsIHtib29sZWFufSB3aGV0aGVyIHRoZSBlcnJvciBvcmlnaW5hdGVkIGxvY2FsbHkgb3IgcmVtb3RlbHlcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICB0eXBlOiBudW1iZXI7XHJcbiAgICBkYXRhOiBzdHJpbmc7XHJcbiAgICByZWZlcmVuY2U6IG51bWJlcjtcclxuICAgIGxvY2FsOiBib29sZWFuO1xyXG4gICAgY29uc3RydWN0b3IodHlwZSA6IG51bWJlciwgZGF0YSA/OiBzdHJpbmcsIHJlZmVyZW5jZSA9IDAsIGxvY2FsID0gdHJ1ZSl7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG4gICAgICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBSRVRSQU5TTUlUX0xvY2FsQnVmZmVyRXhoYXVzdGVkKCk6IENvbm5lY3Rpb25FcnJvcntcclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcigxKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBGQVRBTF9SZW1vdGVCdWZmZXJFeGhhdXN0ZWQoKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDIpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIEVSUk9SX1BhcnRpY2lwYW50VW5yZWFjaGFibGUoKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDMpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIEZBVEFMX1JlY2VpdmVkR2FyYmFnZShkYXRhIDogc3RyaW5nKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDQsIGRhdGEpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIEZBVEFMX1VuZXhwZWN0ZWRSZXNwb25zZSgpOiBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uRXJyb3IoNSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgUkVUUkFOU01JVF9OZXR3b3JrRW1wdHkoKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDYpO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zbWl0KCk6IHN0cmluZ3tcclxuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoMCx0aGlzLnJlZmVyZW5jZSwgdGhpcy50eXBlKSArIHRoaXMuZGF0YTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBwYXJzZShkYXRhOiBzdHJpbmcpOiBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL3JlbW90ZSBzb3VyY2VcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uRXJyb3IoZGF0YS5jb2RlUG9pbnRBdCgxKSwgZGF0YS5zbGljZSgzKSwgZGF0YS5jb2RlUG9pbnRBdCgyKSwgZmFsc2UpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25FcnJvci5GQVRBTF9SZWNlaXZlZEdhcmJhZ2UoZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG5cclxuXHJcbiIsImltcG9ydCB7Q29ubmVjdGlvbiwgUmVxdWVzdEZ1bmN0aW9ufSBmcm9tIFwiLi9Db25uZWN0aW9uXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi9Db25uZWN0aW9uRXJyb3JcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUeXBlZENvbm5lY3Rpb24gZXh0ZW5kcyBDb25uZWN0aW9ue1xyXG4gICAgLyoqXHJcbiAgICAgKiBUeXBlZCB2ZXJzaW9uIG9mIGNyZWF0ZVJhd0NoYW5uZWxcclxuICAgICAqIFJlcXVlc3QgdHlwZSBSZXF1ZXN0VCBleHBlY3RzIHJlc3BvbnNlIHR5cGUgUmVzcG9uc2VULiBSZXF1ZXN0VCBhbmQgUmVzcG9uc2VUIHNob3VsZCBiZSBkYXRhIHRyYW5zZmVyIHN0cnVjdHVyZXMuIEFsbCBmaWVsZHMgbXVzdCBzdXBwb3J0IEpTT04gc3RyaW5naWZ5LlxyXG4gICAgICogQHBhcmFtIHsocmVxdWVzdDogUmVxdWVzdFQpID0+IFByb21pc2U8UmVzcG9uc2VUPn0gb25tZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4T3Blbk1lc3NhZ2VzXHJcbiAgICAgKiBAcmV0dXJucyB7KHJlcXVlc3Q6IFJlcXVlc3RUKSA9PiBQcm9taXNlPFJlc3BvbnNlVD59IHBpcGUgeW91ciBtZXNzYWdlcyBpbnRvIHRoaXMuIGNhdGNoIGZvciBlcnJvcnMsIGhpbnRpbmcgeW91IG1heSB3YW50IHRvIHJldHJhbnNtaXQgeW91ciBwYWNrYWdlcyB0aHJvdWdoIG90aGVyIHJvdXRlcy5cclxuICAgICAqL1xyXG4gICAgY3JlYXRlQ2hhbm5lbDxSZXF1ZXN0VCxSZXNwb25zZVQ+KG9ubWVzc2FnZSA6IFJlcXVlc3RGdW5jdGlvbjxSZXF1ZXN0VCwgUmVzcG9uc2VUPixtYXhPcGVuTWVzc2FnZXM9MTAwKSA6IFJlcXVlc3RGdW5jdGlvbjxSZXF1ZXN0VCwgUmVzcG9uc2VUPntcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBjaGFubmVsID0gc3VwZXIuY3JlYXRlQ2hhbm5lbChyZXF1ZXN0ID0+e1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb25tZXNzYWdlKEpTT04ucGFyc2UocmVxdWVzdCkpLlxyXG4gICAgICAgICAgICAgICAgdGhlbihyZXNwb25zZSA9PiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoQ29ubmVjdGlvbkVycm9yLkZBVEFMX1JlY2VpdmVkR2FyYmFnZShyZXF1ZXN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBtYXhPcGVuTWVzc2FnZXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gKHJlcXVlc3QpPT57XHJcbiAgICAgICAgICAgIHJldHVybiBjaGFubmVsKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKS5cclxuICAgICAgICAgICAgdGhlbihyZXNwb25zZSA9PiBKU09OLnBhcnNlKHJlc3BvbnNlKSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSIsImV4cG9ydCBsZXQgcnRjY29uZmlnID0ge1xyXG4gICAgaWNlU2VydmVyczogW3t1cmxzOiBcInN0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDJcIn1dXHJcbn07XHJcblxyXG4iLCJpbXBvcnQge3V0ZjhEZWNvZGVyLCB1dGY4RW5jb2Rlcn0gZnJvbSBcIi4uL3Rvb2xzL3V0ZjhidWZmZXJcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUHJpdmF0ZUtleSB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZUxpa2U8YW55PjtcclxuICAgIHByaXZhdGUgcHJpdmF0ZUtleSA6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgcHVibGljS2V5IDogUHVibGljS2V5O1xyXG4gICAgcmVhZG9ubHkgdmVyc2lvbiA9IDI7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucHVibGljS2V5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgICAgICBuYW1lZEN1cnZlOiBcIlAtMzg0XCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBbXCJzaWduXCIsIFwidmVyaWZ5XCJdXHJcbiAgICAgICAgICAgICkudGhlbihrZXlzID0+IHsgLy9rZXlzOiB7cHJpdmF0ZUtleTogQ3J5cHRvS2V5LCBwdWJsaWNLZXk6IENyeXB0b0tleX1cclxuICAgICAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSA9IGtleXMucHJpdmF0ZUtleTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIFwiandrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdWJsaWNLZXlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oandrID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGljS2V5ID0gbmV3IFB1YmxpY0tleShqd2spO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVibGljS2V5LnJlYWR5O1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcbiAgICBhc3luYyBzaWduPFQ+KG9iaiA6IFQpIDogUHJvbWlzZTxWZXJEb2M8VD4+IHtcclxuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5O1xyXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcclxuICAgICAgICBsZXQgcHVrID0gdGhpcy5wdWJsaWNLZXkudG9KU09OKCk7XHJcbiAgICAgICAgbGV0IGhlYWRlciA9IFN0cmluZy5mcm9tQ29kZVBvaW50KHRoaXMudmVyc2lvbiwgcHVrLmxlbmd0aCwgZGF0YS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBzaWduYWJsZSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpO1xyXG5cclxuICAgICAgICBsZXQgc2lnYnVmZmVyID0gYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuc2lnbihcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wcml2YXRlS2V5LFxyXG4gICAgICAgICAgICBzaWduYWJsZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxldCBjaGVja3NtID0gdXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSkucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG4gICAgICAgIGxldCB1ZnQgPSAgbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKTtcclxuICAgICAgICBsZXQgY2hlYzIgPSBuZXcgVWludDhBcnJheShzaWdidWZmZXIpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuXHJcbiAgICAgICAgbGV0IHZkID0gbmV3IFZlckRvYzxUPigpO1xyXG4gICAgICAgIHZkLm9yaWdpbmFsID0gaGVhZGVyK3B1aytkYXRhK1N0cmluZy5mcm9tQ29kZVBvaW50KC4uLm5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcikpO1xyXG4gICAgICAgIHZkLmtleSA9IHRoaXMucHVibGljS2V5O1xyXG4gICAgICAgIHZkLmRhdGEgPSBvYmo7XHJcbiAgICAgICAgdmQuc2lnbmF0dXJlID0gSlNPTi5zdHJpbmdpZnkobmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKSk7XHJcblxyXG4gICAgICAgIGxldCBrdSA9IHV0ZjhFbmNvZGVyLmVuY29kZSh2ZC5vcmlnaW5hbCk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJEb2MgREFPXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmF3RG9jPFQ+e1xyXG4gICAgb3JpZ2luYWwgOiBzdHJpbmc7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVmVyRG9jPFQ+IGV4dGVuZHMgUmF3RG9jPFQ+e1xyXG4gICAgZGF0YTogVDtcclxuICAgIGtleTogUHVibGljS2V5O1xyXG4gICAgc2lnbmF0dXJlOiBzdHJpbmc7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmVjb25zdHJ1Y3Q8VD4ocmF3RG9jIDogUmF3RG9jPFQ+KSA6IFByb21pc2U8VmVyRG9jPFQ+PntcclxuICAgICAgICBsZXQgdmVyc2lvbiA9IHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0gcmF3RG9jLm9yaWdpbmFsLnN1YnN0cmluZygwLDMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHB1ayA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMywgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDEpKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gcmF3RG9jLm9yaWdpbmFsLnN1YnN0cigzICsgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDEpLCByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMikpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNpZyA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMyArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IGF3YWl0IG5ldyBQdWJsaWNLZXkoXHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVrXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKS5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICAgICAgICAgIGxldCB1ZnQgPSAgdXRmOEVuY29kZXIuZW5jb2RlKHNpZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hlYzIgPSB1dGY4RW5jb2Rlci5lbmNvZGUoc2lnKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQga2V5LnZlcmlmeSh1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKSwgbmV3IFVpbnQ4QXJyYXkoc2lnLnNwbGl0KCcnKS5tYXAoYyA9PiBjLmNvZGVQb2ludEF0KDApKSkpXHJcbiAgICAgICAgICAgICAgICApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5zaWduYXR1cmUgPSBzaWc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQua2V5ID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLm9yaWdpbmFsID0gcmF3RG9jLm9yaWdpbmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2ZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJiYWQgZG9jdW1lbnRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFByb21pc2UucmVqZWN0KFwidmVyc2lvbiB1bnN1cHBvcnRlZDogXCIrdmVyc2lvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBoYXNoIFAtMzg0IFNQS0kgaW50byAoMCwxKSBmbG9hdFxyXG5mdW5jdGlvbiBTUEtJdG9OdW1lcmljKHNwa2k6IEFycmF5QnVmZmVyKSA6IG51bWJlciB7XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc3BraSkuXHJcbiAgICAgICAgc2xpY2UoLTk2KS5cclxuICAgICAgICByZXZlcnNlKCkuXHJcbiAgICAgICAgcmVkdWNlKChhLGUsaSk9PmErZSpNYXRoLnBvdygyNTYsaSksIDApIC9cclxuICAgICAgICBNYXRoLnBvdygyNTYsIDk2KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFB1YmxpY0tleSB7XHJcbiAgICBwcml2YXRlIHB1YmxpY0NyeXB0b0tleTogQ3J5cHRvS2V5O1xyXG4gICAgcHJpdmF0ZSBmbG9hdGluZzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBqd2s6IEpzb25XZWJLZXk7XHJcbiAgICByZWFkeTtcclxuICAgIGNvbnN0cnVjdG9yKGp3azogSnNvbldlYktleSl7XHJcbiAgICAgICAgbGV0IHByb3RvSldLID0ge1wiY3J2XCI6XCJQLTM4NFwiLCBcImV4dFwiOnRydWUsIFwia2V5X29wc1wiOltcInZlcmlmeVwiXSwgXCJrdHlcIjpcIkVDXCIsIFwieFwiOmp3a1tcInhcIl0sIFwieVwiOmp3a1tcInlcIl19O1xyXG4gICAgICAgIHRoaXMuZmxvYXRpbmcgPSBOYU47XHJcbiAgICAgICAgdGhpcy5qd2sgPSBwcm90b0pXSztcclxuICAgICAgICB0aGlzLnJlYWR5ID0gd2luZG93LmNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxyXG4gICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICB0aGlzLmp3ayxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICBbXCJ2ZXJpZnlcIl1cclxuICAgICAgICApLnRoZW4ocHVibGljQ3J5cHRvS2V5ID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXkgPSBwdWJsaWNDcnlwdG9LZXk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KFxyXG4gICAgICAgICAgICAgICAgXCJzcGtpXCIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0NyeXB0b0tleVxyXG4gICAgICAgICAgICApLnRoZW4oc3BraSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsb2F0aW5nID0gU1BLSXRvTnVtZXJpYyhzcGtpKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KS50aGVuKCgpPT50aGlzKTtcclxuICAgIH1cclxuICAgIGhhc2hlZCgpe1xyXG4gICAgICAgIGlmKGlzTmFOKHRoaXMuZmxvYXRpbmcpKSB0aHJvdyBFcnJvcihcIk5vdCBSZWFkeS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmc7XHJcbiAgICB9XHJcbiAgICB0b0pTT04oKXtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1wieFwiOiB0aGlzLmp3a1tcInhcIl0sIFwieVwiOiB0aGlzLmp3a1tcInlcIl19KTtcclxuICAgIH1cclxuICAgIHZlcmlmeShkYXRhOiBVaW50OEFycmF5LCBzaWduYXR1cmU6IEFycmF5QnVmZmVyKTogUHJvbWlzZUxpa2U8Ym9vbGVhbj57XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLnZlcmlmeShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJFQ0RTQVwiLFxyXG4gICAgICAgICAgICAgICAgaGFzaDoge25hbWU6IFwiU0hBLTM4NFwifSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXksXHJcbiAgICAgICAgICAgIHNpZ25hdHVyZSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZnJvbVN0cmluZyhqd2tzdHJpbmc6IHN0cmluZyk6IFB1YmxpY0tleXtcclxuICAgICAgICByZXR1cm4gbmV3IFB1YmxpY0tleShKU09OLnBhcnNlKGp3a3N0cmluZykpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtQcml2YXRlS2V5LCBQdWJsaWNLZXksIFJhd0RvYywgVmVyRG9jfSBmcm9tIFwiLi4vY3J5cHRvL1ByaXZhdGVLZXlcIjtcclxuaW1wb3J0IHtBbnN3ZXIsIENvbm5lY3Rpb24sIE9mZmVyLCBSZXF1ZXN0RnVuY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uL0Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtDaG9yZG9pZCwgRXhwb25lbnR9IGZyb20gXCIuLi9jaG9yZG9pZC9DaG9yZG9pZFwiO1xyXG5pbXBvcnQge1R5cGVkQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vVHlwZWRDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vY29ubmVjdGlvbi9Db25uZWN0aW9uRXJyb3JcIjtcclxuaW1wb3J0IHtUaW1lfSBmcm9tIFwiLi4vdG9vbHMvVGltZVwiO1xyXG5cclxuLyoqXHJcbiAqIEBwcm9wZXJ0eSB7UHJvbWlzZTxLcmVpc0ludGVybmFsPn0gb3BlbiAtIGZpcmVzIHdoZW4gdGhlIHN0cnVjdHVyZSBpcyBjb25uZWN0ZWQgdG8gYXQgbGVhc3Qgb25lIHBlZXIsIHJldHVybnMgdGhpcyBpbnN0YW5jZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEtyZWlzSW50ZXJuYWx7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5OiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBwcml2YXRlS2V5IDogUHJpdmF0ZUtleTtcclxuICAgIHByaXZhdGUgcGVuZGluZ0Nvbm5lY3Rpb24gOiBLcmVpc0Nvbm5lY3Rpb24gfCBudWxsO1xyXG4gICAgcHJpdmF0ZSBwZW5kaW5nRGFlbW9uQ29ubmVjdGlvbiA6IEtyZWlzQ29ubmVjdGlvbiB8IG51bGw7XHJcbiAgICBwcml2YXRlIHN0cnVjdHVyZTogQ2hvcmRvaWQ8S3JlaXNDb25uZWN0aW9uPjtcclxuICAgIHJlYWRvbmx5IG9wZW46IFByb21pc2U8dGhpcz47XHJcbiAgICBwcml2YXRlIG9wZW5lcjogKCk9PnZvaWQ7IC8vIHJlc29sdmVzIFwib3BlbnNcIjtcclxuICAgIHByaXZhdGUgb3BlcmF0aXZlOiBGdXR1cmU8dGhpcz47IC8vIHdoZW4gdGhlIGRhdGFzdHJ1Y3R1cmUgaXMgcmVhZHk7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZUtleSA9IG5ldyBQcml2YXRlS2V5KCk7XHJcbiAgICAgICAgdGhpcy5vcGVyYXRpdmUgPSBuZXcgRnV0dXJlPHRoaXM+KCk7XHJcbiAgICAgICAgdGhpcy5wcml2YXRlS2V5LnNpZ24oXCJpbml0XCIpXHJcbiAgICAgICAgICAgIC50aGVuKHZlcmRvYyA9PlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdHJ1Y3R1cmUgPSBuZXcgQ2hvcmRvaWQ8S3JlaXNDb25uZWN0aW9uPih2ZXJkb2Mua2V5Lmhhc2hlZCgpKSlcclxuICAgICAgICAgICAgLnRoZW4oKCk9PiB0aGlzLm9wZXJhdGl2ZS5yZXNvbHZlKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy9ub3RlOiB0aGlzIGlzIGd1YXJhbnRlZWQgdG8gYmUgaW5pdGlhbGl6ZWQgdXBvbiB1c2UsIGJlY2F1c2UgYW55IGFjY2VwdGFuY2UgYWxzbyByZXF1aXJlc1xyXG4gICAgICAgIC8vYSB2ZXJpZmljYXRpb24gYW5kIGEgc2lnbmF0dXJlXHJcbiAgICAgICAgLy9ub3RlOiB0aGlzIGlzIG5vdCBjb21wbGV0ZWx5IHRydWUsIGJ1dCB3aGF0ZXZlci5cclxuICAgICAgICB0aGlzLm9wZW4gPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZXIgPSAoKT0+e3Jlc29sdmUoKX07XHJcbiAgICAgICAgfSkudGhlbigoKT0+dGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVPZmZlcihvZmZlciA6IFZlckRvYzxLcmVpc09mZmVyPikgOiBQcm9taXNlPFJhd0RvYzxLcmVpc0Fuc3dlcj4+e1xyXG4gICAgICAgIGxldCB0YXJnZXRBZGRyZXNzID0gQ2hvcmRvaWQuZGVyZWZlcmVuY2Uob2ZmZXIuZGF0YS50YXJnZXQsIG9mZmVyLmtleS5oYXNoZWQoKSk7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB0aGlzLnN0cnVjdHVyZS5kaXN0YW5jZSh0YXJnZXRBZGRyZXNzKSA8IG9mZmVyLmRhdGEudG9sZXJhbmNlXHJcbiAgICAgICAgICAgICYmIHRoaXMuc3RydWN0dXJlLmlzRGVzaXJhYmxlKHRhcmdldEFkZHJlc3MpXHJcbiAgICAgICAgKXtcclxuICAgICAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oKTtcclxuICAgICAgICAgICAgY29ubmVjdGlvbi5wdWJsaWNLZXkgPSBvZmZlci5rZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVLZXkuc2lnbjxLcmVpc0Fuc3dlcj4oe1xyXG4gICAgICAgICAgICAgICAgc2RwOiBhd2FpdCBjb25uZWN0aW9uLmFuc3dlcihvZmZlci5kYXRhLnNkcClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RydWN0dXJlLmdldCh0YXJnZXRBZGRyZXNzKS5wcm9wYWdhdGVPZmZlcihvZmZlcik7XHJcbiAgICAgICAgICAgIH1jYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KENvbm5lY3Rpb25FcnJvci5SRVRSQU5TTUlUX05ldHdvcmtFbXB0eSgpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUNvbm5lY3Rpb24oKSA6IEtyZWlzQ29ubmVjdGlvbntcclxuICAgICAgICBsZXQgY29ubmVjdGlvbiA9IG5ldyBLcmVpc0Nvbm5lY3Rpb24odGhpcyk7XHJcbiAgICAgICAgY29ubmVjdGlvbi5wdWJsaWNLZXkgPSBudWxsO1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgY29ubmVjdGlvbi5vcGVuLnRoZW4oY29ubmVjdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGxldCBlamVjdGVkID0gdGhpcy5zdHJ1Y3R1cmUuYWRkKGNvbm5lY3Rpb24ucHVibGljS2V5Lmhhc2hlZCgpLGNvbm5lY3Rpb24pO1xyXG4gICAgICAgICAgICBlamVjdGVkICYmIGVqZWN0ZWQuY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8qKiBjb3JlIHV0aWxpdHlcclxuICAgICAgICBjb25uZWN0aW9uLnByb3BhZ2F0ZU9mZmVyID0gY29ubmVjdGlvbi5jcmVhdGVDaGFubmVsPFJhd0RvYzxLcmVpc09mZmVyPiwgUmF3RG9jPEtyZWlzQW5zd2VyPj4oXHJcbiAgICAgICAgICAgIGFzeW5jIChyYXdPZmZlcik9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmhhbmRsZU9mZmVyKGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdChyYXdPZmZlcikpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgb2ZmZXJDb25zdHJ1Y3RvcihpbmRleCwgY29ubmVjdGlvbiA6IEtyZWlzQ29ubmVjdGlvbikgOiBQcm9taXNlPFZlckRvYzxLcmVpc09mZmVyPj57XHJcbiAgICAgICAgbGV0IGRlc2lyYWJsZTtcclxuICAgICAgICBpZihpbmRleCA8IDApe1xyXG4gICAgICAgICAgICBkZXNpcmFibGUgPSB7ZXhwb25lbnQ6IG5ldyBFeHBvbmVudCgwKSwgZWZmaWNpZW5jeTogMX07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGVzaXJhYmxlID0gdGhpcy5zdHJ1Y3R1cmUuZ2V0U3VnZ2VzdGlvbnMoKVtpbmRleF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlS2V5LnNpZ248S3JlaXNPZmZlcj4oe1xyXG4gICAgICAgICAgICBzZHA6IGF3YWl0IGNvbm5lY3Rpb24ub2ZmZXIoKSxcclxuICAgICAgICAgICAgdGFyZ2V0OiBkZXNpcmFibGUuZXhwb25lbnQsXHJcbiAgICAgICAgICAgIHRvbGVyYW5jZTogZGVzaXJhYmxlLmVmZmljaWVuY3lcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdlbmVyYXRlcyBhbiBvZmZlciwgZm9yIHRoZSBSVEMgaGFuZHNoYWtlLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IG9mIHRoZSBkZXNpcmFiaWxpdHkgbWFwLiBuZWdhdGl2ZSB2YWx1ZXMgbWFrZSBhIHVuaXZlcnNhbCBvZmZlci4gdG9kbzogYWRkIGVudHJvcHkgdG8gaWR4LlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgb2ZmZXIoaW5kZXggPSAwKSA6IFByb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+PntcclxuICAgICAgICBhd2FpdCB0aGlzLm9wZXJhdGl2ZS50aGVuKCk7XHJcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ0Nvbm5lY3Rpb24pIHRocm93IFwidGhlcmUgaXMgYSBwZW5kaW5nIGNvbm5lY3Rpb24hIHVzZSByZU9mZmVyIGluc3RlYWQgdG8gZm9yZ2V0IHRoaXMgY29ubmVjdGlvblwiO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb24gPSB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2ZmZXJDb25zdHJ1Y3RvcihpbmRleCwgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVPZmZlcihpbmRleCA9IDApIDogUHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+e1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb24gJiYgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZmVyKGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBmcmllbmQgS0RhZW1vblxyXG4gICAgICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuICAgICAqIEBzZWUgb2ZmZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZGFlbW9uT2ZmZXIoaW5kZXggPSAwKSA6IFByb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+PntcclxuICAgICAgICBhd2FpdCB0aGlzLm9wZXJhdGl2ZS50aGVuKCk7XHJcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb24pIHRocm93IFwidGhlcmUgaXMgYSBwZW5kaW5nIGNvbm5lY3Rpb24hIHVzZSBkYWVtb25SZU9mZmVyIGluc3RlYWQgdG8gZm9yZ2V0IHRoaXMgY29ubmVjdGlvblwiO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb24gPSB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2ZmZXJDb25zdHJ1Y3RvcihpbmRleCwgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZnJpZW5kIEtEYWVtb25cclxuICAgICAqIEBhY2Nlc3MgcHJvdGVjdGVkXHJcbiAgICAgKiBAc2VlIHJlT2ZmZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZGFlbW9uUmVPZmZlcihpbmRleCA9IDApe1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb24gJiYgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhZW1vbk9mZmVyKGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBmcmllbmQgS0RhZW1vblxyXG4gICAgICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuICAgICAqIEBzZWUgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7UmF3RG9jPEtyZWlzQW5zd2VyPn0gYW5zd2VyXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxQcm9taXNlPHZvaWQ+Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZGFlbW9uQ29tcGxldGUoYW5zd2VyIDogUmF3RG9jPEtyZWlzQW5zd2VyPil7XHJcbiAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSB0aGlzLnBlbmRpbmdEYWVtb25Db25uZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlQ29ubmVjdGlvbihhbnN3ZXIsIGNvbm5lY3Rpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYW5zd2VyIGZyb20gaGVyZSwgb3IgZnJvbSBkZWVwZXIgd2l0aGluIHRoZSBuZXR3b3JrLlxyXG4gICAgICogQHBhcmFtIHtWZXJEb2M8S3JlaXNPZmZlcj59IG9mZmVyXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxSYXdEb2M8S3JlaXNBbnN3ZXI+Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgYW5zd2VyKG9mZmVyIDogUmF3RG9jPEtyZWlzT2ZmZXI+KSA6IFByb21pc2U8UmF3RG9jPEtyZWlzQW5zd2VyPj57XHJcbiAgICAgICAgYXdhaXQgdGhpcy5vcGVyYXRpdmUudGhlbigpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVPZmZlcihhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3Qob2ZmZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7UmF3RG9jPEtyZWlzQW5zd2VyPn0gYW5zd2VyXHJcbiAgICAgKiBAcGFyYW0ge0tyZWlzQ29ubmVjdGlvbn0gY29ubmVjdGlvblxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNvbXBsZXRlQ29ubmVjdGlvbihhbnN3ZXIgOiBSYXdEb2M8S3JlaXNBbnN3ZXI+LCBjb25uZWN0aW9uIDogS3JlaXNDb25uZWN0aW9uKXtcclxuICAgICAgICBsZXQgdmVyQW5zd2VyID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0KGFuc3dlcik7XHJcbiAgICAgICAgY29ubmVjdGlvbi5wdWJsaWNLZXkgPSB2ZXJBbnN3ZXIua2V5O1xyXG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uLmNvbXBsZXRlKHZlckFuc3dlci5kYXRhLnNkcCkuY2F0Y2goKCk9PntcclxuICAgICAgICAgICAgLy9iYWQgYW5zd2VyOyB0cnkgYWdhaW4/XHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29tcGxldGUgYSBjb25uZWN0aW9uIGJ1aWx0IHdpdGggXCJvZmZlclwiO1xyXG4gICAgICogQHBhcmFtIHtSYXdEb2M8S3JlaXNBbnN3ZXI+fSBhbnN3ZXJcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBjb21wbGV0ZShhbnN3ZXIgOiBSYXdEb2M8S3JlaXNBbnN3ZXI+KSA6IFByb21pc2U8dm9pZD57XHJcbiAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSB0aGlzLnBlbmRpbmdDb25uZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlQ29ubmVjdGlvbihhbnN3ZXIsIGNvbm5lY3Rpb24pO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZnJpZW5kIEtyZWlzQ29ubmVjdGlvblxyXG4gICAgICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuICAgICAqIEByZXR1cm5zIHtLcmVpc0Nvbm5lY3Rpb25bXX1cclxuICAgICAqL1xyXG4gICAgZ2V0QnJvYWRjYXN0TGlzdCgpIDogS3JlaXNDb25uZWN0aW9uW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0cnVjdHVyZS5hbGwoKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHNob3V0KGFyZyA6IHN0cmluZyl7XHJcbiAgICAgICAgbGV0IGJjbCA9IHRoaXMuZ2V0QnJvYWRjYXN0TGlzdCgpO1xyXG4gICAgICAgIGJjbC5mb3JFYWNoKGMgPT4gYy5jaGF0KGFyZykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3luY2hyb25pemUgdGltZXMgd2l0aCBvdGhlciBjb25uZWN0aW9ucy5cclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHtwaW5nOiBudW1iZXI7IG9mZnNldDogbnVtYmVyfVtdPn1cclxuICAgICAqL1xyXG4gICAgc3luYygpIDogUHJvbWlzZTx7cGluZzogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciwgZXJyb3I6IG51bWJlcn1bXT4ge1xyXG4gICAgICAgIGxldCB0MCA9IG5ldyBUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxyXG4gICAgICAgICAgICB0aGlzLmdldEJyb2FkY2FzdExpc3QoKS5tYXAoXHJcbiAgICAgICAgICAgICAgICBjID0+IGMuTlRQKHQwKS50aGVuKHQxID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVGltZS5ldmFsdWF0ZU5UUCh0MCwgdDEsIHQxLCBuZXcgVGltZSgpKVxyXG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKCk9Pm51bGwpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEtyZWlzQ29ubmVjdGlvbiBleHRlbmRzIFR5cGVkQ29ubmVjdGlvbntcclxuXHJcbiAgICBwaW5nIDogbnVtYmVyO1xyXG4gICAgdGltZU9mZnNldCA6IG51bWJlcjtcclxuICAgIHRpbWVFcnJvcjogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpY0tleSA6IFB1YmxpY0tleTtcclxuICAgIHByb3BhZ2F0ZU9mZmVyIDogUmVxdWVzdEZ1bmN0aW9uPFJhd0RvYzxLcmVpc09mZmVyPiwgUmF3RG9jPEtyZWlzQW5zd2VyPj47IC8vcmVzZXJ2ZWQgZm9yIEtyZWlzSW50ZXJuYWxcclxuXHJcbiAgICBjaGF0IDogUmVxdWVzdEZ1bmN0aW9uPHN0cmluZywgc3RyaW5nPjsgLy90b2RvOiByZW1vdmUuXHJcbiAgICBOVFAgOiBSZXF1ZXN0RnVuY3Rpb248VGltZSwgVGltZT47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioa3JlaXMgOiBLcmVpc0ludGVybmFsKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy9jb25uZWN0aW9uLnByb3BhZ2F0ZSA9IGNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbDxLcmVpc09mZmVyLCBLcmVpc0Fuc3dlcj4oKTtcclxuICAgICAgICB0aGlzLmNoYXQgPSB0aGlzLmNyZWF0ZUNoYW5uZWw8c3RyaW5nLCBzdHJpbmc+KFxyXG4gICAgICAgICAgICAobWVzc2FnZSk9PntcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcImFjazogXCIrbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLk5UUCA9IHRoaXMuY3JlYXRlQ2hhbm5lbDxUaW1lLCBUaW1lPihcclxuICAgICAgICAgICAgYXN5bmMgKG1lc3NhZ2UpPT57XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRpbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG5cclxuICAgIH1cclxufVxyXG5cclxuaW50ZXJmYWNlIEtyZWlzT2ZmZXIge1xyXG4gICAgc2RwIDogT2ZmZXI7XHJcbiAgICB0YXJnZXQ6IEV4cG9uZW50O1xyXG4gICAgdG9sZXJhbmNlOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEtyZWlzQW5zd2VyIHtcclxuICAgIHNkcCA6IEFuc3dlcjtcclxufSIsImV4cG9ydCBjbGFzcyBUZXN0e1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHRlc3RzIDogKCgpPT5Qcm9taXNlPGJvb2xlYW4+KVtdID0gW107XHJcbiAgICBwcml2YXRlIGl0ZW0gOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGl0ZW1cclxuICAgIHByaXZhdGUgcGFzc2VkIDogbnVtYmVyID0gMDtcclxuICAgIG91dHB1dEZ1bmN0aW9uIDogKG91dHB1dCA6IHN0cmluZyk9PnZvaWQ7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lIDogc3RyaW5nLCBvdXRwdXRGdW5jdGlvbiA6IChvdXRwdXQgOiBzdHJpbmcpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMub3V0cHV0RnVuY3Rpb24gPSBvdXRwdXRGdW5jdGlvbjtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcGFzcyhzdHI6IHN0cmluZywgb2JqZWN0czogYW55W10pIDogYm9vbGVhbntcclxuICAgICAgICB0aGlzLnBhc3NlZCsrO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiJWPinJRcIiwgJ2NvbG9yOiBncmVlbjsnLFxyXG4gICAgICAgICAgICBcIihcIisoKyt0aGlzLml0ZW0pK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKVwiLFxyXG4gICAgICAgICAgICBzdHIsXHJcbiAgICAgICAgICAgIFwiaXRlbXM6IFwiLCBvYmplY3RzKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGZhaWwoc3RyOiBzdHJpbmcsIG9iamVjdHM6IGFueVtdKSA6IGJvb2xlYW57XHJcbiAgICAgICAgY29uc29sZS5sb2coXCIlY+KcllwiLCAnY29sb3I6IHJlZDsnLFxyXG4gICAgICAgICAgICBcIihcIisoKyt0aGlzLml0ZW0pK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKVwiLFxyXG4gICAgICAgICAgICBzdHIsXHJcbiAgICAgICAgICAgIFwiaXRlbXM6IFwiLCBvYmplY3RzKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0KG5hbWUgOiBzdHJpbmcsIGEgOiBhbnksIGIgOiBhbnksIGNvbXBhcmF0b3IgOiAoYSwgYik9PmJvb2xlYW4gPSAoYSxiKT0+YT09PWIpe1xyXG4gICAgICAgIHRoaXMudGVzdHMucHVzaChhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICBpZihjb21wYXJhdG9yKGF3YWl0IGEsIGF3YWl0IGIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhc3MoXCJhc3NlcnQ6IFwiICsgbmFtZSwgW2F3YWl0IGEsIGF3YWl0IGJdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWwoXCJhc3NlcnQ6IFwiICsgbmFtZSwgW2F3YWl0IGEsIGF3YWl0IGJdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgcnVuKCl7XHJcbiAgICAgICAgdGhpcy5pdGVtID0gMDtcclxuICAgICAgICB0aGlzLnBhc3NlZCA9IDA7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJTdGFydGluZyB0ZXN0OiBcIisgdGhpcy5uYW1lK1wiIC4uLlwiKTtcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLnRlc3RzLm1hcChlID0+IGUoKSkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiUGFzc2VkIFwiK3RoaXMucGFzc2VkK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiLiBUaGlzIGNvbmNsdWRlcyB0aGUgdGVzdCBvZiBcIit0aGlzLm5hbWUrXCIuXCIpO1xyXG4gICAgICAgIHRoaXMub3V0cHV0RnVuY3Rpb24gJiZcclxuICAgICAgICAgICAgdGhpcy5vdXRwdXRGdW5jdGlvbihcclxuICAgICAgICAgICAgICAgICgodGhpcy5wYXNzZWQgPT0gdGhpcy50ZXN0cy5sZW5ndGgpPyBcIlN1Y2Nlc3MhXCIgOiBcIkZhaWxlZC5cIilcclxuICAgICAgICAgICAgICAgICtcIiAoXCIrdGhpcy5wYXNzZWQrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpOiBcIit0aGlzLm5hbWUrXCIgdGVzdGluZyBjb21wbGV0ZS5cIik7XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogRXNzZW50aWFsbHkgZGVmZXJyZWQsIGJ1dCBpdCdzIGFsc28gYSBwcm9taXNlLlxyXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL01vemlsbGEvSmF2YVNjcmlwdF9jb2RlX21vZHVsZXMvUHJvbWlzZS5qc20vRGVmZXJyZWQjYmFja3dhcmRzX2ZvcndhcmRzX2NvbXBhdGlibGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBGdXR1cmU8VD4gZXh0ZW5kcyBQcm9taXNlPFQ+e1xyXG4gICAgcmVhZG9ubHkgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZDtcclxuICAgIHJlYWRvbmx5IHJlamVjdCA6IChyZWFzb24gPzogYW55KSA9PiB2b2lkO1xyXG4gICAgcHJvdGVjdGVkIHN0YXRlIDogMCB8IDEgfCAyOyAvL3BlbmRpbmcsIHJlc29sdmVkLCByZWplY3RlZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRvciA/OiAoXHJcbiAgICAgICAgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgbGV0IHJlc29sdmVyLCByZWplY3RvcjtcclxuXHJcbiAgICAgICAgc3VwZXIoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlciA9IChyZXNvbHV0aW9uIDogVCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc29sdXRpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZWplY3RvciA9IChyZWplY3Rpb24gOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAyO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHJlamVjdGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmVyO1xyXG4gICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0b3I7XHJcblxyXG4gICAgICAgIGV4ZWN1dG9yICYmIG5ldyBQcm9taXNlPFQ+KGV4ZWN1dG9yKS50aGVuKHJlc29sdmVyKS5jYXRjaChyZWplY3Rvcik7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgT2JzZXJ2YWJsZTxUPiB7XHJcbiAgICBwcml2YXRlIHZhbHVlOiBUO1xyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6ICgodmFsdWU6IFQpID0+IHZvaWQpW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoaW5pdGlhbDogVCkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSBpbml0aWFsO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgb2JzZXJ2ZShjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KHZhbHVlOiBUKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaChlID0+IGUodmFsdWUpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQoKSA6IFQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vcmVtb3ZlIGFsbCBzdWJzY3JpYmVycyBcIm5vIG1vcmUgcmVsZXZhbnQgY2hhbmdlcyBoYXBwZW5pbmdcIlxyXG4gICAgZmx1c2goKSA6IHZvaWQge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmxpc3RlbmVycztcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi9GdXR1cmVcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGVuYWJsZSBsb2dpY2FsIEFORCBjb252ZXJnZW5jZSBvZiBQcm9taXNlcy5cclxuICogdW5saWtlIFByb21pc2UuYWxsLCBpdCBpcyBydW50aW1lIHB1c2hhYmxlLlxyXG4gKiBAc2VlIGFkZFxyXG4gKiBAc2VlIFByb21pc2UuYWxsXHJcbiAqIEBzZWUgRnV0dXJlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3luY2hyb25pY2l0eSBleHRlbmRzIEZ1dHVyZTxhbnlbXT57XHJcbiAgICBwcml2YXRlIGZ1dHVyZXMgOiBQcm9taXNlPGFueT5bXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1cGVyRXhlY3V0b3IgYWN0cyBhcyBhbiBvcHRpb25hbCBsb2dpY2FsIE9SIFByb21pc2UgdG8gdGhlIFN5bmNocm9uaWNpdHkuXHJcbiAgICAgKiBpbmNsdWRlZCBmb3IgbmV3cHJvbWlzZWNhcGFiaWxpdHkgY29tcGF0aWJpbGl0eS5cclxuICAgICAqIEBzZWUgYWRkXHJcbiAgICAgKiBAc2VlIEZ1dHVyZVxyXG4gICAgICogQHNlZSBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC9pbmRleC5odG1sI3NlYy1uZXdwcm9taXNlY2FwYWJpbGl0eVxyXG4gICAgICogQHBhcmFtIHsocmVzb2x2ZTogKHZhbHVlOiAoUHJvbWlzZUxpa2U8YW55PiB8IGFueSkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkgPT4gdm9pZH0gc3VwZXJFeGVjdXRvclxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzdXBlckV4ZWN1dG9yID86IChcclxuICAgICAgICByZXNvbHZlIDogKHZhbHVlIDogUHJvbWlzZUxpa2U8YW55PiB8IGFueSkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgc3VwZXIoc3VwZXJFeGVjdXRvcik7XHJcbiAgICAgICAgdGhpcy5mdXR1cmVzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBwcm9taXNlIHRvIHRoZSBjb252ZXJnZW5jZS4gd2hlbiBhbGwgYWRkZWQgcHJvbWlzZXMgcmVzb2x2ZSwgeW91IGNhbiBubyBsb25nZXIgYWRkIGFueS5cclxuICAgICAqIEBwYXJhbSB7UHJvbWlzZTxhbnk+fSBmdXR1cmVcclxuICAgICAqL1xyXG4gICAgYWRkKGZ1dHVyZSA6IFByb21pc2U8YW55Pil7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmKCF0aGlzLnN0YXRlKXtcclxuICAgICAgICAgICAgdGhpcy5mdXR1cmVzLnB1c2goZnV0dXJlKTtcclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwodGhpcy5mdXR1cmVzKS50aGVuKGE9PnNlbGYucmVzcG9uZGVyKGEpKS5jYXRjaChlPT5zZWxmLnJlamVjdChlKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJSdW50aW1lIEVycm9yOiBTeW5jaHJvbmljaXR5IGFscmVhZHkgY29udmVyZ2VkIGluIHRoZSBwYXN0LlwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9kbzogb3B0aW1pemUgdGhpc1xyXG4gICAgICogcmVzb2x2ZXMgdGhlIFN5bmNocm9uaWNpdHkgb25seSB3aGVuIGFsbCBldmVudHMgcmVzb2x2ZWQuXHJcbiAgICAgKiBAcGFyYW0ge2FueVtdfSByZXNvbHV0aW9uc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlc3BvbmRlcihyZXNvbHV0aW9ucyA6IGFueVtdKXtcclxuICAgICAgICBpZiAocmVzb2x1dGlvbnMubGVuZ3RoID09IHRoaXMuZnV0dXJlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmUocmVzb2x1dGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIiwiZXhwb3J0IGNsYXNzIFRpbWUge1xyXG4gICAgcmVhZG9ubHkgbWlsbGlzOiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih0aW1lID86IFRpbWUpe1xyXG4gICAgICAgIHRoaXMubWlsbGlzID0gdGltZSAmJiB0aW1lLm1pbGxpcyB8fCBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGV2YWx1YXRlTlRQKHQwOiBUaW1lLCB0MTogVGltZSwgdDI6IFRpbWUsIHQzOiBUaW1lKSA6IHtwaW5nOiBudW1iZXIsIG9mZnNldDogbnVtYmVyfXtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwaW5nOiB0My5taWxsaXMgLSB0MC5taWxsaXMgLSAodDIubWlsbGlzIC0gdDEubWlsbGlzKSxcclxuICAgICAgICAgICAgb2Zmc2V0OiAoKHQxLm1pbGxpcyAtIHQwLm1pbGxpcykgKyAodDIubWlsbGlzIC0gdDMubWlsbGlzKSkvMlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vdG9kbzogaW5jbHVkZSBwb2x5ZmlsbHMgZm9yIEVkZ2VcclxuZXhwb3J0IGNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbmV4cG9ydCBjb25zdCB1dGY4RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG5cclxuIiwiaW1wb3J0IHtUZXN0fSBmcm9tIFwiLi9tb2R1bGVzL3Rlc3QvVGVzdFwiO1xyXG5pbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi9tb2R1bGVzL2Nob3Jkb2lkL0Nob3Jkb2lkXCI7XHJcbmltcG9ydCB7UHJpdmF0ZUtleSwgVmVyRG9jfSBmcm9tIFwiLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbn0gZnJvbSBcIi4vbW9kdWxlcy9jb25uZWN0aW9uL0Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtUeXBlZENvbm5lY3Rpb259IGZyb20gXCIuL21vZHVsZXMvY29ubmVjdGlvbi9UeXBlZENvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtLcmVpc0ludGVybmFsfSBmcm9tIFwiLi9tb2R1bGVzL2tyZWlzL0tyZWlzSW50ZXJuYWxcIjtcclxubGV0IHByaW50ZiA9IChzdHIgOiBzdHJpbmcpID0+IHtcclxuICAgIHZhciBoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKTtcclxuICAgIGguYXBwZW5kQ2hpbGQodCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGgpO1xyXG59O1xyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY3QgPSBuZXcgVGVzdChcIkNob3JkXCIsIHByaW50Zik7XHJcblxyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLjksIDAuMSksIDAuMiwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQuZGlzdGFuY2UoMC4xLCAwLjEpLCAwLjAsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIENob3Jkb2lkLmRpc3RhbmNlKDAuNCwgMC41KSwgMC4xLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLCAxKSwgMC4wLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLjEsIDAuOSksIDAuMiwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQuZGlzdGFuY2UoMSwgMCksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuXHJcbiAgICBsZXQgdGkgPSBuZXcgQ2hvcmRvaWQoMC41LCAxKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwKSwgMCk7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMSksIDApO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDAuNDk5OTkpLCA2KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwLjUpLCAxNCk7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMC41MDAwMSksIDIyKTtcclxuXHJcbiAgICBsZXQgdGkyID0gbmV3IENob3Jkb2lkKDAuNzUsIDEpO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuMjUpLCAwKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc0OTk5KSwgNik7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyIDJcIiwgdGkyLmx0b2koMC43NSksIDE0KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc1MDAxKSwgMjIpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDBcIiwgdGkyLmdldCh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJhZGQgMVwiLCB0aTIuYWRkKHRvLmEsIHRvKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQodG8uYSksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDFcIiwgdGkyLmdldCgwLjkpLCB0byk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQoMC43NCksIHRvKTtcclxuXHJcbiAgICBsZXQgdG8yID0ge2E6IDAuMTEwOSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImFkZCAyIChvdmVyd3JpdGUpXCIsIHRpMi5hZGQodG8yLmEsIHRvMiksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDJcIiwgdGkyLmdldCh0bzIuYSksIHRvMik7XHJcblxyXG4gICAgY3QuYXNzZXJ0KFwic3VnZ2VzdGlvbiBvcmRlclwiLCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVswXS5lZmZpY2llbmN5LCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVsxXS5lZmZpY2llbmN5LCAoYSwgYikgPT4gYSA+IGIpO1xyXG5cclxuICAgIGN0LmFzc2VydChcInJlbSAxIGZhaWxcIiwgdGkyLnJlbW92ZSh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJyZW0gMVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgdG8yKTtcclxuICAgIGN0LmFzc2VydChcInJlbSAxIGVtcHR5XCIsIHRpMi5yZW1vdmUodG8yLmEpLCBudWxsKTtcclxuICAgIGN0LnJ1bigpO1xyXG59KSgpOyAvLyBkYXRhIHN0cnVjdHVyZSAoY2hvcmRpb2lkMSkgdGVzdFxyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY3IgPSBuZXcgVGVzdChcIkNyeXB0b1wiLCBwcmludGYpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICBsZXQgcHJrID0gbmV3IFByaXZhdGVLZXkoKTtcclxuICAgIGxldCB2ZXJkb2MgPSBhd2FpdCBwcmsuc2lnbih0byk7XHJcbiAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2MpO1xyXG5cclxuICAgIGNyLmFzc2VydChcInZlcmRvYyBrZXkgY29tcGFyaXNvblwiLCB2ZXJkb2Mua2V5Lmhhc2hlZCgpLCByZWNvbnN0cnVjdGVkLmtleS5oYXNoZWQoKSk7XHJcbiAgICBjci5hc3NlcnQoXCJ2ZXJkb2MgZGF0YSBjb21wYXJpc29uXCIsIEpTT04uc3RyaW5naWZ5KHZlcmRvYy5kYXRhKSwgSlNPTi5zdHJpbmdpZnkocmVjb25zdHJ1Y3RlZC5kYXRhKSk7XHJcblxyXG4gICAgY3IucnVuKCk7XHJcbn0pKCk7IC8vIGNyeXB0byB0ZXN0XHJcblxyXG4oYXN5bmMgKCk9PntcclxuICAgIGxldCBjbiA9IG5ldyBUZXN0KFwiQ29ubmVjdGlvblwiLCBwcmludGYpO1xyXG5cclxuICAgIGNsYXNzIEF7XHJcbiAgICAgICAgYSA6IHN0cmluZztcclxuICAgIH1cclxuICAgIGNsYXNzIEJ7XHJcbiAgICAgICAgYiA6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVzcG9uc2UgPSAoIG0gOiBBICkgOiBQcm9taXNlPEI+ID0+IHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtiOiBtLmF9KX07XHJcblxyXG5cclxuICAgIGxldCBhID0gbmV3IFR5cGVkQ29ubmVjdGlvbigpO1xyXG4gICAgbGV0IGFjID0gYS5jcmVhdGVDaGFubmVsPEEsQj4ocmVzcG9uc2UpO1xyXG4gICAgbGV0IGIgPSBuZXcgVHlwZWRDb25uZWN0aW9uKCk7XHJcbiAgICBsZXQgYmMgPSBiLmNyZWF0ZUNoYW5uZWw8QSxCPihyZXNwb25zZSk7XHJcblxyXG4gICAgbGV0IG9mZmVyID0gYXdhaXQgYS5vZmZlcigpO1xyXG4gICAgbGV0IGFuc3dlciA9IGF3YWl0IGIuYW5zd2VyKG9mZmVyKTtcclxuICAgIGEuY29tcGxldGUoYW5zd2VyKTtcclxuXHJcbiAgICBhd2FpdCBhLm9wZW47XHJcblxyXG4gICAgY24uYXNzZXJ0KFwiY29ubmVjdGlvbiBhYiBlY2hvIHdvcmtzXCIsIGF3YWl0IGFjKHthOiBcImhlbGxvXCJ9KS50aGVuKG09Pm0uYiksIFwiaGVsbG9cIik7XHJcbiAgICBjbi5hc3NlcnQoXCJjb25uZWN0aW9uIGJhIGVjaG8gd29ya3NcIiwgYXdhaXQgYmMoe2E6IFwiaGVsbG9cIn0pLnRoZW4obT0+bS5iKSwgXCJoZWxsb1wiKTtcclxuXHJcbiAgICBjbi5ydW4oKTtcclxufSkoKTsgLy8gY29ubmVjdGlvbiB0ZXN0XHJcblxyXG4oYXN5bmMgKCk9PntcclxuICAgIGxldCBjbiA9IG5ldyBUZXN0KFwiS3JlaXNJbnRlcm5hbFwiLCBwcmludGYpO1xyXG5cclxuICAgIGxldCBrID0gbmV3IEFycmF5KDIwKS5maWxsKG51bGwpLm1hcChfPT4gbmV3IEtyZWlzSW50ZXJuYWwoKSk7XHJcbiAgICBsZXQga24gPSBuZXcgS3JlaXNJbnRlcm5hbCgpO1xyXG5cclxuICAgIGsucmVkdWNlKChhLGUpPT57KGFzeW5jICgpPT5lLmNvbXBsZXRlKGF3YWl0IGEuYW5zd2VyKGF3YWl0IGUub2ZmZXIoLTEpKSkpKCk7IHJldHVybiBlfSwga24pO1xyXG4gICAgLy9rWzBdLmNvbXBsZXRlKGF3YWl0IGtbMV0uYW5zd2VyKGF3YWl0IGtbMF0ub2ZmZXIoLTEpKSk7XHJcblxyXG4gICAgYXdhaXQga1swXS5vcGVuO1xyXG5cclxuICAgIGtbMF0uc2hvdXQoXCJleXlcIik7XHJcbiAgICBrWzBdLnN5bmMoKTtcclxuXHJcbiAgICBjbi5hc3NlcnQoXCJrcmVpcyBzeW5jIHdvcmtzXCIsIChhd2FpdCBrWzBdLnN5bmMoKSkubGVuZ3RoLCAxKTtcclxuXHJcbiAgICBjbi5ydW4oKTtcclxuXHJcbn0pKCk7IC8vIGtyZWlzIHRlc3RcclxuXHJcblxyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIifQ==