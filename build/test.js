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

/***/ "./modules/chordoid/Chordoid1.ts":
/*!***************************************!*\
  !*** ./modules/chordoid/Chordoid1.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Chordoid1 {
    constructor(center, circumference = 1) {
        this.locus = center;
        this.array = new Array(Chordoid1.lookupTable.length - 1).fill(null);
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
    get(location) {
        let item = this.array[this.ltoi(location, true)];
        return (item || null) && item.obj;
    }
    remove(location) {
        let idx = this.ltoi(location);
        let old = this.array[idx];
        if (!old || Math.abs(old.key - location) > Chordoid1.acceptableError) {
            return null;
        }
        this.array[idx] = null;
        return old.obj;
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
    efficiency(location, idx) {
        let derelativized = this.derelativize(location);
        return Chordoid1.distance(Chordoid1.lookupTable[idx], derelativized);
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
            let idx = Chordoid1.lookupTable.length - 1;
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
     * @returns {{location: number; efficiency: number}[]} sorted, biggest to smallest gap.
     */
    getSuggestions() {
        return this.array.map((item, idx) => {
            return {
                efficiency: (item) ? this.efficiency(item.key, idx) : Math.abs(Chordoid1.lookupTable[idx] / 2),
                location: this.rerelativize(Chordoid1.lookupTable[idx]),
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
    }
}
//FIXME: amp up precision to 64 bit;
Chordoid1.lookupTable = [-0.5, -0.25, -0.05555555555555558, -0.0078125, -0.0008000000000000229, -0.0000643004115226109,
    -0.0000042499298761322635, -2.384185791015625e-7, -1.1615286565902494e-8, -4.999999858590343e-10,
    -1.9277190954625212e-11, -6.729616863765386e-13, -2.148281552649678e-14, -6.106226635438361e-16, 0,
    6.106226635438361e-16, 2.148281552649678e-14, 6.729616863765386e-13, 1.9277190954625212e-11,
    4.999999858590343e-10, 1.1615286565902494e-8, 2.384185791015625e-7, 0.0000042499298761322635,
    0.0000643004115226109, 0.0008000000000000229, 0.0078125, 0.05555555555555558, 0.25, 0.5];
Chordoid1.locusIDX = 14; // position of the locus
Chordoid1.acceptableError = 1e-16;
exports.Chordoid1 = Chordoid1;


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
class Connection {
    constructor() {
        this.connectiterator = 0;
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig_1.rtcconfig);
        this.readiness = new Observable_1.Observable(false);
        this.open = new Future_1.Future();
    }
    // createChannel<RequestT,ResponseT>(onmessage : (request :RequestT) => Promise<ResponseT>, maxOpenMessages) : (request :RequestT) => Promise<ResponseT>{
    //
    //     let bufferChannel = this.createRawChannel( requestBuffer=>{
    //         return onmessage(JSON.parse(utf8Decoder.decode(requestBuffer))).
    //             then(responseObject => utf8Encoder.encode(JSON.stringify(responseObject)).buffer);
    //     },maxOpenMessages);
    //
    //     return (request) => {
    //         return bufferChannel(utf8Encoder.encode(JSON.stringify(request)).buffer).
    //             then(responseBuffer => JSON.parse(utf8Decoder.decode(responseBuffer)));
    //     }
    // }
    /**
     * Typed version of createRawChannel
     * Request type RequestT expects response type ResponseT. RequestT and ResponseT should be data transfer structures. All fields must support JSON stringify.
     * @param {(request: RequestT) => Promise<ResponseT>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: RequestT) => Promise<ResponseT>} pipe your messages into this. catch for errors, hinting you may want to retransmit your packages through other routes.
     */
    createChannel(onmessage, maxOpenMessages = 100) {
        let channel = this.createStringChannel(request => {
            try {
                return onmessage(JSON.parse(request)).
                    then(response => JSON.stringify(response));
            }
            catch (e) {
                return Promise.reject("garbled message");
            }
        }, maxOpenMessages);
        return (request) => {
            return channel(JSON.stringify(request)).
                then(response => JSON.parse(response));
        };
    }
    /**
     * gives you a function you can send buffer messages into, promises a response.
     * uses strings, because firefox has problems with generic byte arrays. although.. who cares about firefox?
     * @param {(request: string) => Promise<string>} onmessage
     * @param {number} maxOpenMessages
     * @param {(error : string, data : string) => void} onseriousoffense callback on serious violation
     * @returns {(request: string) => Promise<string>}
     */
    createStringChannel(onmessage, maxOpenMessages = 100, onseriousoffense = (error, data) => { }) {
        if (this.readiness.get()) {
            throw "channels can only be created before starting the connection!";
        }
        let requestChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let responseChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let openMessages = 0;
        let self = this;
        requestChannel.onopen = () => {
            self.readiness.set(true);
            self.readiness.flush();
            self.open.resolve(self);
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
            onmessage(data.slice(1)).then(rawResponse => {
                openMessages--;
                responseChannel.send(String.fromCodePoint(reference) + rawResponse);
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
                onseriousoffense(e, data);
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
                    reject(new ConnectionError(response.codePointAt(2), response.slice(3)));
                };
            });
            requestChannel.send(crafted);
            return promise;
        };
    }
    /**
     * @deprecated use createStringChannel instead
     * gives you a function you can send buffer messages into, promises a response.
     * todo: remove. currently included as reference.
     * @param {(request: ArrayBuffer) => Promise<ArrayBuffer>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: ArrayBuffer) => Promise<ArrayBuffer>} pipe your messages into this. catch for any error, foreign or domestic
     */
    createRawChannel(onmessage, maxOpenMessages = 100) {
        if (this.readiness.get()) {
            throw "channels can only be created before starting the connection!";
        }
        let requestChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let responseChannel = this.rtcPeerConnection.createDataChannel(this.connectiterator, { negotiated: true, id: this.connectiterator++ });
        let openMessages = 0;
        let self = this;
        requestChannel.onopen = () => {
            self.readiness.set(true);
            self.readiness.flush();
            self.open.resolve(self);
        };
        requestChannel.onmessage = (message) => {
            openMessages++;
            let data = new Uint8Array(message.data);
            let reference = data[0];
            if (openMessages > maxOpenMessages) {
                responseChannel.send(new Uint8Array(([0, reference, 2, maxOpenMessages])).buffer);
                openMessages--;
                return;
            }
            onmessage(data.slice(1).buffer).then(rawResponse => {
                let response = new Uint8Array(rawResponse);
                let crafted = new Uint8Array(response.length + 1);
                crafted.set(response, 1);
                crafted[0] = reference;
                openMessages--;
                responseChannel.send(crafted.buffer);
            });
        };
        let callbackBuffer = new Array(maxOpenMessages).fill(null);
        let bounce = () => {
            this.rtcPeerConnection.close();
            callbackBuffer.filter(e => e).forEach(e => e(new Uint8Array([0, 0, 3])));
        };
        requestChannel.onclose = bounce; //todo: determine whether to close connection on bounce.
        responseChannel.onclose = bounce;
        responseChannel.onmessage = (message) => {
            let data = new Uint8Array(message.data);
            let reference = data[0];
            try {
                callbackBuffer[reference](data); // error handling happens in closure
                callbackBuffer[reference] = null;
                //gg
            }
            catch (e) {
                //todo: probably kick and ban peer. currently, just ignores the peer.
            }
        };
        return (request) => {
            let available = callbackBuffer.map((e, idx) => e ? null : idx).filter(e => e); // naturally excludes 0
            if (!available.length)
                return Promise.reject("outbuffer full");
            let data = new Uint8Array(request);
            let crafted = new Uint8Array(data.length + 1);
            crafted.set(data, 1);
            crafted[0] = available[0];
            let promise = new Promise((resolve, reject) => {
                callbackBuffer[available[0]] = response => {
                    if (response[0]) {
                        resolve(response.slice(1).buffer);
                    }
                    reject("remote problem: " + response[2]);
                };
            });
            requestChannel.send(crafted.buffer);
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
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp
        }));
    }
}
exports.Connection = Connection;
class ConnectionError {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}


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
            let databuffer = utf8buffer_1.utf8Encoder.encode(JSON.stringify(obj));
            let pukbuffer = utf8buffer_1.utf8Encoder.encode(this.publicKey.toJSON());
            let header = new Uint8Array(new Uint16Array([databuffer.length, pukbuffer.length]).buffer);
            let signable = new Uint8Array(1 + header.length + databuffer.length + pukbuffer.length);
            signable[0] = 1; //version 1
            signable.set(header, 1);
            signable.set(databuffer, 1 + header.length);
            signable.set(pukbuffer, 1 + header.length + databuffer.length);
            let sigbuffer = new Uint8Array(yield window.crypto.subtle.sign({
                name: "ECDSA",
                hash: { name: "SHA-384" },
            }, this.privateKey, signable));
            let product = new Uint8Array(signable.length + sigbuffer.byteLength);
            product.set(signable, 0);
            product.set(sigbuffer, signable.length);
            let vd = new VerDoc();
            vd.original = product.buffer;
            vd.key = this.publicKey;
            vd.data = obj;
            vd.signature = sigbuffer.buffer;
            return vd;
        });
    }
}
exports.PrivateKey = PrivateKey;
class VerDoc {
    static reconstruct(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            let inbuffer = new Uint8Array(buffer);
            switch (inbuffer[0]) {
                case 1: {
                    let lengths = new Uint16Array(inbuffer.slice(1, 5).buffer);
                    let datalength = lengths[0];
                    let puklength = lengths[1];
                    let predata = utf8buffer_1.utf8Decoder.decode(inbuffer);
                    let doc = inbuffer.slice(0, 1 + 4 + datalength + puklength);
                    let sig = inbuffer.slice(1 + 4 + datalength + puklength);
                    let key = yield new PublicKey(JSON.parse(utf8buffer_1.utf8Decoder.decode(doc.slice(1 + 4 + datalength)))).ready;
                    if (yield key.verify(doc, sig)) {
                        let vd = new VerDoc();
                        vd.signature = sig.buffer;
                        vd.key = key;
                        vd.data = JSON.parse(utf8buffer_1.utf8Decoder.decode(doc.slice(1 + 4, 1 + 4 + datalength)));
                        vd.original = buffer;
                        return vd;
                    }
                    return Promise.reject("bad document");
                }
                default: return Promise.reject("version unsupported: " + inbuffer[0]);
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
        super((resolve, reject) => {
            resolver = (resolution) => {
                resolve(resolution);
            };
            rejector = (rejection) => {
                reject(rejection);
            };
        });
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
const Chordoid1_1 = __webpack_require__(/*! ./modules/chordoid/Chordoid1 */ "./modules/chordoid/Chordoid1.ts");
const PrivateKey_1 = __webpack_require__(/*! ./modules/crypto/PrivateKey */ "./modules/crypto/PrivateKey.ts");
const Connection_1 = __webpack_require__(/*! ./modules/connection/Connection */ "./modules/connection/Connection.ts");
let printf = (str) => {
    var h = document.createElement("div");
    var t = document.createTextNode(str);
    h.appendChild(t);
    document.body.appendChild(h);
};
(() => __awaiter(this, void 0, void 0, function* () {
    let ct = new Test_1.Test("Chord", printf);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(0.9, 0.1), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(0.1, 0.1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(0.4, 0.5), 0.1, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(0, 1), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(0.1, 0.9), 0.2, (a, b) => Math.abs(a - b) < 1e-16);
    ct.assert("distance diff<1e-16", Chordoid1_1.Chordoid1.distance(1, 0), 0.0, (a, b) => Math.abs(a - b) < 1e-16);
    let ti = new Chordoid1_1.Chordoid1(0.5, 1);
    ct.assert("indicer", ti.ltoi(0), 0);
    ct.assert("indicer", ti.ltoi(1), 0);
    ct.assert("indicer", ti.ltoi(0.49999), 6);
    ct.assert("indicer", ti.ltoi(0.5), 14);
    ct.assert("indicer", ti.ltoi(0.50001), 22);
    let ti2 = new Chordoid1_1.Chordoid1(0.75, 1);
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
    let reconstructed = yield PrivateKey_1.VerDoc.reconstruct(verdoc.original);
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
    let a = new Connection_1.Connection();
    let ac = a.createChannel(response);
    let b = new Connection_1.Connection();
    let bc = b.createChannel(response);
    let offer = yield a.offer();
    let answer = yield b.answer(offer);
    a.complete(answer);
    yield a.open;
    cn.assert("connection ab echo works", yield ac({ a: "hello" }).then(m => m.b), "hello");
    cn.assert("connection ba echo works", yield bc({ a: "hello" }).then(m => m.b), "hello");
    cn.run();
}))(); // connection test


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jaG9yZG9pZC9DaG9yZG9pZDEudHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jb25uZWN0aW9uL0Nvbm5lY3Rpb24udHMiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9jb25uZWN0aW9uL3J0Y2NvbmZpZy50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL2NyeXB0by9Qcml2YXRlS2V5LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdGVzdC9UZXN0LnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvRnV0dXJlLnRzIiwid2VicGFjazovLy8uL21vZHVsZXMvdG9vbHMvT2JzZXJ2YWJsZS50cyIsIndlYnBhY2s6Ly8vLi9tb2R1bGVzL3Rvb2xzL3V0ZjhidWZmZXIudHMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbkVBO0lBZ0JJLFlBQVksTUFBZSxFQUFFLGdCQUF5QixDQUFDO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxL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QUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUscUJBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3ZHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUscUJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25HLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUscUJBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3ZHLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUscUJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBRW5HLElBQUksRUFBRSxHQUFHLElBQUkscUJBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDMUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNDLElBQUksR0FBRyxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU5QyxJQUFJLEVBQUUsR0FBRyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQy9CLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElB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QUMsQ0FBQyxHQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVwRixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDYixDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsa0JBQWtCIiwiZmlsZSI6InRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi90ZXN0LnRzXCIpO1xuIiwiZXhwb3J0IGNsYXNzIENob3Jkb2lkMTxUPntcclxuICAgIHByaXZhdGUgbG9jdXMgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFycmF5IDoge2tleSA6IG51bWJlciwgb2JqIDogVH1bXTtcclxuXHJcbiAgICAvL0ZJWE1FOiBhbXAgdXAgcHJlY2lzaW9uIHRvIDY0IGJpdDtcclxuXHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgbG9va3VwVGFibGUgPSBbLTAuNSwgLTAuMjUsIC0wLjA1NTU1NTU1NTU1NTU1NTU4LCAtMC4wMDc4MTI1LCAtMC4wMDA4MDAwMDAwMDAwMDAwMjI5LCAtMC4wMDAwNjQzMDA0MTE1MjI2MTA5LFxyXG4gICAgICAgIC0wLjAwMDAwNDI0OTkyOTg3NjEzMjI2MzUsIC0yLjM4NDE4NTc5MTAxNTYyNWUtNywgLTEuMTYxNTI4NjU2NTkwMjQ5NGUtOCwgLTQuOTk5OTk5ODU4NTkwMzQzZS0xMCxcclxuICAgICAgICAtMS45Mjc3MTkwOTU0NjI1MjEyZS0xMSwgLTYuNzI5NjE2ODYzNzY1Mzg2ZS0xMywgLTIuMTQ4MjgxNTUyNjQ5Njc4ZS0xNCwgLTYuMTA2MjI2NjM1NDM4MzYxZS0xNiwgMCxcclxuICAgICAgICA2LjEwNjIyNjYzNTQzODM2MWUtMTYsIDIuMTQ4MjgxNTUyNjQ5Njc4ZS0xNCwgNi43Mjk2MTY4NjM3NjUzODZlLTEzLCAxLjkyNzcxOTA5NTQ2MjUyMTJlLTExLFxyXG4gICAgICAgIDQuOTk5OTk5ODU4NTkwMzQzZS0xMCwgMS4xNjE1Mjg2NTY1OTAyNDk0ZS04LCAyLjM4NDE4NTc5MTAxNTYyNWUtNywgMC4wMDAwMDQyNDk5Mjk4NzYxMzIyNjM1LFxyXG4gICAgICAgIDAuMDAwMDY0MzAwNDExNTIyNjEwOSwgMC4wMDA4MDAwMDAwMDAwMDAwMjI5LCAwLjAwNzgxMjUsIDAuMDU1NTU1NTU1NTU1NTU1NTgsIDAuMjUsIDAuNV07XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgbG9jdXNJRFggPSAxNDsgLy8gcG9zaXRpb24gb2YgdGhlIGxvY3VzXHJcblxyXG4gICAgc3RhdGljIGFjY2VwdGFibGVFcnJvciA9IDFlLTE2O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNlbnRlciA6IG51bWJlciwgY2lyY3VtZmVyZW5jZSA6IG51bWJlciA9IDEpe1xyXG4gICAgICAgIHRoaXMubG9jdXMgPSBjZW50ZXI7XHJcbiAgICAgICAgdGhpcy5hcnJheSA9IG5ldyBBcnJheShDaG9yZG9pZDEubG9va3VwVGFibGUubGVuZ3RoLTEpLmZpbGwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGxvY2F0aW9uOiBudW1iZXIsIG9iaiA6IFQpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgaWYodGhpcy5hcnJheVtpZHhdKXtcclxuICAgICAgICAgICAgaWYodGhpcy5lZmZpY2llbmN5KHRoaXMuYXJyYXlbaWR4XS5rZXksIGlkeCkgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgLy9lZmZpY2llbmN5IGlzIHdvcnNlIHRoYW4gaW5jb21pbmdcclxuICAgICAgICAgICAgICAgIGxldCBvbGQgPSB0aGlzLmFycmF5W2lkeF0ub2JqO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hcnJheVtpZHhdID0ge2tleTogbG9jYXRpb24sIG9iajogb2JqfTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvbGQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL3JlamVjdCB0aGUgb2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXJyYXlbaWR4XSA9IHtrZXk6IGxvY2F0aW9uLCBvYmo6IG9ian07XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQobG9jYXRpb246IG51bWJlcikgOiBUIHwgbnVsbHtcclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuYXJyYXlbdGhpcy5sdG9pKGxvY2F0aW9uLCB0cnVlKV1cclxuICAgICAgICByZXR1cm4gKGl0ZW0gfHwgbnVsbCkgJiYgaXRlbS5vYmo7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKGxvY2F0aW9uOiBudW1iZXIpIDogVCB8IG51bGx7XHJcbiAgICAgICAgbGV0IGlkeCA9IHRoaXMubHRvaShsb2NhdGlvbik7XHJcbiAgICAgICAgbGV0IG9sZCA9IHRoaXMuYXJyYXlbaWR4XTtcclxuICAgICAgICBpZighb2xkIHx8IE1hdGguYWJzKG9sZC5rZXkgLSBsb2NhdGlvbikgPiBDaG9yZG9pZDEuYWNjZXB0YWJsZUVycm9yKXtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYXJyYXlbaWR4XSA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIG9sZC5vYmo7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICBwcml2YXRlIGRlcmVsYXRpdml6ZShsb2NhdGlvbiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgY29uc29sZS5hc3NlcnQobG9jYXRpb24+PTAgJiYgbG9jYXRpb24gPD0gMSwgXCJsb2NhdGlvbjogXCIrbG9jYXRpb24pO1xyXG4gICAgICAgIHJldHVybiAoKDEgKyBsb2NhdGlvbiAtIHRoaXMubG9jdXMgKyAwLjUpICUgMSkgLSAwLjU7XHJcbiAgICAgICAgLy9leHBlY3QgaW4gcmFuZ2UgLTAuNSwgMC41XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHJlcmVsYXRpdml6ZShsb2NhdGlvbiA6IG51bWJlcikgOiBudW1iZXJ7XHJcbiAgICAgICAgcmV0dXJuIChsb2NhdGlvbiArIHRoaXMubG9jdXMgKyAxICkgJSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkaXN0YW5jZShhIDogbnVtYmVyLCBiIDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oXHJcbiAgICAgICAgICAgIE1hdGguYWJzKGEgLSBiKSxcclxuICAgICAgICAgICAgTWF0aC5hYnMoYSAtIGIgKyAxKSxcclxuICAgICAgICAgICAgTWF0aC5hYnMoYiAtIGEgKyAxKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZWZmaWNpZW5jeShsb2NhdGlvbiA6IG51bWJlciwgaWR4IDogbnVtYmVyKSA6IG51bWJlcntcclxuICAgICAgICBsZXQgZGVyZWxhdGl2aXplZCA9IHRoaXMuZGVyZWxhdGl2aXplKGxvY2F0aW9uKTtcclxuICAgICAgICByZXR1cm4gQ2hvcmRvaWQxLmRpc3RhbmNlKENob3Jkb2lkMS5sb29rdXBUYWJsZVtpZHhdLCBkZXJlbGF0aXZpemVkKTtcclxuICAgIH1cclxuXHJcbiAgICBsdG9pKGxvY2F0aW9uIDogbnVtYmVyLCBza2lwRW1wdHkgOiBib29sZWFuID0gZmFsc2UpIDogbnVtYmVyeyAvL2xvY2F0aW9uIHRvIGluZGV4XHJcbiAgICAgICAgbGV0IGRlcmVsYXRpdml6ZWQgPSB0aGlzLmRlcmVsYXRpdml6ZShsb2NhdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBlZmZpY2llbmN5ID0gMTtcclxuICAgICAgICBsZXQgdmVyaWRleCA9IG51bGw7XHJcbiAgICAgICAgaWYoZGVyZWxhdGl2aXplZCA8IDApe1xyXG4gICAgICAgICAgICAvL3N0YXJ0IHdpdGggMFxyXG4gICAgICAgICAgICBsZXQgaWR4ID0gMDtcclxuICAgICAgICAgICAgd2hpbGUoZWZmaWNpZW5jeSA+IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KSl7XHJcbiAgICAgICAgICAgICAgICBpZihza2lwRW1wdHkgJiYgIXRoaXMuYXJyYXlbaWR4XSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWR4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlZmZpY2llbmN5ID0gdGhpcy5lZmZpY2llbmN5KGxvY2F0aW9uLCBpZHgpO1xyXG4gICAgICAgICAgICAgICAgdmVyaWRleCA9IGlkeCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJpZGV4O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHN0YXJ0IHdpdGggbWF4XHJcbiAgICAgICAgICAgIGxldCBpZHggPSBDaG9yZG9pZDEubG9va3VwVGFibGUubGVuZ3RoLTE7XHJcbiAgICAgICAgICAgIHdoaWxlKGVmZmljaWVuY3kgPiB0aGlzLmVmZmljaWVuY3kobG9jYXRpb24sIGlkeCkpe1xyXG4gICAgICAgICAgICAgICAgaWYoc2tpcEVtcHR5ICYmICF0aGlzLmFycmF5W2lkeF0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeSA9IHRoaXMuZWZmaWNpZW5jeShsb2NhdGlvbiwgaWR4KTtcclxuICAgICAgICAgICAgICAgIHZlcmlkZXggPSBpZHgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyaWRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSBzb3J0ZWQgbGlzdCBvZiBzdWdnZXN0aW9ucywgb24gd2hpY2ggYWRkcmVzc2VlcyBhcmUgbW9zdCBkZXNpcmFibGUsIHdpdGggd2hpY2ggdG9sZXJhbmNlcy5cclxuICAgICAqIEByZXR1cm5zIHt7bG9jYXRpb246IG51bWJlcjsgZWZmaWNpZW5jeTogbnVtYmVyfVtdfSBzb3J0ZWQsIGJpZ2dlc3QgdG8gc21hbGxlc3QgZ2FwLlxyXG4gICAgICovXHJcbiAgICBnZXRTdWdnZXN0aW9ucygpIDoge2xvY2F0aW9uIDogbnVtYmVyLCBlZmZpY2llbmN5IDogbnVtYmVyfVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcnJheS5tYXAoKGl0ZW0sIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZWZmaWNpZW5jeTogKGl0ZW0pPyB0aGlzLmVmZmljaWVuY3koaXRlbS5rZXksIGlkeCkgOiBNYXRoLmFicyhDaG9yZG9pZDEubG9va3VwVGFibGVbaWR4XS8yKSxcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLnJlcmVsYXRpdml6ZShDaG9yZG9pZDEubG9va3VwVGFibGVbaWR4XSksXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5zb3J0KChhLGIpPT5iLmVmZmljaWVuY3kgLSBhLmVmZmljaWVuY3kpO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7cnRjY29uZmlnfSBmcm9tIFwiLi9ydGNjb25maWdcIjtcclxuaW1wb3J0IHt1dGY4RGVjb2RlciwgdXRmOEVuY29kZXJ9IGZyb20gXCIuLi90b29scy91dGY4YnVmZmVyXCI7XHJcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSBcIi4uL3Rvb2xzL09ic2VydmFibGVcIjtcclxuaW1wb3J0IHtGdXR1cmV9IGZyb20gXCIuLi90b29scy9GdXR1cmVcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUlRDRGF0YUNoYW5uZWwgZXh0ZW5kcyBFdmVudFRhcmdldHtcclxuICAgIG9uY2xvc2U6IEZ1bmN0aW9uO1xyXG4gICAgb25lcnJvcjogRnVuY3Rpb247XHJcbiAgICBvbm1lc3NhZ2U6IEZ1bmN0aW9uO1xyXG4gICAgb25vcGVuOiBGdW5jdGlvbjtcclxuICAgIGNsb3NlKCk7XHJcbiAgICBzZW5kKG1zZyA6IHN0cmluZyB8IEJsb2IgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldyk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbntcclxuICAgIHByaXZhdGUgcnRjUGVlckNvbm5lY3Rpb24gOiBSVENQZWVyQ29ubmVjdGlvbjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVhZGluZXNzIDogT2JzZXJ2YWJsZTxib29sZWFuPjtcclxuICAgIHJlYWRvbmx5IG9wZW4gOiBQcm9taXNlPHRoaXM+OyAvLyBleHBvcnQgYXMgcHJvbWlzZSwgYnV0IGZ1dHVyZSBpbnRlcm5hbGx5XHJcbiAgICBwcml2YXRlIGNvbm5lY3RpdGVyYXRvciA9IDA7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24ocnRjY29uZmlnKTtcclxuICAgICAgICB0aGlzLnJlYWRpbmVzcyA9IG5ldyBPYnNlcnZhYmxlPGJvb2xlYW4+KGZhbHNlKTtcclxuICAgICAgICB0aGlzLm9wZW4gPSBuZXcgRnV0dXJlPHRoaXM+KCk7XHJcbiAgICB9XHJcbiAgICAvLyBjcmVhdGVDaGFubmVsPFJlcXVlc3RULFJlc3BvbnNlVD4ob25tZXNzYWdlIDogKHJlcXVlc3QgOlJlcXVlc3RUKSA9PiBQcm9taXNlPFJlc3BvbnNlVD4sIG1heE9wZW5NZXNzYWdlcykgOiAocmVxdWVzdCA6UmVxdWVzdFQpID0+IFByb21pc2U8UmVzcG9uc2VUPntcclxuICAgIC8vXHJcbiAgICAvLyAgICAgbGV0IGJ1ZmZlckNoYW5uZWwgPSB0aGlzLmNyZWF0ZVJhd0NoYW5uZWwoIHJlcXVlc3RCdWZmZXI9PntcclxuICAgIC8vICAgICAgICAgcmV0dXJuIG9ubWVzc2FnZShKU09OLnBhcnNlKHV0ZjhEZWNvZGVyLmRlY29kZShyZXF1ZXN0QnVmZmVyKSkpLlxyXG4gICAgLy8gICAgICAgICAgICAgdGhlbihyZXNwb25zZU9iamVjdCA9PiB1dGY4RW5jb2Rlci5lbmNvZGUoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VPYmplY3QpKS5idWZmZXIpO1xyXG4gICAgLy8gICAgIH0sbWF4T3Blbk1lc3NhZ2VzKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcmV0dXJuIChyZXF1ZXN0KSA9PiB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiBidWZmZXJDaGFubmVsKHV0ZjhFbmNvZGVyLmVuY29kZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSkuYnVmZmVyKS5cclxuICAgIC8vICAgICAgICAgICAgIHRoZW4ocmVzcG9uc2VCdWZmZXIgPT4gSlNPTi5wYXJzZSh1dGY4RGVjb2Rlci5kZWNvZGUocmVzcG9uc2VCdWZmZXIpKSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHlwZWQgdmVyc2lvbiBvZiBjcmVhdGVSYXdDaGFubmVsXHJcbiAgICAgKiBSZXF1ZXN0IHR5cGUgUmVxdWVzdFQgZXhwZWN0cyByZXNwb25zZSB0eXBlIFJlc3BvbnNlVC4gUmVxdWVzdFQgYW5kIFJlc3BvbnNlVCBzaG91bGQgYmUgZGF0YSB0cmFuc2ZlciBzdHJ1Y3R1cmVzLiBBbGwgZmllbGRzIG11c3Qgc3VwcG9ydCBKU09OIHN0cmluZ2lmeS5cclxuICAgICAqIEBwYXJhbSB7KHJlcXVlc3Q6IFJlcXVlc3RUKSA9PiBQcm9taXNlPFJlc3BvbnNlVD59IG9ubWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heE9wZW5NZXNzYWdlc1xyXG4gICAgICogQHJldHVybnMgeyhyZXF1ZXN0OiBSZXF1ZXN0VCkgPT4gUHJvbWlzZTxSZXNwb25zZVQ+fSBwaXBlIHlvdXIgbWVzc2FnZXMgaW50byB0aGlzLiBjYXRjaCBmb3IgZXJyb3JzLCBoaW50aW5nIHlvdSBtYXkgd2FudCB0byByZXRyYW5zbWl0IHlvdXIgcGFja2FnZXMgdGhyb3VnaCBvdGhlciByb3V0ZXMuXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZUNoYW5uZWw8UmVxdWVzdFQsUmVzcG9uc2VUPihvbm1lc3NhZ2UgOiAocmVxdWVzdCA6IFJlcXVlc3RUKSA9PiBQcm9taXNlPFJlc3BvbnNlVD4sIG1heE9wZW5NZXNzYWdlcz0xMDApIDogKHJlcXVlc3QgOiBSZXF1ZXN0VCkgPT4gUHJvbWlzZTxSZXNwb25zZVQ+e1xyXG4gICAgICAgIGxldCBjaGFubmVsID0gdGhpcy5jcmVhdGVTdHJpbmdDaGFubmVsKHJlcXVlc3QgPT57XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvbm1lc3NhZ2UoSlNPTi5wYXJzZShyZXF1ZXN0KSkuXHJcbiAgICAgICAgICAgICAgICB0aGVuKHJlc3BvbnNlID0+IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcImdhcmJsZWQgbWVzc2FnZVwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgbWF4T3Blbk1lc3NhZ2VzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChyZXF1ZXN0KT0+e1xyXG4gICAgICAgICAgICByZXR1cm4gY2hhbm5lbChKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSkuXHJcbiAgICAgICAgICAgIHRoZW4ocmVzcG9uc2UgPT4gSlNPTi5wYXJzZShyZXNwb25zZSkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2l2ZXMgeW91IGEgZnVuY3Rpb24geW91IGNhbiBzZW5kIGJ1ZmZlciBtZXNzYWdlcyBpbnRvLCBwcm9taXNlcyBhIHJlc3BvbnNlLlxyXG4gICAgICogdXNlcyBzdHJpbmdzLCBiZWNhdXNlIGZpcmVmb3ggaGFzIHByb2JsZW1zIHdpdGggZ2VuZXJpYyBieXRlIGFycmF5cy4gYWx0aG91Z2guLiB3aG8gY2FyZXMgYWJvdXQgZmlyZWZveD9cclxuICAgICAqIEBwYXJhbSB7KHJlcXVlc3Q6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+fSBvbm1lc3NhZ2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhPcGVuTWVzc2FnZXNcclxuICAgICAqIEBwYXJhbSB7KGVycm9yIDogc3RyaW5nLCBkYXRhIDogc3RyaW5nKSA9PiB2b2lkfSBvbnNlcmlvdXNvZmZlbnNlIGNhbGxiYWNrIG9uIHNlcmlvdXMgdmlvbGF0aW9uXHJcbiAgICAgKiBAcmV0dXJucyB7KHJlcXVlc3Q6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+fVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVTdHJpbmdDaGFubmVsKFxyXG4gICAgICAgIG9ubWVzc2FnZSA6IChyZXF1ZXN0IDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz4sXHJcbiAgICAgICAgbWF4T3Blbk1lc3NhZ2VzPTEwMCxcclxuICAgICAgICBvbnNlcmlvdXNvZmZlbnNlPShlcnJvciA6IHN0cmluZywgZGF0YSA6IHN0cmluZyk9Pnt9KVxyXG4gICAgICAgIDogKHJlcXVlc3QgOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPlxyXG4gICAge1xyXG4gICAgICAgIGlmKHRoaXMucmVhZGluZXNzLmdldCgpKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJjaGFubmVscyBjYW4gb25seSBiZSBjcmVhdGVkIGJlZm9yZSBzdGFydGluZyB0aGUgY29ubmVjdGlvbiFcIlxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVxdWVzdENoYW5uZWwgPSAodGhpcy5ydGNQZWVyQ29ubmVjdGlvbiBhcyBhbnkpLmNyZWF0ZURhdGFDaGFubmVsKHRoaXMuY29ubmVjdGl0ZXJhdG9yLCB7bmVnb3RpYXRlZDogdHJ1ZSwgaWQ6IHRoaXMuY29ubmVjdGl0ZXJhdG9yKyt9KTtcclxuICAgICAgICBsZXQgcmVzcG9uc2VDaGFubmVsID0gKHRoaXMucnRjUGVlckNvbm5lY3Rpb24gYXMgYW55KS5jcmVhdGVEYXRhQ2hhbm5lbCh0aGlzLmNvbm5lY3RpdGVyYXRvciwge25lZ290aWF0ZWQ6IHRydWUsIGlkOiB0aGlzLmNvbm5lY3RpdGVyYXRvcisrfSk7XHJcblxyXG4gICAgICAgIGxldCBvcGVuTWVzc2FnZXMgPSAwO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgcmVxdWVzdENoYW5uZWwub25vcGVuID0gKCk9PntcclxuICAgICAgICAgICAgc2VsZi5yZWFkaW5lc3Muc2V0KHRydWUpO1xyXG4gICAgICAgICAgICBzZWxmLnJlYWRpbmVzcy5mbHVzaCgpO1xyXG4gICAgICAgICAgICAoc2VsZi5vcGVuIGFzIEZ1dHVyZTx0aGlzPikucmVzb2x2ZShzZWxmKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0Q2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBvcGVuTWVzc2FnZXMrKztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhIDogc3RyaW5nID0gbWVzc2FnZS5kYXRhO1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlID0gZGF0YS5jb2RlUG9pbnRBdCgwKTtcclxuXHJcbiAgICAgICAgICAgIGlmKG9wZW5NZXNzYWdlcyA+IG1heE9wZW5NZXNzYWdlcyl7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZUNoYW5uZWwuc2VuZChTdHJpbmcuZnJvbUNvZGVQb2ludCgwLHJlZmVyZW5jZSwyLG1heE9wZW5NZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgb3Blbk1lc3NhZ2VzLS07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9ubWVzc2FnZShkYXRhLnNsaWNlKDEpKS50aGVuKHJhd1Jlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgICAgIG9wZW5NZXNzYWdlcy0tO1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDaGFubmVsLnNlbmQoU3RyaW5nLmZyb21Db2RlUG9pbnQocmVmZXJlbmNlKSArIHJhd1Jlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNhbGxiYWNrQnVmZmVyIDogKChyZXNwb25zZSA6IHN0cmluZyk9PnZvaWQpW10gPSBuZXcgQXJyYXkobWF4T3Blbk1lc3NhZ2VzKS5maWxsKG51bGwpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBib3VuY2UgYWxsIG1lc3NhZ2VzIGluIHRoZSBidWZmZXJcclxuICAgICAgICAgKiBlZmZlY3RpdmVseSBqdXN0IHJldHVybnMgYW4gZXJyb3IgZXZlcnl3aGVyZS5cclxuICAgICAgICAgKiBhbm90aGVyIGxheWVyIHNob3VsZCBkZXRlcm1pbmUgd2hhdCB0byBkbyB3aXRoIHRoYXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IGJvdW5jZSA9ICgpID0+e1xyXG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyLmZpbHRlcihlID0+IGUpLmZvckVhY2goZSA9PiBlKFN0cmluZy5mcm9tQ29kZVBvaW50KDAsMCwzKSkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RDaGFubmVsLm9uY2xvc2UgPSBib3VuY2U7IC8vdG9kbzogZGV0ZXJtaW5lIHdoZXRoZXIgdG8gY2xvc2UgY29ubmVjdGlvbiBvbiBib3VuY2UuXHJcbiAgICAgICAgcmVzcG9uc2VDaGFubmVsLm9uY2xvc2UgPSBib3VuY2U7XHJcblxyXG4gICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA6IHN0cmluZyA9IG1lc3NhZ2UuZGF0YTtcclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZSA9IGRhdGEuY29kZVBvaW50QXQoMCk7XHJcblxyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbcmVmZXJlbmNlXShkYXRhKTsgLy8gcmVtb3RlIGhhbmRsaW5nIGhhcHBlbnMgaW4gY2xvc3VyZVxyXG4gICAgICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyW3JlZmVyZW5jZV0oU3RyaW5nLmZyb21Db2RlUG9pbnQoMCwwLDQpICsgZGF0YSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vZ2dcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgb25zZXJpb3Vzb2ZmZW5zZShlLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIGJvdW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgLy9wcm9iYWJseSBraWNrIGFuZCBiYW4gcGVlclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyW3JlZmVyZW5jZV0gPSBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiAocmVxdWVzdCA6IHN0cmluZyk9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgYXZhaWxhYmxlID0gY2FsbGJhY2tCdWZmZXIubWFwKChlLCBpZHgpID0+IGUgPyBudWxsIDogaWR4KS5maWx0ZXIoZSA9PiBlKTsgLy8gbmF0dXJhbGx5IGV4Y2x1ZGVzIDBcclxuXHJcbiAgICAgICAgICAgIGlmICghYXZhaWxhYmxlLmxlbmd0aCkgcmV0dXJuIFByb21pc2UucmVqZWN0KFwib3V0YnVmZmVyIGZ1bGxcIik7XHJcblxyXG4gICAgICAgICAgICBsZXQgY3JhZnRlZCA6IHN0cmluZyA9IFN0cmluZy5mcm9tQ29kZVBvaW50KGF2YWlsYWJsZVswXSkgKyByZXF1ZXN0O1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpPT57XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja0J1ZmZlclthdmFpbGFibGVbMF1dID0gcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmNvZGVQb2ludEF0KDApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5zbGljZSgxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgQ29ubmVjdGlvbkVycm9yKHJlc3BvbnNlLmNvZGVQb2ludEF0KDIpLCByZXNwb25zZS5zbGljZSgzKSkpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlcXVlc3RDaGFubmVsLnNlbmQoY3JhZnRlZCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZCB1c2UgY3JlYXRlU3RyaW5nQ2hhbm5lbCBpbnN0ZWFkXHJcbiAgICAgKiBnaXZlcyB5b3UgYSBmdW5jdGlvbiB5b3UgY2FuIHNlbmQgYnVmZmVyIG1lc3NhZ2VzIGludG8sIHByb21pc2VzIGEgcmVzcG9uc2UuXHJcbiAgICAgKiB0b2RvOiByZW1vdmUuIGN1cnJlbnRseSBpbmNsdWRlZCBhcyByZWZlcmVuY2UuXHJcbiAgICAgKiBAcGFyYW0geyhyZXF1ZXN0OiBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj59IG9ubWVzc2FnZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heE9wZW5NZXNzYWdlc1xyXG4gICAgICogQHJldHVybnMgeyhyZXF1ZXN0OiBBcnJheUJ1ZmZlcikgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlcj59IHBpcGUgeW91ciBtZXNzYWdlcyBpbnRvIHRoaXMuIGNhdGNoIGZvciBhbnkgZXJyb3IsIGZvcmVpZ24gb3IgZG9tZXN0aWNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUmF3Q2hhbm5lbChvbm1lc3NhZ2UgOiAocmVxdWVzdCA6IEFycmF5QnVmZmVyKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPiwgbWF4T3Blbk1lc3NhZ2VzPTEwMCkgOiAocmVxdWVzdCA6IEFycmF5QnVmZmVyKSA9PiBQcm9taXNlPEFycmF5QnVmZmVyPntcclxuICAgICAgICBpZih0aGlzLnJlYWRpbmVzcy5nZXQoKSl7XHJcbiAgICAgICAgICAgIHRocm93IFwiY2hhbm5lbHMgY2FuIG9ubHkgYmUgY3JlYXRlZCBiZWZvcmUgc3RhcnRpbmcgdGhlIGNvbm5lY3Rpb24hXCJcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZXF1ZXN0Q2hhbm5lbCA9ICh0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uIGFzIGFueSkuY3JlYXRlRGF0YUNoYW5uZWwodGhpcy5jb25uZWN0aXRlcmF0b3IsIHtuZWdvdGlhdGVkOiB0cnVlLCBpZDogdGhpcy5jb25uZWN0aXRlcmF0b3IrK30pO1xyXG4gICAgICAgIGxldCByZXNwb25zZUNoYW5uZWwgPSAodGhpcy5ydGNQZWVyQ29ubmVjdGlvbiBhcyBhbnkpLmNyZWF0ZURhdGFDaGFubmVsKHRoaXMuY29ubmVjdGl0ZXJhdG9yLCB7bmVnb3RpYXRlZDogdHJ1ZSwgaWQ6IHRoaXMuY29ubmVjdGl0ZXJhdG9yKyt9KTtcclxuXHJcbiAgICAgICAgbGV0IG9wZW5NZXNzYWdlcyA9IDA7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICByZXF1ZXN0Q2hhbm5lbC5vbm9wZW4gPSAoKT0+e1xyXG4gICAgICAgICAgICBzZWxmLnJlYWRpbmVzcy5zZXQodHJ1ZSk7XHJcbiAgICAgICAgICAgIHNlbGYucmVhZGluZXNzLmZsdXNoKCk7XHJcbiAgICAgICAgICAgIChzZWxmLm9wZW4gYXMgRnV0dXJlPHRoaXM+KS5yZXNvbHZlKHNlbGYpO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICByZXF1ZXN0Q2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBvcGVuTWVzc2FnZXMrKztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhIDogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KG1lc3NhZ2UuZGF0YSk7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2UgPSBkYXRhWzBdO1xyXG5cclxuICAgICAgICAgICAgaWYob3Blbk1lc3NhZ2VzID4gbWF4T3Blbk1lc3NhZ2VzKXtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5zZW5kKG5ldyBVaW50OEFycmF5KChbMCxyZWZlcmVuY2UsMixtYXhPcGVuTWVzc2FnZXNdKSkuYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIG9wZW5NZXNzYWdlcy0tO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvbm1lc3NhZ2UoZGF0YS5zbGljZSgxKS5idWZmZXIpLnRoZW4ocmF3UmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gbmV3IFVpbnQ4QXJyYXkocmF3UmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNyYWZ0ZWQgPSBuZXcgVWludDhBcnJheShyZXNwb25zZS5sZW5ndGggKyAxKTtcclxuICAgICAgICAgICAgICAgIGNyYWZ0ZWQuc2V0KHJlc3BvbnNlLCAxKTtcclxuICAgICAgICAgICAgICAgIGNyYWZ0ZWRbMF0gPSByZWZlcmVuY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgb3Blbk1lc3NhZ2VzLS07XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZUNoYW5uZWwuc2VuZChjcmFmdGVkLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjYWxsYmFja0J1ZmZlciA6ICgocmVzcG9uc2UgOiBVaW50OEFycmF5KT0+dm9pZClbXSA9IG5ldyBBcnJheShtYXhPcGVuTWVzc2FnZXMpLmZpbGwobnVsbCk7XHJcblxyXG4gICAgICAgIGxldCBib3VuY2UgPSAoKSA9PntcclxuICAgICAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICBjYWxsYmFja0J1ZmZlci5maWx0ZXIoZSA9PiBlKS5mb3JFYWNoKGUgPT4gZShuZXcgVWludDhBcnJheShbMCwwLDNdKSkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RDaGFubmVsLm9uY2xvc2UgPSBib3VuY2U7IC8vdG9kbzogZGV0ZXJtaW5lIHdoZXRoZXIgdG8gY2xvc2UgY29ubmVjdGlvbiBvbiBib3VuY2UuXHJcbiAgICAgICAgcmVzcG9uc2VDaGFubmVsLm9uY2xvc2UgPSBib3VuY2U7XHJcblxyXG4gICAgICAgIHJlc3BvbnNlQ2hhbm5lbC5vbm1lc3NhZ2UgPSAobWVzc2FnZSA6IE1lc3NhZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShtZXNzYWdlLmRhdGEpO1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlID0gZGF0YVswXTtcclxuXHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrQnVmZmVyW3JlZmVyZW5jZV0oZGF0YSk7IC8vIGVycm9yIGhhbmRsaW5nIGhhcHBlbnMgaW4gY2xvc3VyZVxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tCdWZmZXJbcmVmZXJlbmNlXSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAvL2dnXHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vdG9kbzogcHJvYmFibHkga2ljayBhbmQgYmFuIHBlZXIuIGN1cnJlbnRseSwganVzdCBpZ25vcmVzIHRoZSBwZWVyLlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChyZXF1ZXN0IDogQXJyYXlCdWZmZXIpPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGF2YWlsYWJsZSA9IGNhbGxiYWNrQnVmZmVyLm1hcCgoZSwgaWR4KSA9PiBlID8gbnVsbCA6IGlkeCkuZmlsdGVyKGUgPT4gZSk7IC8vIG5hdHVyYWxseSBleGNsdWRlcyAwXHJcblxyXG4gICAgICAgICAgICBpZiAoIWF2YWlsYWJsZS5sZW5ndGgpIHJldHVybiBQcm9taXNlLnJlamVjdChcIm91dGJ1ZmZlciBmdWxsXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShyZXF1ZXN0KTtcclxuICAgICAgICAgICAgbGV0IGNyYWZ0ZWQgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCArIDEpO1xyXG4gICAgICAgICAgICBjcmFmdGVkLnNldChkYXRhLCAxKTtcclxuICAgICAgICAgICAgY3JhZnRlZFswXSA9IGF2YWlsYWJsZVswXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2U8QXJyYXlCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpPT57XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFja0J1ZmZlclthdmFpbGFibGVbMF1dID0gcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlWzBdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5zbGljZSgxKS5idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJyZW1vdGUgcHJvYmxlbTogXCIrcmVzcG9uc2VbMl0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlcXVlc3RDaGFubmVsLnNlbmQoY3JhZnRlZC5idWZmZXIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICBvZmZlcigpIDogUHJvbWlzZTxPZmZlcj57XHJcbiAgICAgICAgaWYodGhpcy5yZWFkaW5lc3MuZ2V0KCkpe1xyXG4gICAgICAgICAgICB0aHJvdyBcInRoaXMgY29ubmVjdGlvbiBpcyBhbHJlYWR5IGFjdGl2ZSFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5jcmVhdGVPZmZlcigpLnRoZW4oZGVzY3JpcHRpb24gPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLnNldExvY2FsRGVzY3JpcHRpb24oZGVzY3JpcHRpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHByb21pc2UgdG8gd2FpdCBmb3IgdGhlIHNkcFxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxPZmZlcj4oKGFjY2VwdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLm9uaWNlY2FuZGlkYXRlID0gZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgYWNjZXB0KHtzZHA6IHRoaXMucnRjUGVlckNvbm5lY3Rpb24ubG9jYWxEZXNjcmlwdGlvbi5zZHB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYW5zd2VyKG9mZmVyIDogT2ZmZXIpIDogUHJvbWlzZTxBbnN3ZXI+e1xyXG4gICAgICAgIGlmKHRoaXMucmVhZGluZXNzLmdldCgpKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJ0aGlzIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBhY3RpdmUhXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24uc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2ZmZXJcIixcclxuICAgICAgICAgICAgc2RwOiBvZmZlci5zZHBcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5jcmVhdGVBbnN3ZXIoKS50aGVuKGRlc2NyaXB0aW9uID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QW5zd2VyPigoYWNjZXB0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnRjUGVlckNvbm5lY3Rpb24ub25pY2VjYW5kaWRhdGUgPSBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2FuZGlkYXRlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBhY2NlcHQoe3NkcDogdGhpcy5ydGNQZWVyQ29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uLnNkcH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb21wbGV0ZShhbnN3ZXIgOiBBbnN3ZXIpIDogdm9pZHtcclxuICAgICAgICBpZih0aGlzLnJlYWRpbmVzcy5nZXQoKSl7XHJcbiAgICAgICAgICAgIHRocm93IFwidGhpcyBjb25uZWN0aW9uIGlzIGFscmVhZHkgYWN0aXZlIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJ0Y1BlZXJDb25uZWN0aW9uLnNldFJlbW90ZURlc2NyaXB0aW9uKG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICAgICAgICB0eXBlOiBcImFuc3dlclwiLFxyXG4gICAgICAgICAgICBzZHA6IGFuc3dlci5zZHBcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBTRFB7c2RwOiBzdHJpbmc7fVxyXG5pbnRlcmZhY2UgT2ZmZXIgZXh0ZW5kcyBTRFB7XHJcblxyXG59XHJcbmludGVyZmFjZSBBbnN3ZXIgZXh0ZW5kcyBTRFB7XHJcblxyXG59XHJcblxyXG5jbGFzcyBDb25uZWN0aW9uRXJyb3J7XHJcbiAgICB0eXBlOiBudW1iZXI7XHJcbiAgICBkYXRhOiBzdHJpbmc7XHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlIDogbnVtYmVyLCBkYXRhID86IHN0cmluZyl7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGxldCBydGNjb25maWcgPSB7XHJcbiAgICBpY2VTZXJ2ZXJzOiBbe3VybHM6IFwic3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMlwifV1cclxufTsiLCJpbXBvcnQge3V0ZjhEZWNvZGVyLCB1dGY4RW5jb2Rlcn0gZnJvbSBcIi4uL3Rvb2xzL3V0ZjhidWZmZXJcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUHJpdmF0ZUtleSB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5IDogUHJvbWlzZUxpa2U8YW55PjtcclxuICAgIHByaXZhdGUgcHJpdmF0ZUtleSA6IENyeXB0b0tleTtcclxuICAgIHByaXZhdGUgcHVibGljS2V5IDogUHVibGljS2V5O1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSB3aW5kb3cuY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZWRDdXJ2ZTogXCJQLTM4NFwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgW1wic2lnblwiLCBcInZlcmlmeVwiXVxyXG4gICAgICAgICAgICApLnRoZW4oa2V5cyA9PiB7IC8va2V5czoge3ByaXZhdGVLZXk6IENyeXB0b0tleSwgcHVibGljS2V5OiBDcnlwdG9LZXl9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByaXZhdGVLZXkgPSBrZXlzLnByaXZhdGVLZXk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uc3VidGxlLmV4cG9ydEtleShcclxuICAgICAgICAgICAgICAgICAgICBcImp3a1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVibGljS2V5XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KS50aGVuKGp3ayA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnB1YmxpY0tleSA9IG5ldyBQdWJsaWNLZXkoandrKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1YmxpY0tleS5yZWFkeTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbjxUPihvYmogOiBUKSA6IFByb21pc2U8VmVyRG9jPFQ+PiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeTtcclxuICAgICAgICBsZXQgZGF0YWJ1ZmZlciA9IHV0ZjhFbmNvZGVyLmVuY29kZShKU09OLnN0cmluZ2lmeShvYmopKTtcclxuICAgICAgICBsZXQgcHVrYnVmZmVyID0gdXRmOEVuY29kZXIuZW5jb2RlKHRoaXMucHVibGljS2V5LnRvSlNPTigpKTtcclxuICAgICAgICBsZXQgaGVhZGVyID0gbmV3IFVpbnQ4QXJyYXkobmV3IFVpbnQxNkFycmF5KFtkYXRhYnVmZmVyLmxlbmd0aCwgcHVrYnVmZmVyLmxlbmd0aF0pLmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBzaWduYWJsZSA9IG5ldyBVaW50OEFycmF5KDEgKyBoZWFkZXIubGVuZ3RoICsgZGF0YWJ1ZmZlci5sZW5ndGggKyBwdWtidWZmZXIubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgc2lnbmFibGVbMF0gPSAxOyAvL3ZlcnNpb24gMVxyXG4gICAgICAgIHNpZ25hYmxlLnNldChoZWFkZXIsIDEpO1xyXG4gICAgICAgIHNpZ25hYmxlLnNldChkYXRhYnVmZmVyLCAxICsgaGVhZGVyLmxlbmd0aCk7XHJcbiAgICAgICAgc2lnbmFibGUuc2V0KHB1a2J1ZmZlciwgMSArIGhlYWRlci5sZW5ndGggKyBkYXRhYnVmZmVyLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGxldCBzaWdidWZmZXIgPSBuZXcgVWludDhBcnJheShhd2FpdCB3aW5kb3cuY3J5cHRvLnN1YnRsZS5zaWduKFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICBoYXNoOiB7bmFtZTogXCJTSEEtMzg0XCJ9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aGlzLnByaXZhdGVLZXksXHJcbiAgICAgICAgICAgIHNpZ25hYmxlXHJcbiAgICAgICAgKSk7XHJcblxyXG4gICAgICAgIGxldCBwcm9kdWN0ID0gbmV3IFVpbnQ4QXJyYXkoc2lnbmFibGUubGVuZ3RoICsgc2lnYnVmZmVyLmJ5dGVMZW5ndGgpO1xyXG4gICAgICAgIHByb2R1Y3Quc2V0KHNpZ25hYmxlLCAwKTtcclxuICAgICAgICBwcm9kdWN0LnNldChzaWdidWZmZXIsIHNpZ25hYmxlLmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGxldCB2ZCA9IG5ldyBWZXJEb2M8VD4oKTtcclxuICAgICAgICB2ZC5vcmlnaW5hbCA9IHByb2R1Y3QuYnVmZmVyO1xyXG4gICAgICAgIHZkLmtleSA9IHRoaXMucHVibGljS2V5O1xyXG4gICAgICAgIHZkLmRhdGEgPSBvYmo7XHJcbiAgICAgICAgdmQuc2lnbmF0dXJlID0gc2lnYnVmZmVyLmJ1ZmZlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVmVyRG9jPFQ+e1xyXG4gICAgZGF0YTogVDtcclxuICAgIGtleTogUHVibGljS2V5O1xyXG4gICAgc2lnbmF0dXJlOiBBcnJheUJ1ZmZlcjtcclxuICAgIG9yaWdpbmFsOiBBcnJheUJ1ZmZlcjtcclxuICAgIHN0YXRpYyBhc3luYyByZWNvbnN0cnVjdDxUPihidWZmZXIgOiBBcnJheUJ1ZmZlcikgOiBQcm9taXNlPFZlckRvYzxUPj57XHJcbiAgICAgICAgbGV0IGluYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChpbmJ1ZmZlclswXSl7XHJcbiAgICAgICAgICAgIGNhc2UgMToge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxlbmd0aHMgPSBuZXcgVWludDE2QXJyYXkoaW5idWZmZXIuc2xpY2UoMSwgNSkuYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhbGVuZ3RoID0gbGVuZ3Roc1swXTtcclxuICAgICAgICAgICAgICAgIGxldCBwdWtsZW5ndGggPSBsZW5ndGhzWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwcmVkYXRhID0gdXRmOERlY29kZXIuZGVjb2RlKGluYnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZG9jID0gaW5idWZmZXIuc2xpY2UoMCwgMSArIDQgKyBkYXRhbGVuZ3RoICsgcHVrbGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGxldCBzaWcgPSBpbmJ1ZmZlci5zbGljZSgxICsgNCArIGRhdGFsZW5ndGggKyBwdWtsZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGtleSA9IGF3YWl0IG5ldyBQdWJsaWNLZXkoXHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXRmOERlY29kZXIuZGVjb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jLnNsaWNlKDEgKyA0ICsgZGF0YWxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICkucmVhZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQga2V5LnZlcmlmeShkb2MsIHNpZylcclxuICAgICAgICAgICAgICAgICl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZkID0gbmV3IFZlckRvYzxUPigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLnNpZ25hdHVyZSA9IHNpZy5idWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdmQua2V5ID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIHZkLmRhdGEgPSBKU09OLnBhcnNlKHV0ZjhEZWNvZGVyLmRlY29kZShkb2Muc2xpY2UoMSArIDQsIDEgKyA0ICsgZGF0YWxlbmd0aCkpKTtcclxuICAgICAgICAgICAgICAgICAgICB2ZC5vcmlnaW5hbCA9IGJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiYmFkIGRvY3VtZW50XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBQcm9taXNlLnJlamVjdChcInZlcnNpb24gdW5zdXBwb3J0ZWQ6IFwiK2luYnVmZmVyWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIGhhc2ggUC0zODQgU1BLSSBpbnRvICgwLDEpIGZsb2F0XHJcbmZ1bmN0aW9uIFNQS0l0b051bWVyaWMoc3BraTogQXJyYXlCdWZmZXIpIDogbnVtYmVyIHtcclxuICAgIHJldHVybiBuZXcgVWludDhBcnJheShzcGtpKS5cclxuICAgICAgICBzbGljZSgtOTYpLlxyXG4gICAgICAgIHJldmVyc2UoKS5cclxuICAgICAgICByZWR1Y2UoKGEsZSxpKT0+YStlKk1hdGgucG93KDI1NixpKSwgMCkgL1xyXG4gICAgICAgIE1hdGgucG93KDI1NiwgOTYpO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUHVibGljS2V5IHtcclxuICAgIHByaXZhdGUgcHVibGljQ3J5cHRvS2V5OiBDcnlwdG9LZXk7XHJcbiAgICBwcml2YXRlIGZsb2F0aW5nOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGp3azogSnNvbldlYktleTtcclxuICAgIHJlYWR5O1xyXG4gICAgY29uc3RydWN0b3IoandrOiBKc29uV2ViS2V5KXtcclxuICAgICAgICBsZXQgcHJvdG9KV0sgPSB7XCJjcnZcIjpcIlAtMzg0XCIsIFwiZXh0XCI6dHJ1ZSwgXCJrZXlfb3BzXCI6W1widmVyaWZ5XCJdLCBcImt0eVwiOlwiRUNcIiwgXCJ4XCI6andrW1wieFwiXSwgXCJ5XCI6andrW1wieVwiXX07XHJcbiAgICAgICAgdGhpcy5mbG9hdGluZyA9IE5hTjtcclxuICAgICAgICB0aGlzLmp3ayA9IHByb3RvSldLO1xyXG4gICAgICAgIHRoaXMucmVhZHkgPSB3aW5kb3cuY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXHJcbiAgICAgICAgICAgIFwiandrXCIsXHJcbiAgICAgICAgICAgIHRoaXMuandrLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lZEN1cnZlOiBcIlAtMzg0XCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgIFtcInZlcmlmeVwiXVxyXG4gICAgICAgICkudGhlbihwdWJsaWNDcnlwdG9LZXkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnB1YmxpY0NyeXB0b0tleSA9IHB1YmxpY0NyeXB0b0tleTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuY3J5cHRvLnN1YnRsZS5leHBvcnRLZXkoXHJcbiAgICAgICAgICAgICAgICBcInNwa2lcIixcclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGljQ3J5cHRvS2V5XHJcbiAgICAgICAgICAgICkudGhlbihzcGtpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmxvYXRpbmcgPSBTUEtJdG9OdW1lcmljKHNwa2kpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pLnRoZW4oKCk9PnRoaXMpO1xyXG4gICAgfVxyXG4gICAgaGFzaGVkKCl7XHJcbiAgICAgICAgaWYoaXNOYU4odGhpcy5mbG9hdGluZykpIHRocm93IEVycm9yKFwiTm90IFJlYWR5LlwiKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5mbG9hdGluZztcclxuICAgIH1cclxuICAgIHRvSlNPTigpe1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XCJ4XCI6IHRoaXMuandrW1wieFwiXSwgXCJ5XCI6IHRoaXMuandrW1wieVwiXX0pO1xyXG4gICAgfVxyXG4gICAgdmVyaWZ5KGRhdGE6IFVpbnQ4QXJyYXksIHNpZ25hdHVyZTogQXJyYXlCdWZmZXIpOiBQcm9taXNlTGlrZTxib29sZWFuPntcclxuICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0by5zdWJ0bGUudmVyaWZ5KFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkVDRFNBXCIsXHJcbiAgICAgICAgICAgICAgICBoYXNoOiB7bmFtZTogXCJTSEEtMzg0XCJ9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aGlzLnB1YmxpY0NyeXB0b0tleSxcclxuICAgICAgICAgICAgc2lnbmF0dXJlLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBmcm9tU3RyaW5nKGp3a3N0cmluZzogc3RyaW5nKTogUHVibGljS2V5e1xyXG4gICAgICAgIHJldHVybiBuZXcgUHVibGljS2V5KEpTT04ucGFyc2Uoandrc3RyaW5nKSk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgVGVzdHtcclxuICAgIG5hbWUgOiBzdHJpbmc7XHJcbiAgICB0ZXN0cyA6ICgoKT0+UHJvbWlzZTxib29sZWFuPilbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBpdGVtIDogbnVtYmVyID0gMDsgLy8gY3VycmVudCBpdGVtXHJcbiAgICBwcml2YXRlIHBhc3NlZCA6IG51bWJlciA9IDA7XHJcbiAgICBvdXRwdXRGdW5jdGlvbiA6IChvdXRwdXQgOiBzdHJpbmcpPT52b2lkO1xyXG4gICAgY29uc3RydWN0b3IobmFtZSA6IHN0cmluZywgb3V0cHV0RnVuY3Rpb24gOiAob3V0cHV0IDogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLm91dHB1dEZ1bmN0aW9uID0gb3V0cHV0RnVuY3Rpb247XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHBhc3Moc3RyOiBzdHJpbmcsIG9iamVjdHM6IGFueVtdKSA6IGJvb2xlYW57XHJcbiAgICAgICAgdGhpcy5wYXNzZWQrKztcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVj4pyUXCIsICdjb2xvcjogZ3JlZW47JyxcclxuICAgICAgICAgICAgXCIoXCIrKCsrdGhpcy5pdGVtKStcIi9cIit0aGlzLnRlc3RzLmxlbmd0aCtcIilcIixcclxuICAgICAgICAgICAgc3RyLFxyXG4gICAgICAgICAgICBcIml0ZW1zOiBcIiwgb2JqZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBmYWlsKHN0cjogc3RyaW5nLCBvYmplY3RzOiBhbnlbXSkgOiBib29sZWFue1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiJWPinJZcIiwgJ2NvbG9yOiByZWQ7JyxcclxuICAgICAgICAgICAgXCIoXCIrKCsrdGhpcy5pdGVtKStcIi9cIit0aGlzLnRlc3RzLmxlbmd0aCtcIilcIixcclxuICAgICAgICAgICAgc3RyLFxyXG4gICAgICAgICAgICBcIml0ZW1zOiBcIiwgb2JqZWN0cyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydChuYW1lIDogc3RyaW5nLCBhIDogYW55LCBiIDogYW55LCBjb21wYXJhdG9yIDogKGEsIGIpPT5ib29sZWFuID0gKGEsYik9PmE9PT1iKXtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2goYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgaWYoY29tcGFyYXRvcihhd2FpdCBhLCBhd2FpdCBiKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXNzKFwiYXNzZXJ0OiBcIiArIG5hbWUsIFthd2FpdCBhLCBhd2FpdCBiXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKFwiYXNzZXJ0OiBcIiArIG5hbWUsIFthd2FpdCBhLCBhd2FpdCBiXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIHJ1bigpe1xyXG4gICAgICAgIHRoaXMuaXRlbSA9IDA7XHJcbiAgICAgICAgdGhpcy5wYXNzZWQgPSAwO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgdGVzdDogXCIrIHRoaXMubmFtZStcIiAuLi5cIik7XHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodGhpcy50ZXN0cy5tYXAoZSA9PiBlKCkpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlBhc3NlZCBcIit0aGlzLnBhc3NlZCtcIi9cIit0aGlzLnRlc3RzLmxlbmd0aCtcIi4gVGhpcyBjb25jbHVkZXMgdGhlIHRlc3Qgb2YgXCIrdGhpcy5uYW1lK1wiLlwiKTtcclxuICAgICAgICB0aGlzLm91dHB1dEZ1bmN0aW9uICYmXHJcbiAgICAgICAgICAgIHRoaXMub3V0cHV0RnVuY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAoKHRoaXMucGFzc2VkID09IHRoaXMudGVzdHMubGVuZ3RoKT8gXCJTdWNjZXNzIVwiIDogXCJGYWlsZWQuXCIpXHJcbiAgICAgICAgICAgICAgICArXCIgKFwiK3RoaXMucGFzc2VkK1wiL1wiK3RoaXMudGVzdHMubGVuZ3RoK1wiKTogXCIrdGhpcy5uYW1lK1wiIHRlc3RpbmcgY29tcGxldGUuXCIpO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIEVzc2VudGlhbGx5IGRlZmVycmVkLCBidXQgaXQncyBhbHNvIGEgcHJvbWlzZS5cclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Nb3ppbGxhL0phdmFTY3JpcHRfY29kZV9tb2R1bGVzL1Byb21pc2UuanNtL0RlZmVycmVkI2JhY2t3YXJkc19mb3J3YXJkc19jb21wYXRpYmxlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRnV0dXJlPFQ+IGV4dGVuZHMgUHJvbWlzZTxUPntcclxuICAgIHJlYWRvbmx5IHJlc29sdmUgOiAodmFsdWUgOiBQcm9taXNlTGlrZTxUPiB8IFQpID0+IHZvaWQ7XHJcbiAgICByZWFkb25seSByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRvciA/OiAoXHJcbiAgICAgICAgcmVzb2x2ZSA6ICh2YWx1ZSA6IFByb21pc2VMaWtlPFQ+IHwgVCkgPT4gdm9pZCxcclxuICAgICAgICByZWplY3QgOiAocmVhc29uID86IGFueSkgPT4gdm9pZCk9PnZvaWRcclxuICAgICl7XHJcbiAgICAgICAgbGV0IHJlc29sdmVyLCByZWplY3RvcjtcclxuXHJcbiAgICAgICAgc3VwZXIoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlciA9IChyZXNvbHV0aW9uIDogVCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNvbHV0aW9uKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVqZWN0b3IgPSAocmVqZWN0aW9uIDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QocmVqZWN0aW9uKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZXI7XHJcbiAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3RvcjtcclxuXHJcbiAgICAgICAgZXhlY3V0b3IgJiYgbmV3IFByb21pc2U8VD4oZXhlY3V0b3IpLnRoZW4ocmVzb2x2ZXIpLmNhdGNoKHJlamVjdG9yKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjbGFzcyBPYnNlcnZhYmxlPFQ+IHtcclxuICAgIHByaXZhdGUgdmFsdWU6IFQ7XHJcbiAgICBwcml2YXRlIGxpc3RlbmVyczogKCh2YWx1ZTogVCkgPT4gdm9pZClbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihpbml0aWFsOiBUKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IGluaXRpYWw7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBvYnNlcnZlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQodmFsdWU6IFQpIHtcclxuICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMudmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGUgPT4gZSh2YWx1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCgpIDogVCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy9yZW1vdmUgYWxsIHN1YnNjcmliZXJzIFwibm8gbW9yZSByZWxldmFudCBjaGFuZ2VzIGhhcHBlbmluZ1wiXHJcbiAgICBmbHVzaCgpIDogdm9pZCB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMubGlzdGVuZXJzO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcbn1cclxuIiwiLy90b2RvOiBpbmNsdWRlIHBvbHlmaWxscyBmb3IgRWRnZVxyXG5leHBvcnQgY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuZXhwb3J0IGNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XHJcblxyXG4iLCJpbXBvcnQge1Rlc3R9IGZyb20gXCIuL21vZHVsZXMvdGVzdC9UZXN0XCI7XHJcbmltcG9ydCB7Q2hvcmRvaWQxfSBmcm9tIFwiLi9tb2R1bGVzL2Nob3Jkb2lkL0Nob3Jkb2lkMVwiO1xyXG5pbXBvcnQge1ByaXZhdGVLZXksIFZlckRvY30gZnJvbSBcIi4vbW9kdWxlcy9jcnlwdG8vUHJpdmF0ZUtleVwiO1xyXG5pbXBvcnQge0Nvbm5lY3Rpb259IGZyb20gXCIuL21vZHVsZXMvY29ubmVjdGlvbi9Db25uZWN0aW9uXCI7XHJcbmxldCBwcmludGYgPSAoc3RyIDogc3RyaW5nKSA9PiB7XHJcbiAgICB2YXIgaCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB2YXIgdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cik7XHJcbiAgICBoLmFwcGVuZENoaWxkKHQpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoKTtcclxufTtcclxuXHJcbihhc3luYyAoKT0+e1xyXG4gICAgbGV0IGN0ID0gbmV3IFRlc3QoXCJDaG9yZFwiLCBwcmludGYpO1xyXG5cclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQxLmRpc3RhbmNlKDAuOSwgMC4xKSwgMC4yLCAoYSwgYikgPT4gTWF0aC5hYnMoYSAtIGIpIDwgMWUtMTYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiZGlzdGFuY2UgZGlmZjwxZS0xNlwiLCBDaG9yZG9pZDEuZGlzdGFuY2UoMC4xLCAwLjEpLCAwLjAsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIENob3Jkb2lkMS5kaXN0YW5jZSgwLjQsIDAuNSksIDAuMSwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQxLmRpc3RhbmNlKDAsIDEpLCAwLjAsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcbiAgICBjdC5hc3NlcnQoXCJkaXN0YW5jZSBkaWZmPDFlLTE2XCIsIENob3Jkb2lkMS5kaXN0YW5jZSgwLjEsIDAuOSksIDAuMiwgKGEsIGIpID0+IE1hdGguYWJzKGEgLSBiKSA8IDFlLTE2KTtcclxuICAgIGN0LmFzc2VydChcImRpc3RhbmNlIGRpZmY8MWUtMTZcIiwgQ2hvcmRvaWQxLmRpc3RhbmNlKDEsIDApLCAwLjAsIChhLCBiKSA9PiBNYXRoLmFicyhhIC0gYikgPCAxZS0xNik7XHJcblxyXG4gICAgbGV0IHRpID0gbmV3IENob3Jkb2lkMSgwLjUsIDEpO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDApLCAwKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgxKSwgMCk7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyXCIsIHRpLmx0b2koMC40OTk5OSksIDYpO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlclwiLCB0aS5sdG9pKDAuNSksIDE0KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXJcIiwgdGkubHRvaSgwLjUwMDAxKSwgMjIpO1xyXG5cclxuICAgIGxldCB0aTIgPSBuZXcgQ2hvcmRvaWQxKDAuNzUsIDEpO1xyXG4gICAgY3QuYXNzZXJ0KFwiaW5kaWNlciAyXCIsIHRpMi5sdG9pKDAuMjUpLCAwKTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc0OTk5KSwgNik7XHJcbiAgICBjdC5hc3NlcnQoXCJpbmRpY2VyIDJcIiwgdGkyLmx0b2koMC43NSksIDE0KTtcclxuICAgIGN0LmFzc2VydChcImluZGljZXIgMlwiLCB0aTIubHRvaSgwLjc1MDAxKSwgMjIpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDBcIiwgdGkyLmdldCh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJhZGQgMVwiLCB0aTIuYWRkKHRvLmEsIHRvKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQodG8uYSksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDFcIiwgdGkyLmdldCgwLjkpLCB0byk7XHJcbiAgICBjdC5hc3NlcnQoXCJmZXRjaCAxXCIsIHRpMi5nZXQoMC43NCksIHRvKTtcclxuXHJcbiAgICBsZXQgdG8yID0ge2E6IDAuMTEwOSwgYjogMjM0NTEyfTtcclxuICAgIGN0LmFzc2VydChcImFkZCAyIChvdmVyd3JpdGUpXCIsIHRpMi5hZGQodG8yLmEsIHRvMiksIHRvKTtcclxuICAgIGN0LmFzc2VydChcImZldGNoIDJcIiwgdGkyLmdldCh0bzIuYSksIHRvMik7XHJcblxyXG4gICAgY3QuYXNzZXJ0KFwic3VnZ2VzdGlvbiBvcmRlclwiLCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVswXS5lZmZpY2llbmN5LCB0aTIuZ2V0U3VnZ2VzdGlvbnMoKVsxXS5lZmZpY2llbmN5LCAoYSwgYikgPT4gYSA+IGIpO1xyXG5cclxuICAgIGN0LmFzc2VydChcInJlbSAxIGZhaWxcIiwgdGkyLnJlbW92ZSh0by5hKSwgbnVsbCk7XHJcbiAgICBjdC5hc3NlcnQoXCJyZW0gMVwiLCB0aTIucmVtb3ZlKHRvMi5hKSwgdG8yKTtcclxuICAgIGN0LmFzc2VydChcInJlbSAxIGVtcHR5XCIsIHRpMi5yZW1vdmUodG8yLmEpLCBudWxsKTtcclxuICAgIGN0LnJ1bigpO1xyXG59KSgpOyAvLyBkYXRhIHN0cnVjdHVyZSAoY2hvcmRpb2lkMSkgdGVzdFxyXG5cclxuKGFzeW5jICgpPT57XHJcbiAgICBsZXQgY3IgPSBuZXcgVGVzdChcIkNyeXB0b1wiLCBwcmludGYpO1xyXG5cclxuICAgIGxldCB0byA9IHthOiAwLjExMSwgYjogMjM0NTEyfTtcclxuXHJcbiAgICBsZXQgcHJrID0gbmV3IFByaXZhdGVLZXkoKTtcclxuICAgIGxldCB2ZXJkb2MgPSBhd2FpdCBwcmsuc2lnbih0byk7XHJcbiAgICBsZXQgcmVjb25zdHJ1Y3RlZCA9IGF3YWl0IFZlckRvYy5yZWNvbnN0cnVjdCh2ZXJkb2Mub3JpZ2luYWwpO1xyXG5cclxuICAgIGNyLmFzc2VydChcInZlcmRvYyBrZXkgY29tcGFyaXNvblwiLCB2ZXJkb2Mua2V5Lmhhc2hlZCgpLCByZWNvbnN0cnVjdGVkLmtleS5oYXNoZWQoKSk7XHJcbiAgICBjci5hc3NlcnQoXCJ2ZXJkb2MgZGF0YSBjb21wYXJpc29uXCIsIEpTT04uc3RyaW5naWZ5KHZlcmRvYy5kYXRhKSwgSlNPTi5zdHJpbmdpZnkocmVjb25zdHJ1Y3RlZC5kYXRhKSk7XHJcblxyXG4gICAgY3IucnVuKCk7XHJcbn0pKCk7IC8vIGNyeXB0byB0ZXN0XHJcblxyXG4oYXN5bmMgKCk9PntcclxuICAgIGxldCBjbiA9IG5ldyBUZXN0KFwiQ29ubmVjdGlvblwiLCBwcmludGYpO1xyXG5cclxuICAgIGNsYXNzIEF7XHJcbiAgICAgICAgYSA6IHN0cmluZztcclxuICAgIH1cclxuICAgIGNsYXNzIEJ7XHJcbiAgICAgICAgYiA6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcmVzcG9uc2UgPSAoIG0gOiBBICkgOiBQcm9taXNlPEI+ID0+IHtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtiOiBtLmF9KX07XHJcblxyXG5cclxuICAgIGxldCBhID0gbmV3IENvbm5lY3Rpb24oKTtcclxuICAgIGxldCBhYyA9IGEuY3JlYXRlQ2hhbm5lbDxBLEI+KHJlc3BvbnNlKTtcclxuICAgIGxldCBiID0gbmV3IENvbm5lY3Rpb24oKTtcclxuICAgIGxldCBiYyA9IGIuY3JlYXRlQ2hhbm5lbDxBLEI+KHJlc3BvbnNlKTtcclxuXHJcbiAgICBsZXQgb2ZmZXIgPSBhd2FpdCBhLm9mZmVyKCk7XHJcbiAgICBsZXQgYW5zd2VyID0gYXdhaXQgYi5hbnN3ZXIob2ZmZXIpO1xyXG4gICAgYS5jb21wbGV0ZShhbnN3ZXIpO1xyXG5cclxuICAgIGF3YWl0IGEub3BlbjtcclxuXHJcbiAgICBjbi5hc3NlcnQoXCJjb25uZWN0aW9uIGFiIGVjaG8gd29ya3NcIiwgYXdhaXQgYWMoe2E6IFwiaGVsbG9cIn0pLnRoZW4obT0+bS5iKSwgXCJoZWxsb1wiKTtcclxuICAgIGNuLmFzc2VydChcImNvbm5lY3Rpb24gYmEgZWNobyB3b3Jrc1wiLCBhd2FpdCBiYyh7YTogXCJoZWxsb1wifSkudGhlbihtPT5tLmIpLCBcImhlbGxvXCIpO1xyXG5cclxuICAgIGNuLnJ1bigpO1xyXG59KSgpOyAvLyBjb25uZWN0aW9uIHRlc3RcclxuXHJcblxyXG5cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiIn0=