import {rtcconfig} from "./rtcconfig";
import {utf8Decoder, utf8Encoder} from "../tools/utf8buffer";
import {Observable} from "../tools/Observable";
import {Future} from "../tools/Future";

export interface RTCDataChannel extends EventTarget{
    onclose: Function;
    onerror: Function;
    onmessage: Function;
    onopen: Function;
    close();
    send(msg : string | Blob | ArrayBuffer | ArrayBufferView);
}


export class Connection{
    private rtcPeerConnection : RTCPeerConnection;
    private readonly readiness : Observable<boolean>;
    readonly open : Promise<this>; // export as promise, but future internally
    private connectiterator = 0;
    private onviolation : (error : string, data : string)=>void; //called when the partner engaged in a violation that closed the channel. consider banning.
    constructor(onviolation : (error : string, data : string)=> void = (error, data)=>{}){
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig);
        this.readiness = new Observable<boolean>(false);
        this.open = new Future<this>();
        this.onviolation = onviolation;
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
    createChannel<RequestT,ResponseT>(onmessage : RequestFunction<RequestT, ResponseT>, maxOpenMessages=100) : RequestFunction<RequestT, ResponseT>{
        let channel = this.createStringChannel(request =>{
            try{
                return onmessage(JSON.parse(request)).
                then(response => JSON.stringify(response));
            }catch(e){
                return Promise.reject("garbled message")
            }
        }, maxOpenMessages, this.onviolation);

        return (request)=>{
            return channel(JSON.stringify(request)).
            then(response => JSON.parse(response));
        };

    }

    /**
     * gives you a function you can send buffer messages into, promises a response.
     * uses strings, because firefox has problems with generic byte arrays. although.. who cares about firefox?
     * @param {(request: string) => Promise<string>} onmessage
     * @param {number} maxOpenMessages
     * @param {(error : string, data : string) => void} onseriousoffense callback on serious violation that closes the channel
     * @returns {(request: string) => Promise<string>}
     */
    createStringChannel(
        onmessage : RequestFunction<string, string>,
        maxOpenMessages=100,
        onseriousoffense=(error : string, data : string)=>{})
        : RequestFunction<string, string>
    {
        if(this.readiness.get()){
            throw "channels can only be created before starting the connection!"
        }
        let requestChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});
        let responseChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});

        let openMessages = 0;

        let self = this;
        requestChannel.onopen = ()=>{
            self.readiness.set(true);
            self.readiness.flush();
            (self.open as Future<this>).resolve(self);
        };

        requestChannel.onmessage = (message : MessageEvent) => {
            openMessages++;

            let data : string = message.data;
            let reference = data.codePointAt(0);

            if(openMessages > maxOpenMessages){
                responseChannel.send(String.fromCodePoint(0,reference,2,maxOpenMessages));
                openMessages--;
                return;
            }

            onmessage(data.slice(1)).then(rawResponse => {
                openMessages--;
                responseChannel.send(String.fromCodePoint(reference) + rawResponse);
            });
        };

        let callbackBuffer : ((response : string)=>void)[] = new Array(maxOpenMessages).fill(null);

        /**
         * bounce all messages in the buffer
         * effectively just returns an error everywhere.
         * another layer should determine what to do with that.
         */
        let bounce = () =>{
            this.rtcPeerConnection.close();
            callbackBuffer.filter(e => e).forEach(e => e(String.fromCodePoint(0,0,3)));
        };

        requestChannel.onclose = bounce; //todo: determine whether to close connection on bounce.
        responseChannel.onclose = bounce;

        responseChannel.onmessage = (message : MessageEvent) => {
            let data : string = message.data;
            let reference = data.codePointAt(0);

            try{
                try{
                    callbackBuffer[reference](data); // remote handling happens in closure
                }catch(e){
                    callbackBuffer[reference](String.fromCodePoint(0,0,4) + data)
                }
                //gg
            } catch (e) {
                onseriousoffense(e, data);
                bounce();
                //probably kick and ban peer
            }
            callbackBuffer[reference] = null;
        };

        return (request : string)=> {

            let available = callbackBuffer.map((e, idx) => e ? null : idx).filter(e => e); // naturally excludes 0

            if (!available.length) return Promise.reject("outbuffer full");

            let crafted : string = String.fromCodePoint(available[0]) + request;

            let promise = new Promise<string>((resolve, reject)=>{
                callbackBuffer[available[0]] = response => {
                    if(response.codePointAt(0)){
                        resolve(response.slice(1));
                    }
                    reject(new ConnectionError(response.codePointAt(2), response.slice(3)));
                };
            });
            requestChannel.send(crafted);
            return promise;
        }

    }

    /**
     * @deprecated use createStringChannel instead
     * gives you a function you can send buffer messages into, promises a response.
     * todo: remove. currently included as reference.
     * @param {(request: ArrayBuffer) => Promise<ArrayBuffer>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: ArrayBuffer) => Promise<ArrayBuffer>} pipe your messages into this. catch for any error, foreign or domestic
     */
    createRawChannel(onmessage : (request : ArrayBuffer) => Promise<ArrayBuffer>, maxOpenMessages=100) : (request : ArrayBuffer) => Promise<ArrayBuffer>{
        if(this.readiness.get()){
            throw "channels can only be created before starting the connection!"
        }

        let requestChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});
        let responseChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});

        let openMessages = 0;

        let self = this;
        requestChannel.onopen = ()=>{
            self.readiness.set(true);
            self.readiness.flush();
            (self.open as Future<this>).resolve(self);
        };


        requestChannel.onmessage = (message : MessageEvent) => {
            openMessages++;

            let data : Uint8Array = new Uint8Array(message.data);
            let reference = data[0];

            if(openMessages > maxOpenMessages){
                responseChannel.send(new Uint8Array(([0,reference,2,maxOpenMessages])).buffer);
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

        let callbackBuffer : ((response : Uint8Array)=>void)[] = new Array(maxOpenMessages).fill(null);

        let bounce = () =>{
            this.rtcPeerConnection.close();
            callbackBuffer.filter(e => e).forEach(e => e(new Uint8Array([0,0,3])));
        };

        requestChannel.onclose = bounce; //todo: determine whether to close connection on bounce.
        responseChannel.onclose = bounce;

        responseChannel.onmessage = (message : MessageEvent) => {
            let data : Uint8Array = new Uint8Array(message.data);
            let reference = data[0];

            try{
                callbackBuffer[reference](data); // error handling happens in closure
                callbackBuffer[reference] = null;
                //gg
            } catch (e) {
                //todo: probably kick and ban peer. currently, just ignores the peer.
            }
        };

        return (request : ArrayBuffer)=> {

            let available = callbackBuffer.map((e, idx) => e ? null : idx).filter(e => e); // naturally excludes 0

            if (!available.length) return Promise.reject("outbuffer full");

            let data = new Uint8Array(request);
            let crafted = new Uint8Array(data.length + 1);
            crafted.set(data, 1);
            crafted[0] = available[0];

            let promise = new Promise<ArrayBuffer>((resolve, reject)=>{
                callbackBuffer[available[0]] = response => {
                    if(response[0]){
                        resolve(response.slice(1).buffer);
                    }
                    reject("remote problem: "+response[2]);
                };
            });
            requestChannel.send(crafted.buffer);

            return promise;
        }
    }

     offer() : Promise<Offer>{
        if(this.readiness.get()){
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.createOffer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        // promise to wait for the sdp
        return new Promise<Offer>((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept({sdp: this.rtcPeerConnection.localDescription.sdp});
            }
        });
    }
    answer(offer : Offer) : Promise<Answer>{
        if(this.readiness.get()){
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: offer.sdp
        }));
        this.rtcPeerConnection.createAnswer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        return new Promise<Answer>((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept({sdp: this.rtcPeerConnection.localDescription.sdp});
            }
        });
    }
    complete(answer : Answer) : void{
        if(this.readiness.get()){
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp
        }));
    }

    close(){
        // should propagate into bounce, etc.
        this.rtcPeerConnection.close();
    }
}

interface SDP{sdp: string;}
export interface Offer extends SDP{

}
export interface Answer extends SDP{

}

class ConnectionError{
    type: number;
    data: string;
    constructor(type : number, data ?: string){
        this.type = type;
        this.data = data;
    }
}

export interface RequestFunction<RequestT, ResponseT>{
    (request :RequestT) : Promise<ResponseT>
}