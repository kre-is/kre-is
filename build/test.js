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

/***/ "./modules/connection/Connection.ts":
/*!******************************************!*\
  !*** ./modules/connection/Connection.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const rtcconfig_1 = __webpack_require__(/*! ./rtcconfig */ "./modules/connection/rtcconfig.ts");
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
        this.connectionIterator = 0; //give a unique name to the channels.
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig_1.rtcconfig);
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
        if (this.allChannelsOpen.getState() != "pending") {
            throw "channels can only be created before starting the connection!";
        }
        let requestChannel = this.rtcPeerConnection.createDataChannel(this.connectionIterator, { negotiated: true, id: this.connectionIterator++ });
        let responseChannel = this.rtcPeerConnection.createDataChannel(this.connectionIterator, { negotiated: true, id: this.connectionIterator++ });
        let responseChannelOpen = new Future_1.Future();
        let requestChannelOpen = new Future_1.Future();
        this.allChannelsOpen.add(responseChannelOpen);
        this.allChannelsOpen.add(requestChannelOpen);
        let openRequests = 0;
        // Ensure all channels are open
        let self = this;
        requestChannel.onopen = () => {
            requestChannelOpen.resolve(requestChannel);
        };
        responseChannel.onopen = () => {
            responseChannelOpen.resolve(responseChannel);
        };
        //handle the sending of a responseMessage. is altered by bounce.
        let responseDispatch = (message) => {
            responseChannel.send(message);
            openRequests--;
        };
        // handle FOREIGN REQUESTS
        // a request is coming in.
        requestChannel.onmessage = (message) => {
            openRequests++;
            let data = message.data;
            let reference = data.codePointAt(0);
            //anti DOS
            //partner tries to flood us
            if (openRequests > maxOpenMessages) {
                try {
                    responseChannel.send(ConnectionError_1.ConnectionError.InbufferExhausted().transmit(0));
                }
                catch (e) {
                    //don't care if they don't receive it, they're criminal
                }
                //todo: implement IP ban
                console.log("dropped spamming peer");
                self.closed.reject(self);
                try {
                    self.close();
                }
                catch (e) { }
                ;
                return;
            }
            //perform onmessage
            onmessage(data.slice(1)) // first symbol is reference
                .then(response => {
                if (self.closed.getState() != "pending")
                    return; // do not transmit.
                responseChannelOpen.then(() => {
                    responseDispatch(String.fromCodePoint(reference) + response);
                });
            })
                .catch(error => {
                if (self.closed.getState() != "pending")
                    return; // do not transmit.
                let transmissible;
                try {
                    transmissible = error.transmit(reference);
                }
                catch (e) {
                    transmissible = ConnectionError_1.ConnectionError.UncaughtRemoteError().transmit(reference);
                }
                responseChannelOpen.then(() => {
                    responseDispatch(transmissible);
                });
            });
        };
        // handle REQUEST DISPATCHING
        //store outgoing message futures here
        let callbackBuffer = new Array(maxOpenMessages).fill(null);
        let sentRequests = 0;
        /**
         * bounce all messages in the buffer
         * effectively just returns an error everywhere.
         * another layer should determine what to do with that.
         */
        let bounce = () => {
            self.rtcPeerConnection.close();
            responseDispatch = () => { }; // any responses get simply dropped.
            self.closed.resolve(self);
            callbackBuffer.filter(e => e).forEach(e => e.reject(ConnectionError_1.ConnectionError.Bounced()));
            self.close();
        };
        requestChannel.onclose = bounce;
        responseChannel.onclose = bounce;
        //resolve and clear the parked futures on response
        responseChannel.onmessage = (message) => {
            let data = message.data;
            let reference = data.codePointAt(0);
            if (reference == 0) { // an error occurred remotely!
                let err = ConnectionError_1.ConnectionError.parse(data);
                reference = err.reference;
                try {
                    callbackBuffer[reference].reject(err);
                    callbackBuffer[reference] = null;
                    sentRequests--;
                }
                catch (e) {
                    //@todo: implement ip banning
                    self.closed.reject(self);
                    bounce();
                }
                return;
            }
            callbackBuffer[reference].resolve(data.slice(1));
            callbackBuffer[reference] = null;
            sentRequests--;
            return;
        };
        // actually DISPATCH REQUESTS
        return (request) => {
            sentRequests++;
            //we don't want to spam our partner, otherwise they drop us.
            if (sentRequests >= maxOpenMessages) {
                sentRequests--;
                return Promise.reject(ConnectionError_1.ConnectionError.OutbufferExhausted());
            }
            // find a space in the callbackBuffer
            let idx = callbackBuffer.indexOf(null, 1); // exclude spot 0, for errors n stuff
            let future = new Future_1.Future();
            callbackBuffer[idx] = future;
            requestChannel.send(String.fromCodePoint(idx) + request);
            return future;
        };
    }
    offer() {
        if (this.allChannelsOpen.getState() != "pending") {
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
        if (this.allChannelsOpen.getState() != "pending") {
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
        if (this.allChannelsOpen.getState() != "pending") {
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
 * BEFORE EXTENDING: @see Errors.md
 * @property type {number} type of error. Name and annotate the factories, so they can be identified
 * @property local {boolean} whether the error originated locally or remotely
 */
class ConnectionError {
    constructor(type, reference, local = true) {
        this.type = type;
        this.reference = reference;
        this.local = local;
    }
    static InbufferExhausted() {
        return new ConnectionError(1, null);
    }
    static OutbufferExhausted() {
        return new ConnectionError(2, null);
    }
    static ParticipantUnreachable() {
        return new ConnectionError(3, null);
    }
    static ReceivedGarbage() {
        return new ConnectionError(4, null);
    }
    static UnexpectedResponse() {
        return new ConnectionError(5, null);
    }
    static NetworkEmpty() {
        return new ConnectionError(6, null);
    }
    static UncaughtRemoteError() {
        return new ConnectionError(7, null);
    }
    static Bounced() {
        return new ConnectionError(8, null);
    }
    transmit(reference) {
        return String.fromCodePoint(0, this.type, reference);
    }
    static parse(data) {
        return new ConnectionError(data.codePointAt(1), data.codePointAt(2), false);
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
        let channel = super.createChannel(request => {
            try {
                return onmessage(JSON.parse(request)).
                    then(response => JSON.stringify(response));
            }
            catch (e) {
                return Promise.reject(ConnectionError_1.ConnectionError.ReceivedGarbage());
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
const KID_1 = __webpack_require__(/*! ./daemons/KID */ "./modules/kreis/daemons/KID.ts");
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
        this.daemon = new KID_1.KID(this);
        this.open.then(self => self.daemon.run());
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
                    return Promise.reject(ConnectionError_1.ConnectionError.NetworkEmpty());
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

/***/ "./modules/kreis/daemons/KID.ts":
/*!**************************************!*\
  !*** ./modules/kreis/daemons/KID.ts ***!
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
const Time_1 = __webpack_require__(/*! ../../tools/Time */ "./modules/tools/Time.ts");
const Chordoid_1 = __webpack_require__(/*! ../../chordoid/Chordoid */ "./modules/chordoid/Chordoid.ts");
const config_1 = __webpack_require__(/*! ./config */ "./modules/kreis/daemons/config.ts");
/**
 * Kreis Internal Daemon
 */
class KID {
    constructor(kreis, config = config_1.KIDConfig) {
        this.activeConnection = null;
        this.flagStop = false;
        this.host = kreis;
        this.lastAction = new Time_1.Time();
        this.state = 0;
        this.config = config;
    }
    stop() {
        this.state = 3;
    }
    run(forced = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            yield null; //purge tail calls
            switch (this.state) {
                case 0:
                    {
                        this.dispatch()
                            .then(() => {
                            self.state = 0;
                            self.run(false);
                        })
                            .catch(() => {
                            self.state = 2;
                            setTimeout(() => {
                                self.run(false);
                            }, self.config.timeout);
                        });
                    }
                    return;
                case 1:
                    {
                        //pass
                    }
                    return;
                case 2:
                    {
                        this.state = 0;
                        this.run(false);
                    }
                    return;
                case 3:
                    {
                        if (!forced)
                            return;
                        this.state = 0;
                        this.run(false);
                    }
                    return;
            }
        });
    }
    dispatch() {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            yield self.host.daemonComplete(yield self.host.answer(yield self.host.daemonOffer(Math.floor(Chordoid_1.Chordoid.lookupTable.length * Math.pow(Math.random(), 5) //adding some entropy
            ))));
        });
    }
}
exports.KID = KID;


/***/ }),

/***/ "./modules/kreis/daemons/config.ts":
/*!*****************************************!*\
  !*** ./modules/kreis/daemons/config.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.KIDConfig = {
    timeout: 10000 // timeout in millis on bad answer
};


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
const Time_1 = __webpack_require__(/*! ../tools/Time */ "./modules/tools/Time.ts");
const NetworkConnection_1 = __webpack_require__(/*! ./NetworkConnection */ "./modules/network/NetworkConnection.ts");
const NetworkError_1 = __webpack_require__(/*! ./NetworkError */ "./modules/network/NetworkError.ts");
class Network extends NetworkInternal_1.NetworkInternal {
    constructor(privateKey) {
        super(privateKey);
    }
    /**
     * try to ascertain the lag and time discrepancy between this client and the remote clients.
     */
    sync() {
        return this.table.all().map(c => c.channelRequestRemoteTime(new Time_1.Time()));
    }
    /**
     * link to a possibly disparate network.
     * @param {Network} network
     * @returns {Promise<Network>}
     */
    link(network) {
        return __awaiter(this, void 0, void 0, function* () {
            let conn = new NetworkConnection_1.NetworkConnection(this);
            try {
                let offer = yield this.offer(conn);
                let answer = yield network.answer(offer);
                yield this.complete(answer, conn);
            }
            catch (e) {
                e;
                if (e.type == 6) {
                    throw NetworkError_1.NetworkError.NoCandidates();
                }
            }
            yield conn.open;
            yield network.bootstrapped;
            yield this.bootstrapped;
            return network;
        });
    }
}
exports.Network = Network;


/***/ }),

/***/ "./modules/network/NetworkConnection.ts":
/*!**********************************************!*\
  !*** ./modules/network/NetworkConnection.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const TypedConnection_1 = __webpack_require__(/*! ../connection/TypedConnection */ "./modules/connection/TypedConnection.ts");
const Time_1 = __webpack_require__(/*! ../tools/Time */ "./modules/tools/Time.ts");
class NetworkConnection extends TypedConnection_1.TypedConnection {
    constructChannels() {
        let self = this;
        this.channelPropagateOffer = this.createChannel(msg => {
            return self.network.answer(msg, self.foreignKey);
        });
        this.channelRequestRemoteTime = this.createChannel(msg => {
            return Promise.resolve(new Time_1.Time());
        });
    }
    constructor(network) {
        super();
        this.network = network;
        this.constructChannels();
    }
}
exports.NetworkConnection = NetworkConnection;


/***/ }),

/***/ "./modules/network/NetworkError.ts":
/*!*****************************************!*\
  !*** ./modules/network/NetworkError.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ConnectionError_1 = __webpack_require__(/*! ../connection/ConnectionError */ "./modules/connection/ConnectionError.ts");
/**
 * @see connection/Errors.md
 * @see ConnectionError
 * Network Codes range is 1000-1999
 */
class NetworkError extends ConnectionError_1.ConnectionError {
    static NetworkEmpty() {
        return new ConnectionError_1.ConnectionError(1000, null);
    }
    static NoCandidates() {
        return new ConnectionError_1.ConnectionError(1001, null);
    }
}
exports.NetworkError = NetworkError;


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
const Chordoid_1 = __webpack_require__(/*! ../chordoid/Chordoid */ "./modules/chordoid/Chordoid.ts");
const PrivateKey_1 = __webpack_require__(/*! ../crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const NetworkConnection_1 = __webpack_require__(/*! ./NetworkConnection */ "./modules/network/NetworkConnection.ts");
const Future_1 = __webpack_require__(/*! ../tools/Future */ "./modules/tools/Future.ts");
const ConnectionError_1 = __webpack_require__(/*! ../connection/ConnectionError */ "./modules/connection/ConnectionError.ts");
const NetworkInternalDaemon_1 = __webpack_require__(/*! ./daemons/NetworkInternalDaemon */ "./modules/network/daemons/NetworkInternalDaemon.ts");
/**
 * no need to await readiness, when the offer comes / answer is provided, the network is guaranteed to be ready.
 */
class NetworkInternal {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.ready = new Future_1.Future();
        (() => __awaiter(this, void 0, void 0, function* () {
            this.table = new Chordoid_1.Chordoid(yield privateKey.getPublicHash());
            this.ready.resolve(null);
        }))();
        this.bootstrapped = new Future_1.Future();
        this.daemon = new NetworkInternalDaemon_1.NetworkInternalDaemon(this);
    }
    insertOnReady(connection, key) {
        let self = this;
        connection.foreignKey = key;
        connection.open.then(conn => {
            let oldconn = self.table.add(key.hashed(), conn);
            this.bootstrapped.resolve(self);
            this.daemon.run();
            oldconn && oldconn.close();
            return connection.closed;
        }).then(() => {
            //when it's closed
            self.table.remove(key.hashed());
        }).catch(() => {
            //when it's closed
            self.table.remove(key.hashed()).close();
            //TODO: IP ban implementation goes here
        });
    }
    offer(connection, selection = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let suggestion;
            if (this.bootstrapped.getState() == "pending") {
                suggestion = { exponent: 14, efficiency: 1 };
            }
            else {
                suggestion = this.table.getSuggestions()[selection];
            }
            return this.privateKey.sign({
                sdp: yield connection.offer(),
                target: suggestion.exponent,
                tolerance: suggestion.efficiency
            });
        });
    }
    answer(rawdoc, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let doc = yield PrivateKey_1.VerDoc.reconstruct(rawdoc);
            yield this.privateKey.getPublicHash();
            //what do they want?
            let target = Chordoid_1.Chordoid.dereference(doc.data.target, doc.key.hashed());
            let distanceToUs = Chordoid_1.Chordoid.distance(target, yield self.privateKey.getPublicHash());
            if ( //they want us and we want them
            distanceToUs < doc.data.tolerance
                && this.table.isDesirable(doc.key.hashed())) {
                yield this.ready;
                let connection = new NetworkConnection_1.NetworkConnection(this);
                this.insertOnReady(connection, doc.key);
                return this.privateKey.sign({ sdp: yield connection.answer(doc.data.sdp) });
            }
            else { //propagate
                let nextStop = self.table.getWithin(target, origin
                    ? Math.min(distanceToUs, Chordoid_1.Chordoid.distance(target, origin.hashed()))
                    : 1);
                if (!nextStop)
                    throw ConnectionError_1.ConnectionError.NetworkEmpty();
                return nextStop.channelPropagateOffer(rawdoc).catch(e => {
                    if (e.type == 8)
                        return this.answer(rawdoc, origin);
                    throw e;
                });
            }
        });
    }
    complete(rawdoc, connection) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let doc = yield PrivateKey_1.VerDoc.reconstruct(rawdoc);
            yield this.ready;
            this.insertOnReady(connection, doc.key);
            yield connection.complete(doc.data.sdp);
        });
    }
}
exports.NetworkInternal = NetworkInternal;


/***/ }),

/***/ "./modules/network/daemons/NetworkInternalDaemon.ts":
/*!**********************************************************!*\
  !*** ./modules/network/daemons/NetworkInternalDaemon.ts ***!
  \**********************************************************/
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
const NetworkConnection_1 = __webpack_require__(/*! ../NetworkConnection */ "./modules/network/NetworkConnection.ts");
/**
 * Daemon to curate the network, and interlink itself automatically with optimal nodes.
 */
class NetworkInternalDaemon {
    constructor(network, timeout = 10000) {
        this.state = 0; // idle, working, timed-out
        this.network = network;
        this.network.bootstrapped.then(() => this.run());
        this.timeout = timeout;
    }
    /**
     * call this every time a connection is added to the network.
     * recursive, but the tails should resolve long before execute() is over.
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield null;
            switch (this.state) {
                case 0: {
                    this.state = 1;
                    this.execute();
                    return;
                }
                case 1: {
                    return; //do nothing
                }
                case 2: {
                    this.state = 1;
                    this.execute();
                    return;
                }
            }
        });
    }
    execute() {
        let self = this;
        let connection = new NetworkConnection_1.NetworkConnection(this.network);
        this.network.offer(connection)
            .then(o => this.network.answer(o))
            .then(a => this.network.complete(a, connection))
            .then(() => self.state = 0)
            .then(() => self.run())
            .catch(e => {
            self.state = 0;
            if (e.local) {
                //this means we couldn't send it anywhere. this means that the network is empty or our code is trash
                self.state = 0;
                return; // set to idle, do nothing.
            }
            switch (e.type) {
                case 6: { // no peer accepted our offer. try again later.
                    self.state = 2;
                    setTimeout(() => self.run(), self.timeout);
                    return;
                }
                default: {
                    //nothing happens, state is 0; daemon is idle.
                }
            }
        });
    }
}
exports.NetworkInternalDaemon = NetworkInternalDaemon;


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
        this.tests.push(() => __awaiter(this, void 0, void 0, function* () {
            if (comparator(yield a, yield b)) {
                return this.pass("assert: " + name, [yield a, yield b]);
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
const ConnectionError_1 = __webpack_require__(/*! ./modules/connection/ConnectionError */ "./modules/connection/ConnectionError.ts");
const Network_1 = __webpack_require__(/*! ./modules/network/Network */ "./modules/network/Network.ts");
const Time_1 = __webpack_require__(/*! ./modules/tools/Time */ "./modules/tools/Time.ts");
let printf = (str) => {
    var h = document.createElement("div");
    var t = document.createTextNode(str);
    h.appendChild(t);
    document.body.appendChild(h);
};
window.PrivateKey = PrivateKey_1.PrivateKey;
window.Network = Network_1.Network;
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
    let delayedResponse = (m) => { return new Promise(resolve => setTimeout(() => resolve({ b: m.a }), 1000)); };
    let a = new TypedConnection_1.TypedConnection();
    let ac = a.createChannel(response);
    let acd = a.createChannel(delayedResponse);
    let b = new TypedConnection_1.TypedConnection();
    let bc = b.createChannel(response);
    let bcd = b.createChannel(delayedResponse);
    let offer = yield a.offer();
    let answer = yield b.answer(offer);
    a.complete(answer);
    yield a.open;
    cn.assert("connection ab echo works", yield ac({ a: "hello" }).then(m => m.b), "hello");
    cn.assert("connection ba echo works", yield bc({ a: "hello" }).then(m => m.b), "hello");
    cn.assert("outbound limitation works", yield Promise.all(new Array(100).fill({ a: "u" }).map(e => acd(e))).catch(e => e.type), ConnectionError_1.ConnectionError.OutbufferExhausted().type);
    let requests = new Array(99).fill(1).map((e, i) => bcd({ a: "r" + i }).catch(e => e.type == 8 && i));
    a.close();
    cn.assert("bounce works", JSON.stringify(yield Promise.all(requests)), JSON.stringify(new Array(99).fill(8).map((e, i) => i)));
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
})); // network test
(() => __awaiter(this, void 0, void 0, function* () {
    let cn = new Test_1.Test("Network", printf);
    let a = new Network_1.Network(new PrivateKey_1.PrivateKey());
    let b = new Network_1.Network(new PrivateKey_1.PrivateKey());
    let c = new Network_1.Network(new PrivateKey_1.PrivateKey());
    a.link(b);
    b.link(c);
    c.link(a);
    yield a.bootstrapped;
    cn.assert("remote time fetch", ~~((yield Promise.all(a.sync()))[0].millis / 10), ~~(new Time_1.Time().millis / 10));
    //hardening
    let num = 20;
    let ar = new Array(num).fill(1).map(() => new Network_1.Network(new PrivateKey_1.PrivateKey()));
    ar.reduce(((p, n, i) => __awaiter(this, void 0, void 0, function* () {
        yield p;
        n.link(c);
        return n;
    })), Promise.resolve(c));
    window.ar = ar;
    cn.run();
}))(); // network test


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jaG9yZG9pZC9DaG9yZG9pZC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbkVycm9yLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvY29ubmVjdGlvbi9UeXBlZENvbm5lY3Rpb24udHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jb25uZWN0aW9uL3J0Y2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMva3JlaXMvS3JlaXNJbnRlcm5hbC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2tyZWlzL2RhZW1vbnMvS0lELnRzIiwid2VicGFjazovLy8uL21vZHVsZXMva3JlaXMvZGFlbW9ucy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9uZXR3b3JrL05ldHdvcmsudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9uZXR3b3JrL05ldHdvcmtDb25uZWN0aW9uLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvbmV0d29yay9OZXR3b3JrRXJyb3IudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9uZXR3b3JrL05ldHdvcmtJbnRlcm5hbC50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL25ldHdvcmsvZGFlbW9ucy9OZXR3b3JrSW50ZXJuYWxEYWVtb24udHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90ZXN0L1Rlc3QudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy9GdXR1cmUudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy90b29scy9TeW5jaHJvbmljaXR5LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvVGltZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL3V0ZjhidWZmZXIudHMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbkVBO0lBZ0JJLFlBQVksTUFBZSxFQUFFLGdCQUF5QixDQUFDO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxXQUFXLENBQUMsUUFBZ0I7UUFDeEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUM7WUFDZixJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUM7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LEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDbEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDdEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxtQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFFbEcsSUFBSSxFQUFFLEdBQUcsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5QixFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxtQkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTlDLElBQUksRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV4QyxJQUFJLEdBQUcsR0FBRyxFQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQ2pDLEVBQUUsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXZILEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hELEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLEVBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNiLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQyxtQ0FBbUM7QUFFekMsQ0FBQyxHQUFRLEVBQUU7SUFDUCxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFcEMsSUFBSSxFQUFFLEdBQUcsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUMsQ0FBQztJQUUvQixJQUFJLEdBQUcsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUMzQixJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEMsSUFBSSxhQUFhLEdBQUcsTUFBTSxtQkFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyRCxFQUFFLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3BGLEVBQUUsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVyRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDYixDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsY0FBYztBQUVwQixDQUFDLEdBQVEsRUFBRTtJQUNQLElBQUksRUFBRSxHQUFHLElBQUksV0FBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV4QztLQUVDO0lBQ0Q7S0FFQztJQUVELElBQUksUUFBUSxHQUFHLENBQUUsQ0FBSyxFQUFnQixFQUFFLEdBQUUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUM7SUFDNUUsSUFBSSxlQUFlLEdBQUcsQ0FBRSxDQUFLLEVBQWdCLEVBQUUsR0FBRSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sR0FBRSxXQUFVLENBQUMsR0FBRSxFQUFFLFFBQU8sQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUM7SUFHdEgsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQ0FBZSxFQUFFLENBQUM7SUFDOUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBTSxRQUFRLENBQUMsQ0FBQztJQUN4QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFNLGVBQWUsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO0lBQzlCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQU0sUUFBUSxDQUFDLENBQUM7SUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBTSxlQUFlLENBQUMsQ0FBQztJQUVoRCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVuQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFYixFQUFFLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEYsRUFBRSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXBGLEVBQUUsQ0FBQyxNQUFNLENBQUUsMkJBQTJCLEVBQ2xDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDcEYsaUNBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FDNUMsQ0FBQztJQUVGLElBQUksUUFBUSxHQUFJLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEVBQUMsR0FBRyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRSxFQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVWLEVBQUUsQ0FBQyxNQUFNLENBQUUsY0FBYyxFQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FDdEQsQ0FBQztJQU1GLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNiLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0I7QUFFeEIsQ0FBQyxHQUFRLEVBQUU7SUFDUCxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFM0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxJQUFJLDZCQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQUksRUFBRSxHQUFHLElBQUksNkJBQWEsRUFBRSxDQUFDO0lBRTdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEdBQVEsRUFBRSx3REFBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0YseURBQXlEO0lBRXpELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVaLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU3RCxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFYixDQUFDLEVBQUMsQ0FBQyxDQUFDLGVBQWU7QUFFbkIsQ0FBQyxHQUFRLEVBQUU7SUFDUCxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFckMsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksdUJBQVUsRUFBRSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksdUJBQVUsRUFBRSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksdUJBQVUsRUFBRSxDQUFDLENBQUM7SUFFdEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRVYsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDO0lBRXJCLEVBQUUsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RyxXQUFXO0lBQ1gsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBRWIsSUFBSSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxHQUFFLEVBQUUsQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSx1QkFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsTUFBTSxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLEVBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFdkIsTUFBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFLeEIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2IsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUiLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3Rlc3QudHNcIik7XG4iLCJleHBvcnQgY2xhc3MgQ2hvcmRvaWQ8VD57XHJcbiAgICBwcml2YXRlIGxvY3VzIDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBhcnJheSA6IHtrZXkgOiBudW1iZXIsIG9iaiA6IFR9W107XHJcblxyXG4gICAgLy9GSVhNRTogYW1wIHVwIHByZWNpc2lvbiB0byA2NCBiaXQ7XHJcblxyXG4gICAgc3RhdGljIHJlYWRvbmx5IGxvb2t1cFRhYmxlID0gWy0wLjUsIC0wLjI1LCAtMC4wNTU1NTU1NTU1NTU1NTU1OCwgLTAuMDA3ODEyNSwgLTAuMDAwODAwMDAwMDAwMDAwMDIyOSwgLTAuMDAwMDY0MzAwNDExNTIyNjEwOSxcclxuICAgICAgICAtMC4wMDAwMDQyNDk5Mjk4NzYxMzIyNjM1LCAtMi4zODQxODU3OTEwMTU2MjVlLTcsIC0xLjE2MTUyODY1NjU5MDI0OTRlLTgsIC00Ljk5OTk5OTg1ODU5MDM0M2UtMTAsXHJcbiAgICAgICAgLTEuOTI3NzE5MDk1NDYyNTIxMmUtMTEsIC02LjcyOTYxNjg2Mzc2NTM4NmUtMTMsIC0yLjE0ODI4MTU1MjY0OTY3OGUtMTQsIC02LjEwNjIyNjYzNTQzODM2MWUtMTYsIDAsXHJcbiAgICAgICAgNi4xMDYyMjY2MzU0MzgzNjFlLTE2LCAyLjE0ODI4MTU1MjY0OTY3OGUtMTQsIDYuNzI5NjE2ODYzNzY1Mzg2ZS0xMywgMS45Mjc3MTkwOTU0NjI1MjEyZS0xMSxcclxuICAgICAgICA0Ljk5OTk5OTg1ODU5MDM0M2UtMTAsIDEuMTYxNTI4NjU2NTkwMjQ5NGUtOCwgMi4zODQxODU3OTEwMTU2MjVlLTcsIDAuMDAwMDA0MjQ5OTI5ODc2MTMyMjYzNSxcclxuICAgICAgICAwLjAwMDA2NDMwMDQxMTUyMjYxMDksIDAuMDAwODAwMDAwMDAwMDAwMDIyOSwgMC4wMDc4MTI1LCAwLjA1NTU1NTU1NTU1NTU1NTU4LCAwLjI1LCAwLjVdO1xyXG4gICAgc3RhdGljIHJlYWRvbmx5IGxvY3VzSURYID0gMTQ7IC8vIHBvc2l0aW9uIG9mIHRoZSBsb2N1c1xyXG5cclxuICAgIHN0YXRpYyBhY2NlcHRhYmxlRXJyb3IgPSAxZS0xNjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjZW50ZXIgOiBudW1iZXIsIGNpcmN1bWZlcmVuY2UgOiBudW1iZXIgPSAxKXtcclxuICAgICAgICB0aGlzLmxvY3VzID0gY2VudGVyO1xyXG4gICAgICAgIHRoaXMuYXJyYXkgPSBuZXcgQXJyYXkoQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTEpLmZpbGwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEZXNpcmFibGUobG9jYXRpb246IG51bWJlcil7IC8vdG9kbzogcmVmYWN0b3IgdGhpcyBpbnRvIFwiYWRkXCJcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGQobG9jYXRpb246IG51bWJlciwgb2JqIDogVCkgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaWR4ID0gdGhpcy5sdG9pKGxvY2F0aW9uKTtcclxuICAgICAgICBpZih0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLmVmZmljaWVuY3kodGhpcy5hcnJheVtpZHhdLmtleSwgaWR4KSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICAvL2VmZmljaWVuY3kgaXMgd29yc2UgdGhhbiBpbmNvbWluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XS5vYmo7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFycmF5W2lkeF0gPSB7a2V5OiBsb2NhdGlvbiwgb2JqOiBvYmp9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9sZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vcmVqZWN0IHRoZSBvYmplY3Q7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqfTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0cmlldmUgY2xvc2VzdCBhdmFpbGFibGUgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG9jYXRpb25cclxuICAgICAqIEByZXR1cm5zIHtUIHwgbnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0KGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSB8fCBudWxsKSAmJiBpdGVtLm9iajtcclxuICAgIH1cclxuICAgIGdldFdpdGhpbihsb2NhdGlvbjogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlcikgOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmFycmF5W3RoaXMubHRvaShsb2NhdGlvbiwgdHJ1ZSldO1xyXG4gICAgICAgIHJldHVybiAoaXRlbSAmJiBDaG9yZG9pZC5kaXN0YW5jZShpdGVtLmtleSAsIGxvY2F0aW9uKSA8IHRvbGVyYW5jZSlcclxuICAgICAgICAgICAgPyBpdGVtLm9ialxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZC5hY2NlcHRhYmxlRXJyb3Ipe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hcnJheVtpZHhdID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gb2xkLm9iajtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGRlcmVmZXJlbmNlIChpZHg6IEV4cG9uZW50LCBsb2N1czogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeC52YWx1ZU9mKCldICsgbG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KGxvY2F0aW9uPj0wICYmIGxvY2F0aW9uIDw9IDEsIFwibG9jYXRpb246IFwiK2xvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gKCgxICsgbG9jYXRpb24gLSB0aGlzLmxvY3VzICsgMC41KSAlIDEpIC0gMC41O1xyXG4gICAgICAgIC8vZXhwZWN0IGluIHJhbmdlIC0wLjUsIDAuNVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZXJlbGF0aXZpemUobG9jYXRpb24gOiBudW1iZXIpIDogbnVtYmVye1xyXG4gICAgICAgIHJldHVybiAobG9jYXRpb24gKyB0aGlzLmxvY3VzICsgMSApICUgMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlzdGFuY2UoYSA6IG51bWJlciwgYiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxyXG4gICAgICAgICAgICBNYXRoLmFicyhhIC0gYiksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiICsgMSksXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGIgLSBhICsgMSlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZGlzdGFuY2UoYTogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UodGhpcy5sb2N1cywgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQuZGlzdGFuY2UoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSwgZGVyZWxhdGl2aXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgbHRvaShsb2NhdGlvbiA6IG51bWJlciwgc2tpcEVtcHR5IDogYm9vbGVhbiA9IGZhbHNlKSA6IG51bWJlcnsgLy9sb2NhdGlvbiB0byBpbmRleFxyXG4gICAgICAgIGxldCBkZXJlbGF0aXZpemVkID0gdGhpcy5kZXJlbGF0aXZpemUobG9jYXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgZWZmaWNpZW5jeSA9IDE7XHJcbiAgICAgICAgbGV0IHZlcmlkZXggPSBudWxsO1xyXG4gICAgICAgIGlmKGRlcmVsYXRpdml6ZWQgPCAwKXtcclxuICAgICAgICAgICAgLy9zdGFydCB3aXRoIDBcclxuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdGFydCB3aXRoIG1heFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlciwgZWZmaWNpZW5jeTogbnVtYmVyLCBleHBvbmVudDogRXhwb25lbnR9W119IHNvcnRlZCwgYmlnZ2VzdCB0byBzbWFsbGVzdCBnYXAuXHJcbiAgICAgKi9cclxuICAgIGdldFN1Z2dlc3Rpb25zKCkgOiB7bG9jYXRpb24gOiBudW1iZXIsIGVmZmljaWVuY3kgOiBudW1iZXIsIGV4cG9uZW50OiBFeHBvbmVudH1bXSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5Lm1hcCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBleHBvbmVudDogbmV3IEV4cG9uZW50KGlkeCksXHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5OiAoaXRlbSk/IHRoaXMuZWZmaWNpZW5jeShpdGVtLmtleSwgaWR4KSA6IE1hdGguYWJzKENob3Jkb2lkLmxvb2t1cFRhYmxlW2lkeF0vMiksXHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5yZXJlbGF0aXZpemUoQ2hvcmRvaWQubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxuICAgIGFsbCgpIDogVFtde1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFycmF5LmZpbHRlcihlID0+IGUpLm1hcChlID0+IGUub2JqKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFeHBvbmVudCBleHRlbmRzIE51bWJlcntcclxuICAgIGNvbnN0cnVjdG9yKGV4cG9uZW50IDogbnVtYmVyKXtcclxuICAgICAgICBpZihcclxuICAgICAgICAgICAgTWF0aC5hYnMoZXhwb25lbnQpICE9IGV4cG9uZW50IHx8XHJcbiAgICAgICAgICAgIGV4cG9uZW50IDwgMCAgfHxcclxuICAgICAgICAgICAgZXhwb25lbnQgPj0gQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoXHJcbiAgICAgICAgKSB0aHJvdyBcImludmFsaWQgZXhwb25lbnRcIjtcclxuICAgICAgICBzdXBlcihleHBvbmVudCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQge3J0Y2NvbmZpZ30gZnJvbSBcIi4vcnRjY29uZmlnXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi9Db25uZWN0aW9uRXJyb3JcIjtcclxuaW1wb3J0IHtTeW5jaHJvbmljaXR5fSBmcm9tIFwiLi4vdG9vbHMvU3luY2hyb25pY2l0eVwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSVENEYXRhQ2hhbm5lbCBleHRlbmRzIEV2ZW50VGFyZ2V0e1xyXG4gICAgb25jbG9zZTogRnVuY3Rpb247XHJcbiAgICBvbmVycm9yOiBGdW5jdGlvbjtcclxuICAgIG9ubWVzc2FnZTogRnVuY3Rpb247XHJcbiAgICBvbm9wZW46IEZ1bmN0aW9uO1xyXG4gICAgY2xvc2UoKTtcclxuICAgIHNlbmQobXNnIDogc3RyaW5nIHwgQmxvYiB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3KTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgY29ubmVjdGlvbiB0byBvbmUgcGVlci4gY2FuIGNvbnRhaW4gbXVsdGlwbGUgY2hhbm5lbHMuXHJcbiAqIEBwcm9wZXJ0eSBvcGVuIHtQcm9taXNlPHRoaXM+fSByZXNvbHZlcyB3aGVuIHRoZSBjaGFubmVscyBhcmUgcmVhZHlcclxuICogQHByb3BlcnR5IGNsb3NlZCBbUHJvbWlzZTx0aGlzPn0gcmVzb2x2ZXMgd2hlbiB0aGUgY29ubmVjdGlvbiB0ZXJtaW5hdGVzIG5vcm1hbGx5LiBSZWplY3RzIG9uIG1hbmdsZWQgbWVzc2FnZXMgb3Igb3ZlcmZsb3duIGJ1ZmZlcnMuIGNvbnNpZGVyIGJhbm5pbmcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbntcclxuICAgIHByaXZhdGUgcnRjUGVlckNvbm5lY3Rpb24gOiBSVENQZWVyQ29ubmVjdGlvbjtcclxuICAgIHJlYWRvbmx5IG9wZW4gOiBQcm9taXNlPHRoaXM+OyAvLyBleHBvcnQgYXMgcHJvbWlzZSwgYnV0IFN5bmNocm9uaWNpdHkgaW50ZXJuYWxseVxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBhbGxDaGFubmVsc09wZW4gOiBTeW5jaHJvbmljaXR5OyAvLyBuZWNlc3NhcnkgYmVjYXVzZSBSVEMgaXMgbm9uIGRldGVybWluaXN0aWNcclxuICAgIHJlYWRvbmx5IGNsb3NlZCA6IFByb21pc2U8dGhpcz47IC8vYWNjZXB0IG9uIGNsb3NlLCByZWplY3Qgb24gbWlzYmVoYXZpb3JcclxuXHJcbiAgICBwcml2YXRlIGNvbm5lY3Rpb25JdGVyYXRvciA9IDA7IC8vZ2l2ZSBhIHVuaXF1ZSBuYW1lIHRvIHRoZSBjaGFubmVscy5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24ocnRjY29uZmlnKTtcclxuICAgICAgICB0aGlzLmFsbENoYW5uZWxzT3BlbiA9IG5ldyBTeW5jaHJvbmljaXR5KCk7XHJcbiAgICAgICAgdGhpcy5vcGVuID0gdGhpcy5hbGxDaGFubmVsc09wZW4udGhlbigoKT0+dGhpcyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZWQgPSBuZXcgRnV0dXJlPHRoaXM+KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgZGF0YSBpbiBzdHJpbmcuXHJcbiAgICAgKiBnaXZlcyB5b3UgYSBmdW5jdGlvbiB5b3UgY2FuIHNlbmQgYnVmZmVyIG1lc3NhZ2VzIGludG8sIHByb21pc2VzIGEgcmVzcG9uc2UuXHJcbiAgICAgKiB1c2VzIHN0cmluZ3MsIGJlY2F1c2UgZmlyZWZveCBoYXMgcHJvYmxlbXMgd2l0aCBnZW5lcmljIGJ5dGUgYXJyYXlzLiBhbHRob3VnaC4uIHdobyBjYXJlcyBhYm91dCBmaXJlZm94P1xyXG4gICAgICogQHBhcmFtIHsocmVxdWVzdDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz59IG9ubWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heE9wZW5NZXNzYWdlc1xyXG4gICAgICogQHJldHVybnMgeyhyZXF1ZXN0OiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgY3JlYXRlQ2hhbm5lbChcclxuICAgICAgICBvbm1lc3NhZ2UgOiBSZXF1ZXN0RnVuY3Rpb248c3RyaW5nLCBzdHJpbmc+LFxyXG4gICAgICAgIG1heE9wZW5NZXNzYWdlcz0xMDBcclxuICAgIClcclxuICAgICAgICA6IFJlcXVlc3RGdW5jdGlvbjxzdHJpbmcsIHN0cmluZz5cclxuICAgIHtcclxuICAgICAgICBpZih0aGlzLmFsbENoYW5uZWxzT3Blbi5nZXRTdGF0ZSgpICE9IFwicGVuZGluZ1wiKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJjaGFubmVscyBjYW4gb25seSBiZSBjcmVhdGVkIGJlZm9yZSBzdGFydGluZyB0aGUgY29ubmVjdGlvbiFcIlxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlcXVlc3RDaGFubmVsID0gKHRoaXMucnRjUGVlckNvbm5lY3Rpb24gYXMgYW55KS5jcmVhdGVEYXRhQ2hhbm5lbCh0aGlzLmNvbm5lY3Rpb25JdGVyYXRvciwge25lZ290aWF0ZWQ6IHRydWUsIGlkOiB0aGlzLmNvbm5lY3Rpb25JdGVyYXRvcisrfSk7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlQ2hhbm5lbCA9ICh0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uIGFzIGFueSkuY3JlYXRlRGF0YUNoYW5uZWwodGhpcy5jb25uZWN0aW9uSXRlcmF0b3IsIHtuZWdvdGlhdGVkOiB0cnVlLCBpZDogdGhpcy5jb25uZWN0aW9uSXRlcmF0b3IrK30pO1xyXG5cclxuICAgICAgICBsZXQgcmVzcG9uc2VDaGFubmVsT3BlbiA9IG5ldyBGdXR1cmU8UlRDRGF0YUNoYW5uZWw+KCk7XHJcbiAgICAgICAgbGV0IHJlcXVlc3RDaGFubmVsT3BlbiA9IG5ldyBGdXR1cmU8UlRDRGF0YUNoYW5uZWw+KCk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxsQ2hhbm5lbHNPcGVuLmFkZChyZXNwb25zZUNoYW5uZWxPcGVuKTtcclxuICAgICAgICB0aGlzLmFsbENoYW5uZWxzT3Blbi5hZGQocmVxdWVzdENoYW5uZWxPcGVuKTtcclxuXHJcbiAgICAgICAgbGV0IG9wZW5SZXF1ZXN0cyA9IDA7XHJcblxyXG5cclxuICAgICAgICAvLyBFbnN1cmUgYWxsIGNoYW5uZWxzIGFyZSBvcGVuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHJlcXVlc3RDaGFubmVsLm9ub3BlbiA9ICgpPT57XHJcbiAgICAgICAgICAgIHJlcXVlc3RDaGFubmVsT3Blbi5yZXNvbHZlKHJlcXVlc3RDaGFubmVsKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5vbm9wZW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlQ2hhbm5lbE9wZW4ucmVzb2x2ZShyZXNwb25zZUNoYW5uZWwpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vaGFuZGxlIHRoZSBzZW5kaW5nIG9mIGEgcmVzcG9uc2VNZXNzYWdlLiBpcyBhbHRlcmVkIGJ5IGJvdW5jZS5cclxuICAgICAgICBsZXQgcmVzcG9uc2VEaXNwYXRjaCA9IChtZXNzYWdlIDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5zZW5kKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBvcGVuUmVxdWVzdHMtLTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBoYW5kbGUgRk9SRUlHTiBSRVFVRVNUU1xyXG4gICAgICAgIC8vIGEgcmVxdWVzdCBpcyBjb21pbmcgaW4uXHJcbiAgICAgICAgcmVxdWVzdENoYW5uZWwub25tZXNzYWdlID0gKG1lc3NhZ2UgOiBNZXNzYWdlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgb3BlblJlcXVlc3RzKys7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA6IHN0cmluZyA9IG1lc3NhZ2UuZGF0YTtcclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZSA9IGRhdGEuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgICAgICAvL2FudGkgRE9TXHJcbiAgICAgICAgICAgIC8vcGFydG5lciB0cmllcyB0byBmbG9vZCB1c1xyXG4gICAgICAgICAgICBpZihvcGVuUmVxdWVzdHMgPiBtYXhPcGVuTWVzc2FnZXMpe1xyXG4gICAgICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5zZW5kKENvbm5lY3Rpb25FcnJvci5JbmJ1ZmZlckV4aGF1c3RlZCgpLnRyYW5zbWl0KDApKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZG9uJ3QgY2FyZSBpZiB0aGV5IGRvbid0IHJlY2VpdmUgaXQsIHRoZXkncmUgY3JpbWluYWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vdG9kbzogaW1wbGVtZW50IElQIGJhblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkcm9wcGVkIHNwYW1taW5nIHBlZXJcIik7XHJcbiAgICAgICAgICAgICAgICAoc2VsZi5jbG9zZWQgYXMgRnV0dXJlPHRoaXM+KS5yZWplY3Qoc2VsZik7XHJcbiAgICAgICAgICAgICAgICB0cnl7c2VsZi5jbG9zZSgpO31jYXRjaChlKXt9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL3BlcmZvcm0gb25tZXNzYWdlXHJcbiAgICAgICAgICAgIG9ubWVzc2FnZShkYXRhLnNsaWNlKDEpKSAvLyBmaXJzdCBzeW1ib2wgaXMgcmVmZXJlbmNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoKHNlbGYuY2xvc2VkIGFzIEZ1dHVyZTx0aGlzPikuZ2V0U3RhdGUoKSAhPSBcInBlbmRpbmdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3QgdHJhbnNtaXQuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ2hhbm5lbE9wZW4udGhlbigoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VEaXNwYXRjaChTdHJpbmcuZnJvbUNvZGVQb2ludChyZWZlcmVuY2UpICsgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKCBlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoKHNlbGYuY2xvc2VkIGFzIEZ1dHVyZTx0aGlzPikuZ2V0U3RhdGUoKSAhPSBcInBlbmRpbmdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3QgdHJhbnNtaXQuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFuc21pc3NpYmxlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbWlzc2libGUgPSBlcnJvci50cmFuc21pdChyZWZlcmVuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNtaXNzaWJsZSA9IENvbm5lY3Rpb25FcnJvci5VbmNhdWdodFJlbW90ZUVycm9yKCkudHJhbnNtaXQocmVmZXJlbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDaGFubmVsT3Blbi50aGVuKCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZURpc3BhdGNoKHRyYW5zbWlzc2libGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBoYW5kbGUgUkVRVUVTVCBESVNQQVRDSElOR1xyXG4gICAgICAgIC8vc3RvcmUgb3V0Z29pbmcgbWVzc2FnZSBmdXR1cmVzIGhlcmVcclxuICAgICAgICBsZXQgY2FsbGJhY2tCdWZmZXIgOiBGdXR1cmU8c3RyaW5nPltdID0gbmV3IEFycmF5KG1heE9wZW5NZXNzYWdlcykuZmlsbChudWxsKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbnRSZXF1ZXN0cyA9IDA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGJvdW5jZSBhbGwgbWVzc2FnZXMgaW4gdGhlIGJ1ZmZlclxyXG4gICAgICAgICAqIGVmZmVjdGl2ZWx5IGp1c3QgcmV0dXJucyBhbiBlcnJvciBldmVyeXdoZXJlLlxyXG4gICAgICAgICAqIGFub3RoZXIgbGF5ZXIgc2hvdWxkIGRldGVybWluZSB3aGF0IHRvIGRvIHdpdGggdGhhdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgYm91bmNlID0gKCkgPT57XHJcbiAgICAgICAgICAgIHNlbGYucnRjUGVlckNvbm5lY3Rpb24uY2xvc2UoKTtcclxuICAgICAgICAgICAgcmVzcG9uc2VEaXNwYXRjaCA9ICgpPT57fTsgLy8gYW55IHJlc3BvbnNlcyBnZXQgc2ltcGx5IGRyb3BwZWQuXHJcbiAgICAgICAgICAgIChzZWxmLmNsb3NlZCBhcyBGdXR1cmU8dGhpcz4pLnJlc29sdmUoc2VsZik7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyLmZpbHRlcihlID0+IGUpLmZvckVhY2goZSA9PiBlLnJlamVjdChDb25uZWN0aW9uRXJyb3IuQm91bmNlZCgpKSk7XHJcbiAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0Q2hhbm5lbC5vbmNsb3NlID0gYm91bmNlO1xyXG4gICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5vbmNsb3NlID0gYm91bmNlO1xyXG5cclxuICAgICAgICAvL3Jlc29sdmUgYW5kIGNsZWFyIHRoZSBwYXJrZWQgZnV0dXJlcyBvbiByZXNwb25zZVxyXG4gICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA6IHN0cmluZyA9IG1lc3NhZ2UuZGF0YTtcclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZSA9IGRhdGEuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgICAgICBpZihyZWZlcmVuY2UgPT0gMCl7IC8vIGFuIGVycm9yIG9jY3VycmVkIHJlbW90ZWx5IVxyXG4gICAgICAgICAgICAgICAgbGV0IGVyciA9IENvbm5lY3Rpb25FcnJvci5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IGVyci5yZWZlcmVuY2U7XHJcbiAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbcmVmZXJlbmNlXS5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0J1ZmZlcltyZWZlcmVuY2VdID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBzZW50UmVxdWVzdHMtLTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0B0b2RvOiBpbXBsZW1lbnQgaXAgYmFubmluZ1xyXG4gICAgICAgICAgICAgICAgICAgIChzZWxmLmNsb3NlZCBhcyBGdXR1cmU8dGhpcz4pLnJlamVjdChzZWxmKTtcclxuICAgICAgICAgICAgICAgICAgICBib3VuY2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbcmVmZXJlbmNlXS5yZXNvbHZlKGRhdGEuc2xpY2UoMSkpO1xyXG4gICAgICAgICAgICBjYWxsYmFja0J1ZmZlcltyZWZlcmVuY2VdID0gbnVsbDtcclxuICAgICAgICAgICAgc2VudFJlcXVlc3RzLS07XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBhY3R1YWxseSBESVNQQVRDSCBSRVFVRVNUU1xyXG4gICAgICAgIHJldHVybiAocmVxdWVzdCA6IHN0cmluZyk9PiB7XHJcbiAgICAgICAgICAgIHNlbnRSZXF1ZXN0cysrO1xyXG5cclxuICAgICAgICAgICAgLy93ZSBkb24ndCB3YW50IHRvIHNwYW0gb3VyIHBhcnRuZXIsIG90aGVyd2lzZSB0aGV5IGRyb3AgdXMuXHJcbiAgICAgICAgICAgIGlmKHNlbnRSZXF1ZXN0cyA+PSBtYXhPcGVuTWVzc2FnZXMpe1xyXG4gICAgICAgICAgICAgICAgc2VudFJlcXVlc3RzLS07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoQ29ubmVjdGlvbkVycm9yLk91dGJ1ZmZlckV4aGF1c3RlZCgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZmluZCBhIHNwYWNlIGluIHRoZSBjYWxsYmFja0J1ZmZlclxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gY2FsbGJhY2tCdWZmZXIuaW5kZXhPZihudWxsLCAxKTsgLy8gZXhjbHVkZSBzcG90IDAsIGZvciBlcnJvcnMgbiBzdHVmZlxyXG5cclxuICAgICAgICAgICAgbGV0IGZ1dHVyZSA9IG5ldyBGdXR1cmU8c3RyaW5nPigpO1xyXG5cclxuICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbaWR4XSA9IGZ1dHVyZTtcclxuXHJcbiAgICAgICAgICAgIHJlcXVlc3RDaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQoaWR4KSArIHJlcXVlc3QpO1xyXG4gICAgICAgICAgICByZXR1cm4gZnV0dXJlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgICBvZmZlcigpIDogUHJvbWlzZTxPZmZlcj57XHJcbiAgICAgICAgaWYodGhpcy5hbGxDaGFubmVsc09wZW4uZ2V0U3RhdGUoKSAhPSBcInBlbmRpbmdcIil7XHJcbiAgICAgICAgICAgIHRocm93IFwidGhpcyBjb25uZWN0aW9uIGlzIGFscmVhZHkgYWN0aXZlIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLmNyZWF0ZU9mZmVyKCkudGhlbihkZXNjcmlwdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gcHJvbWlzZSB0byB3YWl0IGZvciB0aGUgc2RwXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPE9mZmVyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24ub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQoe3NkcDogdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uLnNkcH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhbnN3ZXIob2ZmZXIgOiBPZmZlcikgOiBQcm9taXNlPEFuc3dlcj57XHJcbiAgICAgICAgaWYodGhpcy5hbGxDaGFubmVsc09wZW4uZ2V0U3RhdGUoKSAhPSBcInBlbmRpbmdcIil7XHJcbiAgICAgICAgICAgIHRocm93IFwidGhpcyBjb25uZWN0aW9uIGlzIGFscmVhZHkgYWN0aXZlIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9mZmVyXCIsXHJcbiAgICAgICAgICAgIHNkcDogb2ZmZXIuc2RwXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uY3JlYXRlQW5zd2VyKCkudGhlbihkZXNjcmlwdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEFuc3dlcj4oKGFjY2VwdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLm9uaWNlY2FuZGlkYXRlID0gZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgYWNjZXB0KHtzZHA6IHRoaXMucnRjUGVlckNvbm5lY3Rpb24ubG9jYWxEZXNjcmlwdGlvbi5zZHB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgY29tcGxldGUoYW5zd2VyIDogQW5zd2VyKSA6IFByb21pc2U8dm9pZD57XHJcbiAgICAgICAgaWYodGhpcy5hbGxDaGFubmVsc09wZW4uZ2V0U3RhdGUoKSAhPSBcInBlbmRpbmdcIil7XHJcbiAgICAgICAgICAgIHRocm93IFwidGhpcyBjb25uZWN0aW9uIGlzIGFscmVhZHkgYWN0aXZlIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgICAgICAgdHlwZTogXCJhbnN3ZXJcIixcclxuICAgICAgICAgICAgc2RwOiBhbnN3ZXIuc2RwXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgLy8gc2hvdWxkIHByb3BhZ2F0ZSBpbnRvIGJvdW5jZSwgZXRjLlxyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uY2xvc2UoKTtcclxuICAgICAgICAodGhpcy5jbG9zZWQgYXMgRnV0dXJlPHRoaXM+KS5yZXNvbHZlKHRoaXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5pbnRlcmZhY2UgU0RQe3NkcDogc3RyaW5nO31cclxuZXhwb3J0IGludGVyZmFjZSBPZmZlciBleHRlbmRzIFNEUHtcclxuXHJcbn1cclxuZXhwb3J0IGludGVyZmFjZSBBbnN3ZXIgZXh0ZW5kcyBTRFB7XHJcblxyXG59XHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEZ1bmN0aW9uPFJlcXVlc3RULCBSZXNwb25zZVQ+e1xyXG4gICAgKHJlcXVlc3QgOlJlcXVlc3RUKSA6IFByb21pc2U8UmVzcG9uc2VUPlxyXG59IiwiLyoqXHJcbiAqIEJFRk9SRSBFWFRFTkRJTkc6IEBzZWUgRXJyb3JzLm1kXHJcbiAqIEBwcm9wZXJ0eSB0eXBlIHtudW1iZXJ9IHR5cGUgb2YgZXJyb3IuIE5hbWUgYW5kIGFubm90YXRlIHRoZSBmYWN0b3JpZXMsIHNvIHRoZXkgY2FuIGJlIGlkZW50aWZpZWRcclxuICogQHByb3BlcnR5IGxvY2FsIHtib29sZWFufSB3aGV0aGVyIHRoZSBlcnJvciBvcmlnaW5hdGVkIGxvY2FsbHkgb3IgcmVtb3RlbHlcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICB0eXBlOiBudW1iZXI7XHJcbiAgICBkYXRhOiBzdHJpbmc7XHJcbiAgICByZWZlcmVuY2U6IG51bWJlcjtcclxuICAgIGxvY2FsOiBib29sZWFuOyAvLyBsb2NhbCBvciByZW1vdGVcclxuICAgIGNvbnN0cnVjdG9yKHR5cGUgOiBudW1iZXIsIHJlZmVyZW5jZSA6IG51bWJlciwgbG9jYWwgPSB0cnVlKXtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMucmVmZXJlbmNlID0gcmVmZXJlbmNlO1xyXG4gICAgICAgIHRoaXMubG9jYWwgPSBsb2NhbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBJbmJ1ZmZlckV4aGF1c3RlZCgpOiBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uRXJyb3IoMSwgbnVsbCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgT3V0YnVmZmVyRXhoYXVzdGVkKCk6IENvbm5lY3Rpb25FcnJvcntcclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcigyLCBudWxsKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBQYXJ0aWNpcGFudFVucmVhY2hhYmxlKCk6IENvbm5lY3Rpb25FcnJvcntcclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcigzLCBudWxsKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBSZWNlaXZlZEdhcmJhZ2UoKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDQsIG51bGwpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIFVuZXhwZWN0ZWRSZXNwb25zZSgpOiBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uRXJyb3IoNSwgbnVsbCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgTmV0d29ya0VtcHR5KCk6IENvbm5lY3Rpb25FcnJvcntcclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcig2LCBudWxsKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBVbmNhdWdodFJlbW90ZUVycm9yKCk6IENvbm5lY3Rpb25FcnJvcntcclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcig3LCBudWxsKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBCb3VuY2VkKCk6IENvbm5lY3Rpb25FcnJvcnsgLy8gdGhlIGNvbm5lY3Rpb24gY2xvc2VkIHVuZXhwZWN0ZWRseS5cclxuICAgICAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25FcnJvcig4LCBudWxsKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdHJhbnNtaXQocmVmZXJlbmNlIDogbnVtYmVyKTogc3RyaW5ne1xyXG4gICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludCgwLCB0aGlzLnR5cGUsIHJlZmVyZW5jZSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcGFyc2UoZGF0YTogc3RyaW5nKTogQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKGRhdGEuY29kZVBvaW50QXQoMSksIGRhdGEuY29kZVBvaW50QXQoMiksIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiIsImltcG9ydCB7Q29ubmVjdGlvbiwgUmVxdWVzdEZ1bmN0aW9ufSBmcm9tIFwiLi9Db25uZWN0aW9uXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi9Db25uZWN0aW9uRXJyb3JcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBUeXBlZENvbm5lY3Rpb24gZXh0ZW5kcyBDb25uZWN0aW9ue1xyXG4gICAgLyoqXHJcbiAgICAgKiBUeXBlZCB2ZXJzaW9uIG9mIGNyZWF0ZVJhd0NoYW5uZWxcclxuICAgICAqIFJlcXVlc3QgdHlwZSBSZXF1ZXN0VCBleHBlY3RzIHJlc3BvbnNlIHR5cGUgUmVzcG9uc2VULiBSZXF1ZXN0VCBhbmQgUmVzcG9uc2VUIHNob3VsZCBiZSBkYXRhIHRyYW5zZmVyIHN0cnVjdHVyZXMuIEFsbCBmaWVsZHMgbXVzdCBzdXBwb3J0IEpTT04gc3RyaW5naWZ5LlxyXG4gICAgICogQHBhcmFtIHsocmVxdWVzdDogUmVxdWVzdFQpID0+IFByb21pc2U8UmVzcG9uc2VUPn0gb25tZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4T3Blbk1lc3NhZ2VzXHJcbiAgICAgKiBAcmV0dXJucyB7KHJlcXVlc3Q6IFJlcXVlc3RUKSA9PiBQcm9taXNlPFJlc3BvbnNlVD59IHBpcGUgeW91ciBtZXNzYWdlcyBpbnRvIHRoaXMuIGNhdGNoIGZvciBlcnJvcnMsIGhpbnRpbmcgeW91IG1heSB3YW50IHRvIHJldHJhbnNtaXQgeW91ciBwYWNrYWdlcyB0aHJvdWdoIG90aGVyIHJvdXRlcy5cclxuICAgICAqL1xyXG4gICAgY3JlYXRlQ2hhbm5lbDxSZXF1ZXN0VCxSZXNwb25zZVQ+KG9ubWVzc2FnZSA6IFJlcXVlc3RGdW5jdGlvbjxSZXF1ZXN0VCwgUmVzcG9uc2VUPixtYXhPcGVuTWVzc2FnZXM9MTAwKSA6IFJlcXVlc3RGdW5jdGlvbjxSZXF1ZXN0VCwgUmVzcG9uc2VUPntcclxuXHJcbiAgICAgICAgbGV0IGNoYW5uZWwgPSBzdXBlci5jcmVhdGVDaGFubmVsKHJlcXVlc3QgPT57XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvbm1lc3NhZ2UoSlNPTi5wYXJzZShyZXF1ZXN0KSkuXHJcbiAgICAgICAgICAgICAgICB0aGVuKHJlc3BvbnNlID0+IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChDb25uZWN0aW9uRXJyb3IuUmVjZWl2ZWRHYXJiYWdlKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgbWF4T3Blbk1lc3NhZ2VzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChyZXF1ZXN0KT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gY2hhbm5lbChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSkuXHJcbiAgICAgICAgICAgIHRoZW4ocmVzcG9uc2UgPT4gSlNPTi5wYXJzZShyZXNwb25zZSkpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgbGV0IHJ0Y2NvbmZpZyA9IHtcclxuICAgIGljZVNlcnZlcnM6IFt7dXJsczogXCJzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyXCJ9XVxyXG59O1xyXG5cclxuIiwiaW1wb3J0IHt1dGY4RGVjb2RlciwgdXRmOEVuY29kZXJ9IGZyb20gXCIuLi90b29scy91dGY4YnVmZmVyXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFByaXZhdGVLZXkge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWFkeSA6IFByb21pc2VMaWtlPGFueT47XHJcbiAgICBwcml2YXRlIHByaXZhdGVLZXkgOiBDcnlwdG9LZXk7XHJcbiAgICBwcml2YXRlIHB1YmxpY0tleSA6IFB1YmxpY0tleTtcclxuICAgIHJlYWRvbmx5IHZlcnNpb24gPSAyO1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSB3aW5kb3cuY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgW1wic2lnblwiLCBcInZlcmlmeVwiXVxyXG4gICAgICAgICAgICApLnRoZW4oa2V5cyA9PiB7IC8va2V5czoge3ByaXZhdGVLZXk6IENyeXB0b0tleSwgcHVibGljS2V5OiBDcnlwdG9LZXl9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBrZXlzLnByaXZhdGVLZXk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVibGljS2V5XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KS50aGVuKGp3ayA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG5ldyBQdWJsaWNLZXkoandrKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbjxUPihvYmogOiBUKSA6IFByb21pc2U8VmVyRG9jPFQ+PiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9iaik7XHJcbiAgICAgICAgbGV0IHB1ayA9IHRoaXMucHVibGljS2V5LnRvSlNPTigpO1xyXG4gICAgICAgIGxldCBoZWFkZXIgPSBTdHJpbmcuZnJvbUNvZGVQb2ludCh0aGlzLnZlcnNpb24sIHB1ay5sZW5ndGgsIGRhdGEubGVuZ3RoKTtcclxuICAgICAgICBsZXQgc2lnbmFibGUgPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IHNpZ2J1ZmZlciA9IGF3YWl0IHdpbmRvdy5jcnlwdG8uc3VidGxlLnNpZ24oXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHJpdmF0ZUtleSxcclxuICAgICAgICAgICAgc2lnbmFibGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgY2hlY2tzbSA9IHV0ZjhFbmNvZGVyLmVuY29kZShoZWFkZXIrcHVrK2RhdGEpLnJlZHVjZSgoYSxjLGkpPT5hK2MqaSwwKTtcclxuICAgICAgICBsZXQgdWZ0ID0gIG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcik7XHJcbiAgICAgICAgbGV0IGNoZWMyID0gbmV3IFVpbnQ4QXJyYXkoc2lnYnVmZmVyKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcblxyXG4gICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oKTtcclxuICAgICAgICB2ZC5vcmlnaW5hbCA9IGhlYWRlcitwdWsrZGF0YStTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5uZXcgVWludDhBcnJheShzaWdidWZmZXIpKTtcclxuICAgICAgICB2ZC5rZXkgPSB0aGlzLnB1YmxpY0tleTtcclxuICAgICAgICB2ZC5kYXRhID0gb2JqO1xyXG4gICAgICAgIHZkLnNpZ25hdHVyZSA9IEpTT04uc3RyaW5naWZ5KG5ldyBVaW50OEFycmF5KHNpZ2J1ZmZlcikpO1xyXG5cclxuICAgICAgICBsZXQga3UgPSB1dGY4RW5jb2Rlci5lbmNvZGUodmQub3JpZ2luYWwpO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHZkO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZ2V0UHVibGljSGFzaCgpIDogUHJvbWlzZTxudW1iZXI+e1xyXG4gICAgICAgIGF3YWl0IHRoaXMucmVhZHk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaWNLZXkucmVhZHk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHVibGljS2V5Lmhhc2hlZCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogVmVyRG9jIERBT1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJhd0RvYzxUPntcclxuICAgIG9yaWdpbmFsIDogc3RyaW5nO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFZlckRvYzxUPiBleHRlbmRzIFJhd0RvYzxUPntcclxuICAgIGRhdGE6IFQ7XHJcbiAgICBrZXk6IFB1YmxpY0tleTtcclxuICAgIHNpZ25hdHVyZTogc3RyaW5nO1xyXG4gICAgc3RhdGljIGFzeW5jIHJlY29uc3RydWN0PFQ+KHJhd0RvYyA6IFJhd0RvYzxUPikgOiBQcm9taXNlPFZlckRvYzxUPj57XHJcbiAgICAgICAgbGV0IHZlcnNpb24gPSByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodmVyc2lvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMjoge1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHJpbmcoMCwzKTtcclxuICAgICAgICAgICAgICAgIGxldCBwdWsgPSByYXdEb2Mub3JpZ2luYWwuc3Vic3RyKDMsIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IHJhd0RvYy5vcmlnaW5hbC5zdWJzdHIoMyArIHJhd0RvYy5vcmlnaW5hbC5jb2RlUG9pbnRBdCgxKSwgcmF3RG9jLm9yaWdpbmFsLmNvZGVQb2ludEF0KDIpKTtcclxuICAgICAgICAgICAgICAgIGxldCBzaWcgPSByYXdEb2Mub3JpZ2luYWwuc3Vic3RyKDMgKyByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMSkgKyByYXdEb2Mub3JpZ2luYWwuY29kZVBvaW50QXQoMikpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBrZXkgPSBhd2FpdCBuZXcgUHVibGljS2V5KFxyXG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1a1xyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICkucmVhZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrc20gPSB1dGY4RW5jb2Rlci5lbmNvZGUoaGVhZGVyK3B1aytkYXRhKS5yZWR1Y2UoKGEsYyxpKT0+YStjKmksMCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdWZ0ID0gIHV0ZjhFbmNvZGVyLmVuY29kZShzaWcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWMyID0gdXRmOEVuY29kZXIuZW5jb2RlKHNpZykucmVkdWNlKChhLGMsaSk9PmErYyppLDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKFxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGtleS52ZXJpZnkodXRmOEVuY29kZXIuZW5jb2RlKGhlYWRlcitwdWsrZGF0YSksIG5ldyBVaW50OEFycmF5KHNpZy5zcGxpdCgnJykubWFwKGMgPT4gYy5jb2RlUG9pbnRBdCgwKSkpKVxyXG4gICAgICAgICAgICAgICAgKXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmQgPSBuZXcgVmVyRG9jPFQ+KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQuc2lnbmF0dXJlID0gc2lnO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmtleSA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5vcmlnaW5hbCA9IHJhd0RvYy5vcmlnaW5hbDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiYmFkIGRvY3VtZW50XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBQcm9taXNlLnJlamVjdChcInZlcnNpb24gdW5zdXBwb3J0ZWQ6IFwiK3ZlcnNpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gaGFzaCBQLTM4NCBTUEtJIGludG8gKDAsMSkgZmxvYXRcclxuZnVuY3Rpb24gU1BLSXRvTnVtZXJpYyhzcGtpOiBBcnJheUJ1ZmZlcikgOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHNwa2kpLlxyXG4gICAgICAgIHNsaWNlKC05NikuXHJcbiAgICAgICAgcmV2ZXJzZSgpLlxyXG4gICAgICAgIHJlZHVjZSgoYSxlLGkpPT5hK2UqTWF0aC5wb3coMjU2LGkpLCAwKSAvXHJcbiAgICAgICAgTWF0aC5wb3coMjU2LCA5Nik7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQdWJsaWNLZXkge1xyXG4gICAgcHJpdmF0ZSBwdWJsaWNDcnlwdG9LZXk6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgZmxvYXRpbmc6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgandrOiBKc29uV2ViS2V5O1xyXG4gICAgcmVhZHk7XHJcbiAgICBjb25zdHJ1Y3Rvcihqd2s6IEpzb25XZWJLZXkpe1xyXG4gICAgICAgIGxldCBwcm90b0pXSyA9IHtcImNydlwiOlwiUC0zODRcIiwgXCJleHRcIjp0cnVlLCBcImtleV9vcHNcIjpbXCJ2ZXJpZnlcIl0sIFwia3R5XCI6XCJFQ1wiLCBcInhcIjpqd2tbXCJ4XCJdLCBcInlcIjpqd2tbXCJ5XCJdfTtcclxuICAgICAgICB0aGlzLmZsb2F0aW5nID0gTmFOO1xyXG4gICAgICAgIHRoaXMuandrID0gcHJvdG9KV0s7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHdpbmRvdy5jcnlwdG8uc3VidGxlLmltcG9ydEtleShcclxuICAgICAgICAgICAgXCJqd2tcIixcclxuICAgICAgICAgICAgdGhpcy5qd2ssXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIG5hbWVkQ3VydmU6IFwiUC0zODRcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgW1widmVyaWZ5XCJdXHJcbiAgICAgICAgKS50aGVuKHB1YmxpY0NyeXB0b0tleSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5ID0gcHVibGljQ3J5cHRvS2V5O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgIFwic3BraVwiLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wdWJsaWNDcnlwdG9LZXlcclxuICAgICAgICAgICAgKS50aGVuKHNwa2kgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mbG9hdGluZyA9IFNQS0l0b051bWVyaWMoc3BraSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkudGhlbigoKT0+dGhpcyk7XHJcbiAgICB9XHJcbiAgICBoYXNoZWQoKXtcclxuICAgICAgICBpZihpc05hTih0aGlzLmZsb2F0aW5nKSkgdGhyb3cgRXJyb3IoXCJOb3QgUmVhZHkuXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZsb2F0aW5nO1xyXG4gICAgfVxyXG4gICAgdG9KU09OKCl7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcInhcIjogdGhpcy5qd2tbXCJ4XCJdLCBcInlcIjogdGhpcy5qd2tbXCJ5XCJdfSk7XHJcbiAgICB9XHJcbiAgICB2ZXJpZnkoZGF0YTogVWludDhBcnJheSwgc2lnbmF0dXJlOiBBcnJheUJ1ZmZlcik6IFByb21pc2VMaWtlPGJvb2xlYW4+e1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuY3J5cHRvLnN1YnRsZS52ZXJpZnkoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiRUNEU0FcIixcclxuICAgICAgICAgICAgICAgIGhhc2g6IHtuYW1lOiBcIlNIQS0zODRcIn0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5LFxyXG4gICAgICAgICAgICBzaWduYXR1cmUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGZyb21TdHJpbmcoandrc3RyaW5nOiBzdHJpbmcpOiBQdWJsaWNLZXl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQdWJsaWNLZXkoSlNPTi5wYXJzZShqd2tzdHJpbmcpKTtcclxuICAgIH1cclxufSIsImltcG9ydCB7UHJpdmF0ZUtleSwgUHVibGljS2V5LCBSYXdEb2MsIFZlckRvY30gZnJvbSBcIi4uL2NyeXB0by9Qcml2YXRlS2V5XCI7XHJcbmltcG9ydCB7QW5zd2VyLCBDb25uZWN0aW9uLCBPZmZlciwgUmVxdWVzdEZ1bmN0aW9ufSBmcm9tIFwiLi4vY29ubmVjdGlvbi9Db25uZWN0aW9uXCI7XHJcbmltcG9ydCB7Q2hvcmRvaWQsIEV4cG9uZW50fSBmcm9tIFwiLi4vY2hvcmRvaWQvQ2hvcmRvaWRcIjtcclxuaW1wb3J0IHtUeXBlZENvbm5lY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uL1R5cGVkQ29ubmVjdGlvblwiO1xyXG5pbXBvcnQge0Z1dHVyZX0gZnJvbSBcIi4uL3Rvb2xzL0Z1dHVyZVwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbkVycm9yXCI7XHJcbmltcG9ydCB7VGltZX0gZnJvbSBcIi4uL3Rvb2xzL1RpbWVcIjtcclxuaW1wb3J0IHtLSUR9IGZyb20gXCIuL2RhZW1vbnMvS0lEXCI7XHJcblxyXG4vKipcclxuICogQHByb3BlcnR5IHtQcm9taXNlPEtyZWlzSW50ZXJuYWw+fSBvcGVuIC0gZmlyZXMgd2hlbiB0aGUgc3RydWN0dXJlIGlzIGNvbm5lY3RlZCB0byBhdCBsZWFzdCBvbmUgcGVlciwgcmV0dXJucyB0aGlzIGluc3RhbmNlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgS3JlaXNJbnRlcm5hbHtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVhZHk6IFByb21pc2U8dm9pZD47XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByaXZhdGVLZXkgOiBQcml2YXRlS2V5O1xyXG4gICAgcHJpdmF0ZSBwZW5kaW5nQ29ubmVjdGlvbiA6IEtyZWlzQ29ubmVjdGlvbiB8IG51bGw7XHJcbiAgICBwcml2YXRlIHBlbmRpbmdEYWVtb25Db25uZWN0aW9uIDogS3JlaXNDb25uZWN0aW9uIHwgbnVsbDtcclxuICAgIHByaXZhdGUgc3RydWN0dXJlOiBDaG9yZG9pZDxLcmVpc0Nvbm5lY3Rpb24+O1xyXG4gICAgcmVhZG9ubHkgb3BlbjogUHJvbWlzZTx0aGlzPjtcclxuICAgIHByaXZhdGUgb3BlbmVyOiAoKT0+dm9pZDsgLy8gcmVzb2x2ZXMgXCJvcGVuc1wiO1xyXG4gICAgcHJpdmF0ZSBvcGVyYXRpdmU6IEZ1dHVyZTx0aGlzPjsgLy8gd2hlbiB0aGUgZGF0YXN0cnVjdHVyZSBpcyByZWFkeTtcclxuICAgIHByaXZhdGUgZGFlbW9uIDogS0lEO1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBuZXcgUHJpdmF0ZUtleSgpO1xyXG4gICAgICAgIHRoaXMub3BlcmF0aXZlID0gbmV3IEZ1dHVyZTx0aGlzPigpO1xyXG4gICAgICAgIHRoaXMucHJpdmF0ZUtleS5zaWduKFwiaW5pdFwiKVxyXG4gICAgICAgICAgICAudGhlbih2ZXJkb2MgPT5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RydWN0dXJlID0gbmV3IENob3Jkb2lkPEtyZWlzQ29ubmVjdGlvbj4odmVyZG9jLmtleS5oYXNoZWQoKSkpXHJcbiAgICAgICAgICAgIC50aGVuKCgpPT4gdGhpcy5vcGVyYXRpdmUucmVzb2x2ZSh0aGlzKSk7XHJcblxyXG4gICAgICAgIC8vbm90ZTogdGhpcyBpcyBndWFyYW50ZWVkIHRvIGJlIGluaXRpYWxpemVkIHVwb24gdXNlLCBiZWNhdXNlIGFueSBhY2NlcHRhbmNlIGFsc28gcmVxdWlyZXNcclxuICAgICAgICAvL2EgdmVyaWZpY2F0aW9uIGFuZCBhIHNpZ25hdHVyZVxyXG4gICAgICAgIC8vbm90ZTogdGhpcyBpcyBub3QgY29tcGxldGVseSB0cnVlLCBidXQgd2hhdGV2ZXIuXHJcbiAgICAgICAgdGhpcy5vcGVuID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbmVyID0gKCk9PntyZXNvbHZlKCl9O1xyXG4gICAgICAgIH0pLnRoZW4oKCk9PnRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmRhZW1vbiA9IG5ldyBLSUQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5vcGVuLnRoZW4oc2VsZj0+c2VsZi5kYWVtb24ucnVuKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlT2ZmZXIob2ZmZXIgOiBWZXJEb2M8S3JlaXNPZmZlcj4pIDogUHJvbWlzZTxSYXdEb2M8S3JlaXNBbnN3ZXI+PntcclxuICAgICAgICBsZXQgdGFyZ2V0QWRkcmVzcyA9IENob3Jkb2lkLmRlcmVmZXJlbmNlKG9mZmVyLmRhdGEudGFyZ2V0LCBvZmZlci5rZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgdGhpcy5zdHJ1Y3R1cmUuZGlzdGFuY2UodGFyZ2V0QWRkcmVzcykgPCBvZmZlci5kYXRhLnRvbGVyYW5jZVxyXG4gICAgICAgICAgICAmJiB0aGlzLnN0cnVjdHVyZS5pc0Rlc2lyYWJsZSh0YXJnZXRBZGRyZXNzKVxyXG4gICAgICAgICl7XHJcbiAgICAgICAgICAgIGxldCBjb25uZWN0aW9uID0gdGhpcy5jcmVhdGVDb25uZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb24ucHVibGljS2V5ID0gb2ZmZXIua2V5O1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlS2V5LnNpZ248S3JlaXNBbnN3ZXI+KHtcclxuICAgICAgICAgICAgICAgIHNkcDogYXdhaXQgY29ubmVjdGlvbi5hbnN3ZXIob2ZmZXIuZGF0YS5zZHApXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cnVjdHVyZS5nZXQodGFyZ2V0QWRkcmVzcykucHJvcGFnYXRlT2ZmZXIob2ZmZXIpO1xyXG4gICAgICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChDb25uZWN0aW9uRXJyb3IuTmV0d29ya0VtcHR5KCkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlQ29ubmVjdGlvbigpIDogS3JlaXNDb25uZWN0aW9ue1xyXG4gICAgICAgIGxldCBjb25uZWN0aW9uID0gbmV3IEtyZWlzQ29ubmVjdGlvbih0aGlzKTtcclxuICAgICAgICBjb25uZWN0aW9uLnB1YmxpY0tleSA9IG51bGw7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBjb25uZWN0aW9uLm9wZW4udGhlbihjb25uZWN0aW9uID0+IHtcclxuICAgICAgICAgICAgbGV0IGVqZWN0ZWQgPSB0aGlzLnN0cnVjdHVyZS5hZGQoY29ubmVjdGlvbi5wdWJsaWNLZXkuaGFzaGVkKCksY29ubmVjdGlvbik7XHJcbiAgICAgICAgICAgIGVqZWN0ZWQgJiYgZWplY3RlZC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9wZW5lcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyoqIGNvcmUgdXRpbGl0eVxyXG4gICAgICAgIGNvbm5lY3Rpb24ucHJvcGFnYXRlT2ZmZXIgPSBjb25uZWN0aW9uLmNyZWF0ZUNoYW5uZWw8UmF3RG9jPEtyZWlzT2ZmZXI+LCBSYXdEb2M8S3JlaXNBbnN3ZXI+PihcclxuICAgICAgICAgICAgYXN5bmMgKHJhd09mZmVyKT0+e1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaGFuZGxlT2ZmZXIoYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0KHJhd09mZmVyKSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gY29ubmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBvZmZlckNvbnN0cnVjdG9yKGluZGV4LCBjb25uZWN0aW9uIDogS3JlaXNDb25uZWN0aW9uKSA6IFByb21pc2U8VmVyRG9jPEtyZWlzT2ZmZXI+PntcclxuICAgICAgICBsZXQgZGVzaXJhYmxlO1xyXG4gICAgICAgIGlmKGluZGV4IDwgMCl7XHJcbiAgICAgICAgICAgIGRlc2lyYWJsZSA9IHtleHBvbmVudDogbmV3IEV4cG9uZW50KDApLCBlZmZpY2llbmN5OiAxfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXNpcmFibGUgPSB0aGlzLnN0cnVjdHVyZS5nZXRTdWdnZXN0aW9ucygpW2luZGV4XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVLZXkuc2lnbjxLcmVpc09mZmVyPih7XHJcbiAgICAgICAgICAgIHNkcDogYXdhaXQgY29ubmVjdGlvbi5vZmZlcigpLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IGRlc2lyYWJsZS5leHBvbmVudCxcclxuICAgICAgICAgICAgdG9sZXJhbmNlOiBkZXNpcmFibGUuZWZmaWNpZW5jeVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2VuZXJhdGVzIGFuIG9mZmVyLCBmb3IgdGhlIFJUQyBoYW5kc2hha2UuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggb2YgdGhlIGRlc2lyYWJpbGl0eSBtYXAuIG5lZ2F0aXZlIHZhbHVlcyBtYWtlIGEgdW5pdmVyc2FsIG9mZmVyLiB0b2RvOiBhZGQgZW50cm9weSB0byBpZHguXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBvZmZlcihpbmRleCA9IDApIDogUHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+e1xyXG4gICAgICAgIGF3YWl0IHRoaXMub3BlcmF0aXZlLnRoZW4oKTtcclxuICAgICAgICBpZiAodGhpcy5wZW5kaW5nQ29ubmVjdGlvbikgdGhyb3cgXCJ0aGVyZSBpcyBhIHBlbmRpbmcgY29ubmVjdGlvbiEgdXNlIHJlT2ZmZXIgaW5zdGVhZCB0byBmb3JnZXQgdGhpcyBjb25uZWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbiA9IHRoaXMuY3JlYXRlQ29ubmVjdGlvbigpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5vZmZlckNvbnN0cnVjdG9yKGluZGV4LCB0aGlzLnBlbmRpbmdDb25uZWN0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZU9mZmVyKGluZGV4ID0gMCkgOiBQcm9taXNlPFZlckRvYzxLcmVpc09mZmVyPj57XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbiAmJiB0aGlzLnBlbmRpbmdDb25uZWN0aW9uLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2ZmZXIoaW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGZyaWVuZCBLRGFlbW9uXHJcbiAgICAgKiBAYWNjZXNzIHByb3RlY3RlZFxyXG4gICAgICogQHNlZSBvZmZlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBkYWVtb25PZmZlcihpbmRleCA9IDApIDogUHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+e1xyXG4gICAgICAgIGF3YWl0IHRoaXMub3BlcmF0aXZlLnRoZW4oKTtcclxuICAgICAgICBpZiAodGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbikgdGhyb3cgXCJ0aGVyZSBpcyBhIHBlbmRpbmcgY29ubmVjdGlvbiEgdXNlIGRhZW1vblJlT2ZmZXIgaW5zdGVhZCB0byBmb3JnZXQgdGhpcyBjb25uZWN0aW9uXCI7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbiA9IHRoaXMuY3JlYXRlQ29ubmVjdGlvbigpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5vZmZlckNvbnN0cnVjdG9yKGluZGV4LCB0aGlzLnBlbmRpbmdEYWVtb25Db25uZWN0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBmcmllbmQgS0RhZW1vblxyXG4gICAgICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuICAgICAqIEBzZWUgcmVPZmZlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxWZXJEb2M8S3JlaXNPZmZlcj4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBkYWVtb25SZU9mZmVyKGluZGV4ID0gMCl7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbiAmJiB0aGlzLnBlbmRpbmdEYWVtb25Db25uZWN0aW9uLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGFlbW9uT2ZmZXIoaW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGZyaWVuZCBLRGFlbW9uXHJcbiAgICAgKiBAYWNjZXNzIHByb3RlY3RlZFxyXG4gICAgICogQHNlZSBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtSYXdEb2M8S3JlaXNBbnN3ZXI+fSBhbnN3ZXJcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFByb21pc2U8dm9pZD4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBkYWVtb25Db21wbGV0ZShhbnN3ZXIgOiBSYXdEb2M8S3JlaXNBbnN3ZXI+KXtcclxuICAgICAgICBsZXQgY29ubmVjdGlvbiA9IHRoaXMucGVuZGluZ0RhZW1vbkNvbm5lY3Rpb247XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRGFlbW9uQ29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGVDb25uZWN0aW9uKGFuc3dlciwgY29ubmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhbnN3ZXIgZnJvbSBoZXJlLCBvciBmcm9tIGRlZXBlciB3aXRoaW4gdGhlIG5ldHdvcmsuXHJcbiAgICAgKiBAcGFyYW0ge1ZlckRvYzxLcmVpc09mZmVyPn0gb2ZmZXJcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFJhd0RvYzxLcmVpc0Fuc3dlcj4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBhbnN3ZXIob2ZmZXIgOiBSYXdEb2M8S3JlaXNPZmZlcj4pIDogUHJvbWlzZTxSYXdEb2M8S3JlaXNBbnN3ZXI+PntcclxuICAgICAgICBhd2FpdCB0aGlzLm9wZXJhdGl2ZS50aGVuKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZU9mZmVyKGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdChvZmZlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtSYXdEb2M8S3JlaXNBbnN3ZXI+fSBhbnN3ZXJcclxuICAgICAqIEBwYXJhbSB7S3JlaXNDb25uZWN0aW9ufSBjb25uZWN0aW9uXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29tcGxldGVDb25uZWN0aW9uKGFuc3dlciA6IFJhd0RvYzxLcmVpc0Fuc3dlcj4sIGNvbm5lY3Rpb24gOiBLcmVpc0Nvbm5lY3Rpb24pe1xyXG4gICAgICAgIGxldCB2ZXJBbnN3ZXIgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3QoYW5zd2VyKTtcclxuICAgICAgICBjb25uZWN0aW9uLnB1YmxpY0tleSA9IHZlckFuc3dlci5rZXk7XHJcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24uY29tcGxldGUodmVyQW5zd2VyLmRhdGEuc2RwKS5jYXRjaCgoKT0+e1xyXG4gICAgICAgICAgICAvL2JhZCBhbnN3ZXI7IHRyeSBhZ2Fpbj9cclxuICAgICAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb21wbGV0ZSBhIGNvbm5lY3Rpb24gYnVpbHQgd2l0aCBcIm9mZmVyXCI7XHJcbiAgICAgKiBAcGFyYW0ge1Jhd0RvYzxLcmVpc0Fuc3dlcj59IGFuc3dlclxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNvbXBsZXRlKGFuc3dlciA6IFJhd0RvYzxLcmVpc0Fuc3dlcj4pIDogUHJvbWlzZTx2b2lkPntcclxuICAgICAgICBsZXQgY29ubmVjdGlvbiA9IHRoaXMucGVuZGluZ0Nvbm5lY3Rpb247XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGVDb25uZWN0aW9uKGFuc3dlciwgY29ubmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBmcmllbmQgS3JlaXNDb25uZWN0aW9uXHJcbiAgICAgKiBAYWNjZXNzIHByb3RlY3RlZFxyXG4gICAgICogQHJldHVybnMge0tyZWlzQ29ubmVjdGlvbltdfVxyXG4gICAgICovXHJcbiAgICBnZXRCcm9hZGNhc3RMaXN0KCkgOiBLcmVpc0Nvbm5lY3Rpb25bXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RydWN0dXJlLmFsbCgpO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgc2hvdXQoYXJnIDogc3RyaW5nKXtcclxuICAgICAgICBsZXQgYmNsID0gdGhpcy5nZXRCcm9hZGNhc3RMaXN0KCk7XHJcbiAgICAgICAgYmNsLmZvckVhY2goYyA9PiBjLmNoYXQoYXJnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzeW5jaHJvbml6ZSB0aW1lcyB3aXRoIG90aGVyIGNvbm5lY3Rpb25zLlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8e3Bpbmc6IG51bWJlcjsgb2Zmc2V0OiBudW1iZXJ9W10+fVxyXG4gICAgICovXHJcbiAgICBzeW5jKCkgOiBQcm9taXNlPHtwaW5nOiBudW1iZXIsIG9mZnNldDogbnVtYmVyLCBlcnJvcjogbnVtYmVyfVtdPiB7XHJcbiAgICAgICAgbGV0IHQwID0gbmV3IFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJvYWRjYXN0TGlzdCgpLm1hcChcclxuICAgICAgICAgICAgICAgIGMgPT4gYy5OVFAodDApLnRoZW4odDEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUaW1lLmV2YWx1YXRlTlRQKHQwLCB0MSwgdDEsIG5ldyBUaW1lKCkpXHJcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKT0+bnVsbClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgS3JlaXNDb25uZWN0aW9uIGV4dGVuZHMgVHlwZWRDb25uZWN0aW9ue1xyXG5cclxuICAgIHBpbmcgOiBudW1iZXI7XHJcbiAgICB0aW1lT2Zmc2V0IDogbnVtYmVyO1xyXG4gICAgdGltZUVycm9yOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljS2V5IDogUHVibGljS2V5O1xyXG4gICAgcHJvcGFnYXRlT2ZmZXIgOiBSZXF1ZXN0RnVuY3Rpb248UmF3RG9jPEtyZWlzT2ZmZXI+LCBSYXdEb2M8S3JlaXNBbnN3ZXI+PjsgLy9yZXNlcnZlZCBmb3IgS3JlaXNJbnRlcm5hbFxyXG5cclxuICAgIGNoYXQgOiBSZXF1ZXN0RnVuY3Rpb248c3RyaW5nLCBzdHJpbmc+OyAvL3RvZG86IHJlbW92ZS5cclxuICAgIE5UUCA6IFJlcXVlc3RGdW5jdGlvbjxUaW1lLCBUaW1lPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihrcmVpcyA6IEtyZWlzSW50ZXJuYWwpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvL2Nvbm5lY3Rpb24ucHJvcGFnYXRlID0gY29ubmVjdGlvbi5jcmVhdGVDaGFubmVsPEtyZWlzT2ZmZXIsIEtyZWlzQW5zd2VyPigpO1xyXG4gICAgICAgIHRoaXMuY2hhdCA9IHRoaXMuY3JlYXRlQ2hhbm5lbDxzdHJpbmcsIHN0cmluZz4oXHJcbiAgICAgICAgICAgIChtZXNzYWdlKT0+e1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFwiYWNrOiBcIittZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuTlRQID0gdGhpcy5jcmVhdGVDaGFubmVsPFRpbWUsIFRpbWU+KFxyXG4gICAgICAgICAgICBhc3luYyAobWVzc2FnZSk9PntcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVGltZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgS3JlaXNPZmZlciB7XHJcbiAgICBzZHAgOiBPZmZlcjtcclxuICAgIHRhcmdldDogRXhwb25lbnQ7XHJcbiAgICB0b2xlcmFuY2U6IG51bWJlcjtcclxufVxyXG5pbnRlcmZhY2UgS3JlaXNBbnN3ZXIge1xyXG4gICAgc2RwIDogQW5zd2VyO1xyXG59IiwiaW1wb3J0IHtLcmVpc0ludGVybmFsfSBmcm9tIFwiLi4vS3JlaXNJbnRlcm5hbFwiO1xyXG5pbXBvcnQge1RpbWV9IGZyb20gXCIuLi8uLi90b29scy9UaW1lXCI7XHJcbmltcG9ydCB7Q2hvcmRvaWR9IGZyb20gXCIuLi8uLi9jaG9yZG9pZC9DaG9yZG9pZFwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rpb259IGZyb20gXCIuLi8uLi9jb25uZWN0aW9uL0Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtLSURDb25maWd9IGZyb20gXCIuL2NvbmZpZ1wiO1xyXG5cclxuLyoqXHJcbiAqIEtyZWlzIEludGVybmFsIERhZW1vblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEtJRHtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgaG9zdDogS3JlaXNJbnRlcm5hbDtcclxuICAgIHByaXZhdGUgbGFzdEFjdGlvbiA6IFRpbWU7XHJcbiAgICBwcml2YXRlIGFjdGl2ZUNvbm5lY3Rpb24gOiBDb25uZWN0aW9uID0gbnVsbDtcclxuICAgIHByaXZhdGUgZmxhZ1N0b3AgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0ZSA6IDAgfCAxIHwgMiB8IDM7IC8vQHNlZSBLSUQubWRcclxuICAgIHByaXZhdGUgY29uZmlnOiB7IHRpbWVvdXQ6IG51bWJlciB9O1xyXG4gICAgY29uc3RydWN0b3Ioa3JlaXM6IEtyZWlzSW50ZXJuYWwsIGNvbmZpZyA9IEtJRENvbmZpZyl7XHJcbiAgICAgICAgdGhpcy5ob3N0ID0ga3JlaXM7XHJcbiAgICAgICAgdGhpcy5sYXN0QWN0aW9uID0gbmV3IFRpbWUoKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gMDtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICBzdG9wKCkgOiB2b2lke1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bihmb3JjZWQgOiBib29sZWFuID0gdHJ1ZSkgOiBQcm9taXNlPHZvaWQ+e1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGF3YWl0IG51bGw7IC8vcHVyZ2UgdGFpbCBjYWxsc1xyXG5cclxuICAgICAgICBzd2l0Y2godGhpcy5zdGF0ZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDoge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucnVuKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXRlID0gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5ydW4oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LHNlbGYuY29uZmlnLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0gcmV0dXJuO1xyXG4gICAgICAgICAgICBjYXNlIDE6IHtcclxuICAgICAgICAgICAgICAgIC8vcGFzc1xyXG4gICAgICAgICAgICB9IHJldHVybjtcclxuICAgICAgICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSByZXR1cm47XHJcbiAgICAgICAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgICAgICAgICAgaWYoIWZvcmNlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW4oZmFsc2UpO1xyXG4gICAgICAgICAgICB9IHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBkaXNwYXRjaCgpe1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBhd2FpdCBzZWxmLmhvc3QuZGFlbW9uQ29tcGxldGUoXHJcbiAgICAgICAgICAgIGF3YWl0IHNlbGYuaG9zdC5hbnN3ZXIoXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBzZWxmLmhvc3QuZGFlbW9uT2ZmZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRvaWQubG9va3VwVGFibGUubGVuZ3RoICogTWF0aC5yYW5kb20oKSAqKiA1IC8vYWRkaW5nIHNvbWUgZW50cm9weVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG5cclxufVxyXG5cclxuIiwiZXhwb3J0IGxldCBLSURDb25maWcgPSB7XHJcbiAgICB0aW1lb3V0IDogMTAwMDAgLy8gdGltZW91dCBpbiBtaWxsaXMgb24gYmFkIGFuc3dlclxyXG59OyIsImltcG9ydCB7TmV0d29ya0ludGVybmFsfSBmcm9tIFwiLi9OZXR3b3JrSW50ZXJuYWxcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5fSBmcm9tIFwiLi4vY3J5cHRvL1ByaXZhdGVLZXlcIjtcclxuaW1wb3J0IHtUaW1lfSBmcm9tIFwiLi4vdG9vbHMvVGltZVwiO1xyXG5pbXBvcnQge05ldHdvcmtDb25uZWN0aW9ufSBmcm9tIFwiLi9OZXR3b3JrQ29ubmVjdGlvblwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vQ29ubmVjdGlvbkVycm9yXCI7XHJcbmltcG9ydCB7TmV0d29ya0Vycm9yfSBmcm9tIFwiLi9OZXR3b3JrRXJyb3JcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBOZXR3b3JrIGV4dGVuZHMgTmV0d29ya0ludGVybmFse1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZUtleSA6IFByaXZhdGVLZXkpe1xyXG4gICAgICAgIHN1cGVyKHByaXZhdGVLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJ5IHRvIGFzY2VydGFpbiB0aGUgbGFnIGFuZCB0aW1lIGRpc2NyZXBhbmN5IGJldHdlZW4gdGhpcyBjbGllbnQgYW5kIHRoZSByZW1vdGUgY2xpZW50cy5cclxuICAgICAqL1xyXG4gICAgc3luYygpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRhYmxlLmFsbCgpLm1hcChjID0+IGMuY2hhbm5lbFJlcXVlc3RSZW1vdGVUaW1lKG5ldyBUaW1lKCkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGxpbmsgdG8gYSBwb3NzaWJseSBkaXNwYXJhdGUgbmV0d29yay5cclxuICAgICAqIEBwYXJhbSB7TmV0d29ya30gbmV0d29ya1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TmV0d29yaz59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGxpbmsobmV0d29yayA6IE5ldHdvcmspe1xyXG4gICAgICAgIGxldCBjb25uID0gbmV3IE5ldHdvcmtDb25uZWN0aW9uKHRoaXMpO1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgbGV0IG9mZmVyID0gYXdhaXQgdGhpcy5vZmZlcihjb25uKTtcclxuICAgICAgICAgICAgbGV0IGFuc3dlciA9IGF3YWl0IG5ldHdvcmsuYW5zd2VyKG9mZmVyKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb21wbGV0ZShhbnN3ZXIsIGNvbm4pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZTtcclxuICAgICAgICAgICAgaWYgKChlIGFzIENvbm5lY3Rpb25FcnJvcikudHlwZSA9PSA2KXtcclxuICAgICAgICAgICAgICAgIHRocm93IE5ldHdvcmtFcnJvci5Ob0NhbmRpZGF0ZXMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IGNvbm4ub3BlbjtcclxuICAgICAgICBhd2FpdCBuZXR3b3JrLmJvb3RzdHJhcHBlZDtcclxuICAgICAgICBhd2FpdCB0aGlzLmJvb3RzdHJhcHBlZDtcclxuICAgICAgICByZXR1cm4gbmV0d29yaztcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQge1R5cGVkQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vVHlwZWRDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7UHVibGljS2V5LCBSYXdEb2N9IGZyb20gXCIuLi9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5pbXBvcnQge05ldHdvcmtBbnN3ZXIsIE5ldHdvcmtJbnRlcm5hbCwgTmV0d29ya09mZmVyfSBmcm9tIFwiLi9OZXR3b3JrSW50ZXJuYWxcIjtcclxuaW1wb3J0IHtSZXF1ZXN0RnVuY3Rpb259IGZyb20gXCIuLi9jb25uZWN0aW9uL0Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtUaW1lfSBmcm9tIFwiLi4vdG9vbHMvVGltZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5ldHdvcmtDb25uZWN0aW9uIGV4dGVuZHMgVHlwZWRDb25uZWN0aW9uXHJcbntcclxuICAgIG5ldHdvcmsgOiBOZXR3b3JrSW50ZXJuYWw7XHJcbiAgICBmb3JlaWduS2V5IDogUHVibGljS2V5O1xyXG5cclxuICAgIGNoYW5uZWxQcm9wYWdhdGVPZmZlciA6IFJlcXVlc3RGdW5jdGlvbjxSYXdEb2M8TmV0d29ya09mZmVyPiwgUmF3RG9jPE5ldHdvcmtBbnN3ZXI+PjtcclxuXHJcbiAgICBjaGFubmVsUmVxdWVzdFJlbW90ZVRpbWUgOiBSZXF1ZXN0RnVuY3Rpb248VGltZSwgVGltZT47XHJcblxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0Q2hhbm5lbHMoKXtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbm5lbFByb3BhZ2F0ZU9mZmVyID0gdGhpcy5jcmVhdGVDaGFubmVsKG1zZyA9PiB7XHJcbiAgICAgICAgICAgcmV0dXJuIHNlbGYubmV0d29yay5hbnN3ZXIobXNnLCBzZWxmLmZvcmVpZ25LZXkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmNoYW5uZWxSZXF1ZXN0UmVtb3RlVGltZSA9IHRoaXMuY3JlYXRlQ2hhbm5lbCggbXNnID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVGltZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuZXR3b3JrIDogTmV0d29ya0ludGVybmFsKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubmV0d29yayA9IG5ldHdvcms7XHJcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3RDaGFubmVscygpO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vY29ubmVjdGlvbi9Db25uZWN0aW9uRXJyb3JcIjtcclxuXHJcbi8qKlxyXG4gKiBAc2VlIGNvbm5lY3Rpb24vRXJyb3JzLm1kXHJcbiAqIEBzZWUgQ29ubmVjdGlvbkVycm9yXHJcbiAqIE5ldHdvcmsgQ29kZXMgcmFuZ2UgaXMgMTAwMC0xOTk5XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTmV0d29ya0Vycm9yIGV4dGVuZHMgQ29ubmVjdGlvbkVycm9ye1xyXG4gICAgc3RhdGljIE5ldHdvcmtFbXB0eSgpOiBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uRXJyb3IoMTAwMCwgbnVsbCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgTm9DYW5kaWRhdGVzKCk6IENvbm5lY3Rpb25FcnJvcnsgLy8gbm8gY2FuZGlkYXRlIGFjY2VwdGVkIHRoZSByZXF1ZXN0LlxyXG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbkVycm9yKDEwMDEsIG51bGwpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtDaG9yZG9pZCwgRXhwb25lbnR9IGZyb20gXCIuLi9jaG9yZG9pZC9DaG9yZG9pZFwiO1xyXG5pbXBvcnQge0Fuc3dlciwgQ29ubmVjdGlvbiwgT2ZmZXIsIFJlcXVlc3RGdW5jdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vQ29ubmVjdGlvblwiO1xyXG5pbXBvcnQge1ByaXZhdGVLZXksIFB1YmxpY0tleSwgUmF3RG9jLCBWZXJEb2N9IGZyb20gXCIuLi9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5pbXBvcnQge1R5cGVkQ29ubmVjdGlvbn0gZnJvbSBcIi4uL2Nvbm5lY3Rpb24vVHlwZWRDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7TmV0d29ya0Nvbm5lY3Rpb259IGZyb20gXCIuL05ldHdvcmtDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7RnV0dXJlfSBmcm9tIFwiLi4vdG9vbHMvRnV0dXJlXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vY29ubmVjdGlvbi9Db25uZWN0aW9uRXJyb3JcIjtcclxuaW1wb3J0IHtOZXR3b3JrSW50ZXJuYWxEYWVtb259IGZyb20gXCIuL2RhZW1vbnMvTmV0d29ya0ludGVybmFsRGFlbW9uXCI7XHJcblxyXG4vKipcclxuICogbm8gbmVlZCB0byBhd2FpdCByZWFkaW5lc3MsIHdoZW4gdGhlIG9mZmVyIGNvbWVzIC8gYW5zd2VyIGlzIHByb3ZpZGVkLCB0aGUgbmV0d29yayBpcyBndWFyYW50ZWVkIHRvIGJlIHJlYWR5LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE5ldHdvcmtJbnRlcm5hbHtcclxuICAgIHByaXZhdGUgcHJpdmF0ZUtleSA6IFByaXZhdGVLZXk7XHJcbiAgICBwcm90ZWN0ZWQgdGFibGUgOiBDaG9yZG9pZDxOZXR3b3JrQ29ubmVjdGlvbj47XHJcbiAgICBwcml2YXRlIHJlYWR5IDogRnV0dXJlPHZvaWQ+OyAvLyByZWFkeSBmb3IgYWNjZXB0aW5nIGNvbm5lY3Rpb25zXHJcbiAgICBwdWJsaWMgYm9vdHN0cmFwcGVkIDogUHJvbWlzZTx0aGlzPjsgLy8gaXQncyBpbnRlZ3JhdGVkIGludG8gdGhlIG5ldHdvcmssIG5ldHdvcmsgZnVuY3Rpb25zIHNob3VsZCB3b3JrIG5vd1xyXG5cclxuICAgIHByaXZhdGUgZGFlbW9uIDogTmV0d29ya0ludGVybmFsRGFlbW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGVLZXkgOiBQcml2YXRlS2V5KXtcclxuICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBwcml2YXRlS2V5O1xyXG4gICAgICAgIHRoaXMucmVhZHkgPSBuZXcgRnV0dXJlPHZvaWQ+KCk7XHJcbiAgICAgICAgKGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudGFibGUgPSBuZXcgQ2hvcmRvaWQ8TmV0d29ya0Nvbm5lY3Rpb24+KGF3YWl0IHByaXZhdGVLZXkuZ2V0UHVibGljSGFzaCgpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVhZHkucmVzb2x2ZShudWxsKTtcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHRoaXMuYm9vdHN0cmFwcGVkID0gbmV3IEZ1dHVyZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmRhZW1vbiA9IG5ldyBOZXR3b3JrSW50ZXJuYWxEYWVtb24odGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnNlcnRPblJlYWR5KGNvbm5lY3Rpb24gOiBOZXR3b3JrQ29ubmVjdGlvbiwga2V5OiBQdWJsaWNLZXkpe1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBjb25uZWN0aW9uLmZvcmVpZ25LZXkgPSBrZXk7XHJcbiAgICAgICAgY29ubmVjdGlvbi5vcGVuLnRoZW4oY29ubiA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvbGRjb25uID0gc2VsZi50YWJsZS5hZGQoa2V5Lmhhc2hlZCgpLCBjb25uKTtcclxuXHJcbiAgICAgICAgICAgICh0aGlzLmJvb3RzdHJhcHBlZCBhcyBGdXR1cmU8dGhpcz4pLnJlc29sdmUoc2VsZik7XHJcbiAgICAgICAgICAgIHRoaXMuZGFlbW9uLnJ1bigpO1xyXG5cclxuICAgICAgICAgICAgb2xkY29ubiAmJiBvbGRjb25uLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uLmNsb3NlZDtcclxuICAgICAgICB9KS50aGVuKCgpPT57XHJcbiAgICAgICAgICAgIC8vd2hlbiBpdCdzIGNsb3NlZFxyXG4gICAgICAgICAgICBzZWxmLnRhYmxlLnJlbW92ZShrZXkuaGFzaGVkKCkpO1xyXG4gICAgICAgIH0pLmNhdGNoKCAoKT0+e1xyXG4gICAgICAgICAgICAvL3doZW4gaXQncyBjbG9zZWRcclxuICAgICAgICAgICAgc2VsZi50YWJsZS5yZW1vdmUoa2V5Lmhhc2hlZCgpKS5jbG9zZSgpO1xyXG5cclxuICAgICAgICAgICAgLy9UT0RPOiBJUCBiYW4gaW1wbGVtZW50YXRpb24gZ29lcyBoZXJlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGFzeW5jIG9mZmVyKGNvbm5lY3Rpb24gOiBOZXR3b3JrQ29ubmVjdGlvbiwgc2VsZWN0aW9uID0gMCkgOiBQcm9taXNlPFJhd0RvYzxOZXR3b3JrT2ZmZXI+PntcclxuICAgICAgICBsZXQgc3VnZ2VzdGlvbjtcclxuICAgICAgICBpZigodGhpcy5ib290c3RyYXBwZWQgYXMgRnV0dXJlPHRoaXM+KS5nZXRTdGF0ZSgpID09IFwicGVuZGluZ1wiKXtcclxuICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHtleHBvbmVudDogMTQsIGVmZmljaWVuY3k6IDF9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoaXMudGFibGUuZ2V0U3VnZ2VzdGlvbnMoKVtzZWxlY3Rpb25dO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5wcml2YXRlS2V5LnNpZ248TmV0d29ya09mZmVyPih7XHJcbiAgICAgICAgICAgIHNkcDogYXdhaXQgY29ubmVjdGlvbi5vZmZlcigpLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IHN1Z2dlc3Rpb24uZXhwb25lbnQsXHJcbiAgICAgICAgICAgIHRvbGVyYW5jZTogc3VnZ2VzdGlvbi5lZmZpY2llbmN5XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBhbnN3ZXIocmF3ZG9jIDogUmF3RG9jPE5ldHdvcmtPZmZlcj4sIG9yaWdpbiA/OiBQdWJsaWNLZXkpIDogUHJvbWlzZTxSYXdEb2M8TmV0d29ya0Fuc3dlcj4+e1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgZG9jID0gYXdhaXQgVmVyRG9jLnJlY29uc3RydWN0KHJhd2RvYyk7XHJcblxyXG4gICAgICAgIGF3YWl0IHRoaXMucHJpdmF0ZUtleS5nZXRQdWJsaWNIYXNoKCk7XHJcblxyXG4gICAgICAgIC8vd2hhdCBkbyB0aGV5IHdhbnQ/XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IENob3Jkb2lkLmRlcmVmZXJlbmNlKGRvYy5kYXRhLnRhcmdldCwgZG9jLmtleS5oYXNoZWQoKSk7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlVG9VcyA9IENob3Jkb2lkLmRpc3RhbmNlKHRhcmdldCwgYXdhaXQgc2VsZi5wcml2YXRlS2V5LmdldFB1YmxpY0hhc2goKSk7XHJcblxyXG4gICAgICAgIGlmKCAvL3RoZXkgd2FudCB1cyBhbmQgd2Ugd2FudCB0aGVtXHJcbiAgICAgICAgICAgIGRpc3RhbmNlVG9VcyA8IGRvYy5kYXRhLnRvbGVyYW5jZVxyXG4gICAgICAgICAgICAmJiB0aGlzLnRhYmxlLmlzRGVzaXJhYmxlKGRvYy5rZXkuaGFzaGVkKCkpXHJcbiAgICAgICAgKXtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICAgICAgbGV0IGNvbm5lY3Rpb24gPSBuZXcgTmV0d29ya0Nvbm5lY3Rpb24odGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0T25SZWFkeShjb25uZWN0aW9uLCBkb2Mua2V5KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByaXZhdGVLZXkuc2lnbih7c2RwOiBhd2FpdCBjb25uZWN0aW9uLmFuc3dlcihkb2MuZGF0YS5zZHApfSk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy9wcm9wYWdhdGVcclxuICAgICAgICAgICAgbGV0IG5leHRTdG9wID0gc2VsZi50YWJsZS5nZXRXaXRoaW4odGFyZ2V0LFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luXHJcbiAgICAgICAgICAgICAgICAgICAgPyBNYXRoLm1pbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2VUb1VzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZG9pZC5kaXN0YW5jZSh0YXJnZXQsIG9yaWdpbi5oYXNoZWQoKSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgOiAxXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmKCFuZXh0U3RvcCkgdGhyb3cgQ29ubmVjdGlvbkVycm9yLk5ldHdvcmtFbXB0eSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV4dFN0b3AuY2hhbm5lbFByb3BhZ2F0ZU9mZmVyKHJhd2RvYykuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZigoZSBhcyBDb25uZWN0aW9uRXJyb3IpLnR5cGUgPT0gOCkgcmV0dXJuIHRoaXMuYW5zd2VyKHJhd2RvYywgb3JpZ2luKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzeW5jIGNvbXBsZXRlKHJhd2RvYyA6IFJhd0RvYzxOZXR3b3JrQW5zd2VyPiwgY29ubmVjdGlvbiA6IE5ldHdvcmtDb25uZWN0aW9uKSA6IFByb21pc2U8dm9pZD57XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBkb2MgPSBhd2FpdCBWZXJEb2MucmVjb25zdHJ1Y3QocmF3ZG9jKTtcclxuXHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnNlcnRPblJlYWR5KGNvbm5lY3Rpb24sIGRvYy5rZXkpO1xyXG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24uY29tcGxldGUoZG9jLmRhdGEuc2RwKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOZXR3b3JrT2ZmZXJ7XHJcbiAgICBzZHAgOiBPZmZlcjtcclxuICAgIHRhcmdldDogRXhwb25lbnQ7XHJcbiAgICB0b2xlcmFuY2U6IG51bWJlcjtcclxufVxyXG5leHBvcnQgaW50ZXJmYWNlIE5ldHdvcmtBbnN3ZXJ7XHJcbiAgICBzZHAgOiBBbnN3ZXI7XHJcbn0iLCJpbXBvcnQge0Z1dHVyZX0gZnJvbSBcIi4uLy4uL3Rvb2xzL0Z1dHVyZVwiO1xyXG5pbXBvcnQge05ldHdvcmtJbnRlcm5hbH0gZnJvbSBcIi4uL05ldHdvcmtJbnRlcm5hbFwiO1xyXG5pbXBvcnQge0Nob3Jkb2lkfSBmcm9tIFwiLi4vLi4vY2hvcmRvaWQvQ2hvcmRvaWRcIjtcclxuaW1wb3J0IHtOZXR3b3JrQ29ubmVjdGlvbn0gZnJvbSBcIi4uL05ldHdvcmtDb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7Q29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vLi4vY29ubmVjdGlvbi9Db25uZWN0aW9uRXJyb3JcIjtcclxuXHJcbi8qKlxyXG4gKiBEYWVtb24gdG8gY3VyYXRlIHRoZSBuZXR3b3JrLCBhbmQgaW50ZXJsaW5rIGl0c2VsZiBhdXRvbWF0aWNhbGx5IHdpdGggb3B0aW1hbCBub2Rlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBOZXR3b3JrSW50ZXJuYWxEYWVtb24ge1xyXG4gICAgbmV0d29yazogTmV0d29ya0ludGVybmFsO1xyXG4gICAgc3RhdGUgOiAwIHwgMSB8IDIgPSAwOyAvLyBpZGxlLCB3b3JraW5nLCB0aW1lZC1vdXRcclxuICAgIHRpbWVvdXQgOiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3RvcihuZXR3b3JrIDogTmV0d29ya0ludGVybmFsLCB0aW1lb3V0ID0gMTAwMDApe1xyXG4gICAgICAgIHRoaXMubmV0d29yayA9IG5ldHdvcms7XHJcblxyXG4gICAgICAgIHRoaXMubmV0d29yay5ib290c3RyYXBwZWQudGhlbigoKT0+dGhpcy5ydW4oKSk7XHJcblxyXG4gICAgICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsIHRoaXMgZXZlcnkgdGltZSBhIGNvbm5lY3Rpb24gaXMgYWRkZWQgdG8gdGhlIG5ldHdvcmsuXHJcbiAgICAgKiByZWN1cnNpdmUsIGJ1dCB0aGUgdGFpbHMgc2hvdWxkIHJlc29sdmUgbG9uZyBiZWZvcmUgZXhlY3V0ZSgpIGlzIG92ZXIuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIGF3YWl0IG51bGw7XHJcblxyXG4gICAgICAgIHN3aXRjaCh0aGlzLnN0YXRlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgMToge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL2RvIG5vdGhpbmdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDI6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBleGVjdXRlKCl7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjb25uZWN0aW9uID0gbmV3IE5ldHdvcmtDb25uZWN0aW9uKHRoaXMubmV0d29yayk7XHJcbiAgICAgICAgdGhpcy5uZXR3b3JrLm9mZmVyKGNvbm5lY3Rpb24pXHJcbiAgICAgICAgICAgIC50aGVuKG8gPT4gdGhpcy5uZXR3b3JrLmFuc3dlcihvKSlcclxuICAgICAgICAgICAgLnRoZW4oYSA9PiB0aGlzLm5ldHdvcmsuY29tcGxldGUoYSwgY29ubmVjdGlvbikpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHNlbGYuc3RhdGUgPSAwKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiBzZWxmLnJ1bigpKVxyXG4gICAgICAgICAgICAuY2F0Y2goIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZigoZSBhcyBDb25uZWN0aW9uRXJyb3IpLmxvY2FsKXtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMgbWVhbnMgd2UgY291bGRuJ3Qgc2VuZCBpdCBhbnl3aGVyZS4gdGhpcyBtZWFucyB0aGF0IHRoZSBuZXR3b3JrIGlzIGVtcHR5IG9yIG91ciBjb2RlIGlzIHRyYXNoXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBzZXQgdG8gaWRsZSwgZG8gbm90aGluZy5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKChlIGFzIENvbm5lY3Rpb25FcnJvcikudHlwZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA2OiB7IC8vIG5vIHBlZXIgYWNjZXB0ZWQgb3VyIG9mZmVyLiB0cnkgYWdhaW4gbGF0ZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RhdGUgPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT5zZWxmLnJ1bigpLCBzZWxmLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ub3RoaW5nIGhhcHBlbnMsIHN0YXRlIGlzIDA7IGRhZW1vbiBpcyBpZGxlLlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNsYXNzIFRlc3R7XHJcbiAgICBuYW1lIDogc3RyaW5nO1xyXG4gICAgdGVzdHMgOiAoKCk9PlByb21pc2U8Ym9vbGVhbj4pW10gPSBbXTtcclxuICAgIHByaXZhdGUgaXRlbSA6IG51bWJlciA9IDA7IC8vIGN1cnJlbnQgaXRlbVxyXG4gICAgcHJpdmF0ZSBwYXNzZWQgOiBudW1iZXIgPSAwO1xyXG4gICAgb3V0cHV0RnVuY3Rpb24gOiAob3V0cHV0IDogc3RyaW5nKT0+dm9pZDtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUgOiBzdHJpbmcsIG91dHB1dEZ1bmN0aW9uIDogKG91dHB1dCA6IHN0cmluZykgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5vdXRwdXRGdW5jdGlvbiA9IG91dHB1dEZ1bmN0aW9uO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBwYXNzKHN0cjogc3RyaW5nLCBvYmplY3RzOiBhbnlbXSkgOiBib29sZWFue1xyXG4gICAgICAgIHRoaXMucGFzc2VkKys7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCIlY+KclFwiLCAnY29sb3I6IGdyZWVuOycsXHJcbiAgICAgICAgICAgIFwiKFwiKygrK3RoaXMuaXRlbSkrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpXCIsXHJcbiAgICAgICAgICAgIHN0cixcclxuICAgICAgICAgICAgXCJpdGVtczogXCIsIG9iamVjdHMpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZmFpbChzdHI6IHN0cmluZywgb2JqZWN0czogYW55W10pIDogYm9vbGVhbntcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVj4pyWXCIsICdjb2xvcjogcmVkOycsXHJcbiAgICAgICAgICAgIFwiKFwiKygrK3RoaXMuaXRlbSkrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIpXCIsXHJcbiAgICAgICAgICAgIHN0cixcclxuICAgICAgICAgICAgXCJpdGVtczogXCIsIG9iamVjdHMpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQobmFtZSA6IHN0cmluZywgYSA6IGFueSwgYiA6IGFueSwgY29tcGFyYXRvciA6IChhLCBiKT0+Ym9vbGVhbiA9IChhLGIpPT5hPT09Yil7XHJcbiAgICAgICAgdGhpcy50ZXN0cy5wdXNoKGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgIGlmKGNvbXBhcmF0b3IoYXdhaXQgYSwgYXdhaXQgYikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFzcyhcImFzc2VydDogXCIgKyBuYW1lLCBbYXdhaXQgYSwgYXdhaXQgYl0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChcImFzc2VydDogXCIgKyBuYW1lLCBbYXdhaXQgYSwgYXdhaXQgYl0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBydW4oKXtcclxuICAgICAgICB0aGlzLml0ZW0gPSAwO1xyXG4gICAgICAgIHRoaXMucGFzc2VkID0gMDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlN0YXJ0aW5nIHRlc3Q6IFwiKyB0aGlzLm5hbWUrXCIgLi4uXCIpO1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRoaXMudGVzdHMubWFwKGUgPT4gZSgpKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJQYXNzZWQgXCIrdGhpcy5wYXNzZWQrXCIvXCIrdGhpcy50ZXN0cy5sZW5ndGgrXCIuIFRoaXMgY29uY2x1ZGVzIHRoZSB0ZXN0IG9mIFwiK3RoaXMubmFtZStcIi5cIik7XHJcbiAgICAgICAgdGhpcy5vdXRwdXRGdW5jdGlvbiAmJlxyXG4gICAgICAgICAgICB0aGlzLm91dHB1dEZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgKCh0aGlzLnBhc3NlZCA9PSB0aGlzLnRlc3RzLmxlbmd0aCk/IFwiU3VjY2VzcyFcIiA6IFwiRmFpbGVkLlwiKVxyXG4gICAgICAgICAgICAgICAgK1wiIChcIit0aGlzLnBhc3NlZCtcIi9cIit0aGlzLnRlc3RzLmxlbmd0aCtcIik6IFwiK3RoaXMubmFtZStcIiB0ZXN0aW5nIGNvbXBsZXRlLlwiKTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBFc3NlbnRpYWxseSBkZWZlcnJlZCwgYnV0IGl0J3MgYWxzbyBhIHByb21pc2UuXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTW96aWxsYS9KYXZhU2NyaXB0X2NvZGVfbW9kdWxlcy9Qcm9taXNlLmpzbS9EZWZlcnJlZCNiYWNrd2FyZHNfZm9yd2FyZHNfY29tcGF0aWJsZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZ1dHVyZTxUPiBleHRlbmRzIFByb21pc2U8VD57XHJcbiAgICByZWFkb25seSByZXNvbHZlIDogKHZhbHVlIDogUHJvbWlzZUxpa2U8VD4gfCBUKSA9PiB2b2lkO1xyXG4gICAgcmVhZG9ubHkgcmVqZWN0IDogKHJlYXNvbiA/OiBhbnkpID0+IHZvaWQ7XHJcbiAgICBwcm90ZWN0ZWQgc3RhdGUgOiAwIHwgMSB8IDI7IC8vcGVuZGluZywgcmVzb2x2ZWQsIHJlamVjdGVkO1xyXG4gICAgcHJpdmF0ZSBzdGF0ZUV4dHJhY3RvcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRvciA/OiAoXHJcbiAgICAgICAgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgbGV0IHJlc29sdmVyLCByZWplY3RvcjtcclxuICAgICAgICBsZXQgc3RhdGUgOiAwIHwgMSB8IDIgPSAwO1xyXG4gICAgICAgIHN1cGVyKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZXIgPSAocmVzb2x1dGlvbiA6IFQpID0+IHtcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gMTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzb2x1dGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJlamVjdG9yID0gKHJlamVjdGlvbiA6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSAyO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KHJlamVjdGlvbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZUV4dHJhY3RvciA9ICgpID0+IHsgLy8gdGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzZWxmIGNhbm5vdCBiZSBzZXQgaW4gc3VwZXI7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlcjtcclxuICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdG9yO1xyXG5cclxuICAgICAgICBleGVjdXRvciAmJiBuZXcgUHJvbWlzZTxUPihleGVjdXRvcikudGhlbihyZXNvbHZlcikuY2F0Y2gocmVqZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCkgOiBcInBlbmRpbmdcIiB8IFwicmVzb2x2ZWRcIiB8IFwicmVqZWN0ZWRcIiB8IFwiZXJyb3JcIiB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMCk/IFwicGVuZGluZ1wiXHJcbiAgICAgICAgICAgIDogKHRoaXMuc3RhdGVFeHRyYWN0b3IoKSA9PSAxKSA/IFwicmVzb2x2ZWRcIlxyXG4gICAgICAgICAgICA6ICh0aGlzLnN0YXRlRXh0cmFjdG9yKCkgPT0gMikgPyBcInJlamVjdGVkXCJcclxuICAgICAgICAgICAgOiBcImVycm9yXCI7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHtGdXR1cmV9IGZyb20gXCIuL0Z1dHVyZVwiO1xyXG5cclxuLyoqXHJcbiAqIFRoZW5hYmxlIGxvZ2ljYWwgQU5EIGNvbnZlcmdlbmNlIG9mIFByb21pc2VzLlxyXG4gKiB1bmxpa2UgUHJvbWlzZS5hbGwsIGl0IGlzIHJ1bnRpbWUgcHVzaGFibGUuXHJcbiAqIEBzZWUgYWRkXHJcbiAqIEBzZWUgUHJvbWlzZS5hbGxcclxuICogQHNlZSBGdXR1cmVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTeW5jaHJvbmljaXR5IGV4dGVuZHMgRnV0dXJlPGFueVtdPntcclxuICAgIHByaXZhdGUgZnV0dXJlcyA6IFByb21pc2U8YW55PltdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VwZXJFeGVjdXRvciBhY3RzIGFzIGFuIG9wdGlvbmFsIGxvZ2ljYWwgT1IgUHJvbWlzZSB0byB0aGUgU3luY2hyb25pY2l0eS5cclxuICAgICAqIGluY2x1ZGVkIGZvciBuZXdwcm9taXNlY2FwYWJpbGl0eSBjb21wYXRpYmlsaXR5LlxyXG4gICAgICogQHNlZSBhZGRcclxuICAgICAqIEBzZWUgRnV0dXJlXHJcbiAgICAgKiBAc2VlIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wL2luZGV4Lmh0bWwjc2VjLW5ld3Byb21pc2VjYXBhYmlsaXR5XHJcbiAgICAgKiBAcGFyYW0geyhyZXNvbHZlOiAodmFsdWU6IChQcm9taXNlTGlrZTxhbnk+IHwgYW55KSkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSA9PiB2b2lkfSBzdXBlckV4ZWN1dG9yXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHN1cGVyRXhlY3V0b3IgPzogKFxyXG4gICAgICAgIHJlc29sdmUgOiAodmFsdWUgOiBQcm9taXNlTGlrZTxhbnk+IHwgYW55KSA9PiB2b2lkLFxyXG4gICAgICAgIHJlamVjdCA6IChyZWFzb24gPzogYW55KSA9PiB2b2lkKT0+dm9pZFxyXG4gICAgKXtcclxuICAgICAgICBzdXBlcihzdXBlckV4ZWN1dG9yKTtcclxuICAgICAgICB0aGlzLmZ1dHVyZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIHByb21pc2UgdG8gdGhlIGNvbnZlcmdlbmNlLiB3aGVuIGFsbCBhZGRlZCBwcm9taXNlcyByZXNvbHZlLCB5b3UgY2FuIG5vIGxvbmdlciBhZGQgYW55LlxyXG4gICAgICogQHBhcmFtIHtQcm9taXNlPGFueT59IGZ1dHVyZVxyXG4gICAgICovXHJcbiAgICBhZGQoZnV0dXJlIDogUHJvbWlzZTxhbnk+KXtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYoIXRoaXMuc3RhdGUpe1xyXG4gICAgICAgICAgICB0aGlzLmZ1dHVyZXMucHVzaChmdXR1cmUpO1xyXG4gICAgICAgICAgICBQcm9taXNlLmFsbCh0aGlzLmZ1dHVyZXMpLnRoZW4oYT0+c2VsZi5yZXNwb25kZXIoYSkpLmNhdGNoKGU9PnNlbGYucmVqZWN0KGUpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBcIlJ1bnRpbWUgRXJyb3I6IFN5bmNocm9uaWNpdHkgYWxyZWFkeSBjb252ZXJnZWQgaW4gdGhlIHBhc3QuXCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0b2RvOiBvcHRpbWl6ZSB0aGlzXHJcbiAgICAgKiByZXNvbHZlcyB0aGUgU3luY2hyb25pY2l0eSBvbmx5IHdoZW4gYWxsIGV2ZW50cyByZXNvbHZlZC5cclxuICAgICAqIEBwYXJhbSB7YW55W119IHJlc29sdXRpb25zXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVzcG9uZGVyKHJlc29sdXRpb25zIDogYW55W10pe1xyXG4gICAgICAgIGlmIChyZXNvbHV0aW9ucy5sZW5ndGggPT0gdGhpcy5mdXR1cmVzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZShyZXNvbHV0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgY2xhc3MgVGltZSB7XHJcbiAgICByZWFkb25seSBtaWxsaXM6IG51bWJlcjtcclxuICAgIGNvbnN0cnVjdG9yKHRpbWUgPzogVGltZSl7XHJcbiAgICAgICAgdGhpcy5taWxsaXMgPSB0aW1lICYmIHRpbWUubWlsbGlzIHx8IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZXZhbHVhdGVOVFAodDA6IFRpbWUsIHQxOiBUaW1lLCB0MjogVGltZSwgdDM6IFRpbWUpIDoge3Bpbmc6IG51bWJlciwgb2Zmc2V0OiBudW1iZXJ9e1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBpbmc6IHQzLm1pbGxpcyAtIHQwLm1pbGxpcyAtICh0Mi5taWxsaXMgLSB0MS5taWxsaXMpLFxyXG4gICAgICAgICAgICBvZmZzZXQ6ICgodDEubWlsbGlzIC0gdDAubWlsbGlzKSArICh0Mi5taWxsaXMgLSB0My5taWxsaXMpKS8yXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy90b2RvOiBpbmNsdWRlIHBvbHlmaWxscyBmb3IgRWRnZVxyXG5leHBvcnQgY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuZXhwb3J0IGNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XHJcblxyXG4iLCJpbXBvcnQge1Rlc3R9IGZyb20gXCIuL21vZHVsZXMvdGVzdC9UZXN0XCI7XHJcbmltcG9ydCB7Q2hvcmRvaWR9IGZyb20gXCIuL21vZHVsZXMvY2hvcmRvaWQvQ2hvcmRvaWRcIjtcclxuaW1wb3J0IHtQcml2YXRlS2V5LCBWZXJEb2N9IGZyb20gXCIuL21vZHVsZXMvY3J5cHRvL1ByaXZhdGVLZXlcIjtcclxuaW1wb3J0IHtDb25uZWN0aW9ufSBmcm9tIFwiLi9tb2R1bGVzL2Nvbm5lY3Rpb24vQ29ubmVjdGlvblwiO1xyXG5pbXBvcnQge1R5cGVkQ29ubmVjdGlvbn0gZnJvbSBcIi4vbW9kdWxlcy9jb25uZWN0aW9uL1R5cGVkQ29ubmVjdGlvblwiO1xyXG5pbXBvcnQge0tyZWlzSW50ZXJuYWx9IGZyb20gXCIuL21vZHVsZXMva3JlaXMvS3JlaXNJbnRlcm5hbFwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4vbW9kdWxlcy9jb25uZWN0aW9uL0Nvbm5lY3Rpb25FcnJvclwiO1xyXG5pbXBvcnQge05ldHdvcmtJbnRlcm5hbH0gZnJvbSBcIi4vbW9kdWxlcy9uZXR3b3JrL05ldHdvcmtJbnRlcm5hbFwiO1xyXG5pbXBvcnQge05ldHdvcmtDb25uZWN0aW9ufSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya0Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0IHtOZXR3b3JrfSBmcm9tIFwiLi9tb2R1bGVzL25ldHdvcmsvTmV0d29ya1wiO1xyXG5pbXBvcnQge1RpbWV9IGZyb20gXCIuL21vZHVsZXMvdG9vbHMvVGltZVwiO1xyXG5sZXQgcHJpbnRmID0gKHN0ciA6IHN0cmluZykgPT4ge1xyXG4gICAgdmFyIGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIpO1xyXG4gICAgaC5hcHBlbmRDaGlsZCh0KTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaCk7XHJcbn07XHJcbih3aW5kb3cgYXMgYW55KS5Qcml2YXRlS2V5ID0gUHJpdmF0ZUtleTtcclxuKHdpbmRvdyBhcyBhbnkpLk5ldHdvcmsgPSBOZXR3b3JrO1xyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY3QgPSBuZXcgVGVzdChcIkNob3JkXCIsIHByaW50Zik7XHJcblxyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLjksIDAuMSksIDAuMiwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQuZGlzdGFuY2UoMC4xLCAwLjEpLCAwLjAsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIENob3Jkb2lkLmRpc3RhbmNlKDAuNCwgMC41KSwgMC4xLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLCAxKSwgMC4wLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZC5kaXN0YW5jZSgwLjEsIDAuOSksIDAuMiwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQuZGlzdGFuY2UoMSwgMCksIDAuMCwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuXHJcbiAgICBsZXQgdGkgPSBuZXcgQ2hvcmRvaWQoMC41LCAxKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwKSwgMCk7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMSksIDApO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDAuNDk5OTkpLCA2KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwLjUpLCAxNCk7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMC41MDAwMSksIDIyKTtcclxuXHJcbiAgICBsZXQgdGkyID0gbmV3IENob3Jkb2lkKDAuNzUsIDEpO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuMjUpLCAwKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc0OTk5KSwgNik7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyIDJcIiwgdGkyLmx0b2koMC43NSksIDE0KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc1MDAxKSwgMjIpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDBcIiwgdGkyLmdldCh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJhZGQgMVwiLCB0aTIuYWRkKHRvLmEsIHRvKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQodG8uYSksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDFcIiwgdGkyLmdldCgwLjkpLCB0byk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQoMC43NCksIHRvKTtcclxuXHJcbiAgICBsZXQgdG8yID0ge2E6IDAuMTEwOSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImFkZCAyIChvdmVyd3JpdGUpXCIsIHRpMi5hZGQodG8yLmEsIHRvMiksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDJcIiwgdGkyLmdldCh0bzIuYSksIHRvMik7XHJcblxyXG4gICAgY3QuYXNzZXJ0KFwic3VnZ2VzdGlvbiBvcmRlclwiLCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVswXS5lZmZpY2llbmN5LCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVsxXS5lZmZpY2llbmN5LCAoYSwgYikgPT4gYSA+IGIpO1xyXG5cclxuICAgIGN0LmFzc2VydChcInJlbSAxIGZhaWxcIiwgdGkyLnJlbW92ZSh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJyZW0gMVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgdG8yKTtcclxuICAgIGN0LmFzc2VydChcInJlbSAxIGVtcHR5XCIsIHRpMi5yZW1vdmUodG8yLmEpLCBudWxsKTtcclxuICAgIGN0LnJ1bigpO1xyXG59KSgpOyAvLyBkYXRhIHN0cnVjdHVyZSAoY2hvcmRpb2lkMSkgdGVzdFxyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY3IgPSBuZXcgVGVzdChcIkNyeXB0b1wiLCBwcmludGYpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICBsZXQgcHJrID0gbmV3IFByaXZhdGVLZXkoKTtcclxuICAgIGxldCB2ZXJkb2MgPSBhd2FpdCBwcmsuc2lnbih0byk7XHJcbiAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2MpO1xyXG5cclxuICAgIGNyLmFzc2VydChcInZlcmRvYyBrZXkgY29tcGFyaXNvblwiLCB2ZXJkb2Mua2V5Lmhhc2hlZCgpLCByZWNvbnN0cnVjdGVkLmtleS5oYXNoZWQoKSk7XHJcbiAgICBjci5hc3NlcnQoXCJ2ZXJkb2MgZGF0YSBjb21wYXJpc29uXCIsIEpTT04uc3RyaW5naWZ5KHZlcmRvYy5kYXRhKSwgSlNPTi5zdHJpbmdpZnkocmVjb25zdHJ1Y3RlZC5kYXRhKSk7XHJcblxyXG4gICAgY3IucnVuKCk7XHJcbn0pKCk7IC8vIGNyeXB0byB0ZXN0XHJcblxyXG4oYXN5bmMgKCk9PntcclxuICAgIGxldCBjbiA9IG5ldyBUZXN0KFwiQ29ubmVjdGlvblwiLCBwcmludGYpO1xyXG5cclxuICAgIGNsYXNzIEF7XHJcbiAgICAgICAgYSA6IHN0cmluZztcclxuICAgIH1cclxuICAgIGNsYXNzIEJ7XHJcbiAgICAgICAgYiA6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVzcG9uc2UgPSAoIG0gOiBBICkgOiBQcm9taXNlPEI+ID0+IHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtiOiBtLmF9KX07XHJcbiAgICBsZXQgZGVsYXllZFJlc3BvbnNlID0gKCBtIDogQSApIDogUHJvbWlzZTxCPiA9PiB7cmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmU9PnNldFRpbWVvdXQoKCk9PnJlc29sdmUoe2I6IG0uYX0pLDEwMDApKX07XHJcblxyXG5cclxuICAgIGxldCBhID0gbmV3IFR5cGVkQ29ubmVjdGlvbigpO1xyXG4gICAgbGV0IGFjID0gYS5jcmVhdGVDaGFubmVsPEEsQj4ocmVzcG9uc2UpO1xyXG4gICAgbGV0IGFjZCA9IGEuY3JlYXRlQ2hhbm5lbDxBLEI+KGRlbGF5ZWRSZXNwb25zZSk7XHJcbiAgICBsZXQgYiA9IG5ldyBUeXBlZENvbm5lY3Rpb24oKTtcclxuICAgIGxldCBiYyA9IGIuY3JlYXRlQ2hhbm5lbDxBLEI+KHJlc3BvbnNlKTtcclxuICAgIGxldCBiY2QgPSBiLmNyZWF0ZUNoYW5uZWw8QSxCPihkZWxheWVkUmVzcG9uc2UpO1xyXG5cclxuICAgIGxldCBvZmZlciA9IGF3YWl0IGEub2ZmZXIoKTtcclxuICAgIGxldCBhbnN3ZXIgPSBhd2FpdCBiLmFuc3dlcihvZmZlcik7XHJcbiAgICBhLmNvbXBsZXRlKGFuc3dlcik7XHJcblxyXG4gICAgYXdhaXQgYS5vcGVuO1xyXG5cclxuICAgIGNuLmFzc2VydChcImNvbm5lY3Rpb24gYWIgZWNobyB3b3Jrc1wiLCBhd2FpdCBhYyh7YTogXCJoZWxsb1wifSkudGhlbihtPT5tLmIpLCBcImhlbGxvXCIpO1xyXG4gICAgY24uYXNzZXJ0KFwiY29ubmVjdGlvbiBiYSBlY2hvIHdvcmtzXCIsIGF3YWl0IGJjKHthOiBcImhlbGxvXCJ9KS50aGVuKG09Pm0uYiksIFwiaGVsbG9cIik7XHJcblxyXG4gICAgY24uYXNzZXJ0KCBcIm91dGJvdW5kIGxpbWl0YXRpb24gd29ya3NcIixcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChuZXcgQXJyYXkoMTAwKS5maWxsKHthOiBcInVcIn0pLm1hcChlID0+IGFjZChlKSkpLmNhdGNoKGUgPT4gZS50eXBlKSxcclxuICAgICAgICBDb25uZWN0aW9uRXJyb3IuT3V0YnVmZmVyRXhoYXVzdGVkKCkudHlwZVxyXG4gICAgKTtcclxuXHJcbiAgICBsZXQgcmVxdWVzdHMgPSAgbmV3IEFycmF5KDk5KS5maWxsKDEpLm1hcCgoZSxpKSA9PiBiY2Qoe2E6XCJyXCIraX0pLmNhdGNoKGU9PmUudHlwZSA9PSA4ICYmIGkpKTtcclxuICAgIGEuY2xvc2UoKTtcclxuXHJcbiAgICBjbi5hc3NlcnQoIFwiYm91bmNlIHdvcmtzXCIsXHJcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoYXdhaXQgUHJvbWlzZS5hbGwocmVxdWVzdHMpKSxcclxuICAgICAgICBKU09OLnN0cmluZ2lmeShuZXcgQXJyYXkoOTkpLmZpbGwoOCkubWFwKChlLGkpPT5pKSlcclxuICAgICk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIGNuLnJ1bigpO1xyXG59KSgpOyAvLyBjb25uZWN0aW9uIHRlc3RcclxuXHJcbihhc3luYyAoKT0+e1xyXG4gICAgbGV0IGNuID0gbmV3IFRlc3QoXCJLcmVpc0ludGVybmFsXCIsIHByaW50Zik7XHJcblxyXG4gICAgbGV0IGsgPSBuZXcgQXJyYXkoMjApLmZpbGwobnVsbCkubWFwKF89PiBuZXcgS3JlaXNJbnRlcm5hbCgpKTtcclxuICAgIGxldCBrbiA9IG5ldyBLcmVpc0ludGVybmFsKCk7XHJcblxyXG4gICAgay5yZWR1Y2UoKGEsZSk9PnsoYXN5bmMgKCk9PmUuY29tcGxldGUoYXdhaXQgYS5hbnN3ZXIoYXdhaXQgZS5vZmZlcigtMSkpKSkoKTsgcmV0dXJuIGV9LCBrbik7XHJcbiAgICAvL2tbMF0uY29tcGxldGUoYXdhaXQga1sxXS5hbnN3ZXIoYXdhaXQga1swXS5vZmZlcigtMSkpKTtcclxuXHJcbiAgICBhd2FpdCBrWzBdLm9wZW47XHJcblxyXG4gICAga1swXS5zaG91dChcImV5eVwiKTtcclxuICAgIGtbMF0uc3luYygpO1xyXG5cclxuICAgIGNuLmFzc2VydChcImtyZWlzIHN5bmMgd29ya3NcIiwgKGF3YWl0IGtbMF0uc3luYygpKS5sZW5ndGgsIDEpO1xyXG5cclxuICAgIGNuLnJ1bigpO1xyXG5cclxufSk7IC8vIG5ldHdvcmsgdGVzdFxyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY24gPSBuZXcgVGVzdChcIk5ldHdvcmtcIiwgcHJpbnRmKTtcclxuXHJcbiAgICBsZXQgYSA9IG5ldyBOZXR3b3JrKG5ldyBQcml2YXRlS2V5KCkpO1xyXG4gICAgbGV0IGIgPSBuZXcgTmV0d29yayhuZXcgUHJpdmF0ZUtleSgpKTtcclxuICAgIGxldCBjID0gbmV3IE5ldHdvcmsobmV3IFByaXZhdGVLZXkoKSk7XHJcblxyXG4gICAgYS5saW5rKGIpO1xyXG4gICAgYi5saW5rKGMpO1xyXG4gICAgYy5saW5rKGEpO1xyXG5cclxuICAgIGF3YWl0IGEuYm9vdHN0cmFwcGVkO1xyXG5cclxuICAgIGNuLmFzc2VydChcInJlbW90ZSB0aW1lIGZldGNoXCIsIH5+KChhd2FpdCBQcm9taXNlLmFsbChhLnN5bmMoKSkpWzBdLm1pbGxpcy8xMCksIH5+KG5ldyBUaW1lKCkubWlsbGlzLzEwKSk7XHJcblxyXG4gICAgLy9oYXJkZW5pbmdcclxuICAgIGxldCBudW0gPSAyMDtcclxuXHJcbiAgICBsZXQgYXIgPSBuZXcgQXJyYXkobnVtKS5maWxsKDEpLm1hcCggKCk9PiBuZXcgTmV0d29yayhuZXcgUHJpdmF0ZUtleSgpKSk7XHJcblxyXG4gICAgYXIucmVkdWNlKChhc3luYyAocCwgbiwgaSkgPT57XHJcbiAgICAgICAgYXdhaXQgcDtcclxuICAgICAgICBuLmxpbmsoYyk7XHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9KSwgUHJvbWlzZS5yZXNvbHZlKGMpKTtcclxuXHJcbiAgICAod2luZG93IGFzIGFueSkuYXIgPSBhcjtcclxuXHJcblxyXG5cclxuXHJcbiAgICBjbi5ydW4oKTtcclxufSkoKTsgLy8gbmV0d29yayB0ZXN0XHJcblxyXG5cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiIn0=