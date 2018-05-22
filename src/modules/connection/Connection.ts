import {rtcconfig} from "./rtcconfig";
import {utf8Decoder, utf8Encoder} from "../tools/utf8buffer";
import {Observable} from "../tools/Observable";
import {Future} from "../tools/Future";
import {ConnectionError} from "./ConnectionError";
import {Synchronicity} from "../tools/Synchronicity";

export interface RTCDataChannel extends EventTarget{
    onclose: Function;
    onerror: Function;
    onmessage: Function;
    onopen: Function;
    close();
    send(msg : string | Blob | ArrayBuffer | ArrayBufferView);
}


/**
 * Represents a connection to one peer. can contain multiple channels.
 * @property open {Promise<this>} resolves when the channels are ready
 * @property closed [Promise<this>} resolves when the connection terminates normally. Rejects on mangled messages or overflown buffers. consider banning.
 */
export class Connection{
    private rtcPeerConnection : RTCPeerConnection;
    private readonly readiness : Observable<boolean>;
    readonly open : Promise<this>; // export as promise, but Synchronicity internally
    private readonly allChannelsOpen : Synchronicity; // necessary because RTC is non deterministic
    readonly closed : Promise<this>; //accept on close, reject on misbehavior
    private connectiterator = 0;

    constructor(){
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig);
        this.readiness = new Observable<boolean>(false);
        this.allChannelsOpen = new Synchronicity();
        this.open = this.allChannelsOpen.then(()=>this);
        this.closed = new Future<this>();
    }

    /**
     * All data in string.
     * gives you a function you can send buffer messages into, promises a response.
     * uses strings, because firefox has problems with generic byte arrays. although.. who cares about firefox?
     * @param {(request: string) => Promise<string>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: string) => Promise<string>}
     */
    createChannel(
        onmessage : RequestFunction<string, string>,
        maxOpenMessages=100
    )
        : RequestFunction<string, string>
    {
        if(this.readiness.get()){
            throw "channels can only be created before starting the connection!"
        }
        let requestChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});
        let responseChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectiterator, {negotiated: true, id: this.connectiterator++});

        let responseOpen = new Future<RTCDataChannel>();
        let requestOpen = new Future<RTCDataChannel>();

        this.allChannelsOpen.add(responseOpen);
        this.allChannelsOpen.add(requestOpen);

        let openMessages = 0;

        let self = this;
        requestChannel.onopen = ()=>{
            self.readiness.set(true);
            self.readiness.flush();
            requestOpen.resolve(requestChannel);
        };

        responseChannel.onopen = () => {
            responseOpen.resolve(responseChannel);
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

            onmessage(data.slice(1))
                .then(rawResponse => {
                    openMessages--;
                    try{
                        responseChannel.send(String.fromCodePoint(reference) + rawResponse);
                    }catch (e){
                        responseOpen.then(_=>{ //todo: evaluate efficacy of this. this patches bug nr 1:
                            responseChannel.send(String.fromCodePoint(reference) + rawResponse);
                        })
                        /*.catch(_=>{ //todo: evaluate potential patch for bug #1
                            console.log(_);
                            self.close();
                        });*/
                    }

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
                (self.closed as Future<this>).reject(ConnectionError.FATAL_UnexpectedResponse());
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
    complete(answer : Answer) : Promise<void>{
        if(this.readiness.get()){
            throw "this connection is already active!";
        }
        return this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp
        }));
    }

    close(){
        // should propagate into bounce, etc.
        this.rtcPeerConnection.close();
        (this.closed as Future<this>).resolve(this);
    }
}




interface SDP{sdp: string;}
export interface Offer extends SDP{

}
export interface Answer extends SDP{

}
export interface RequestFunction<RequestT, ResponseT>{
    (request :RequestT) : Promise<ResponseT>
}